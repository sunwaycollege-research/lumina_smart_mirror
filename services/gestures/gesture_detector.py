"""Rule-based gesture detector for LEFT/RIGHT/UP/DOWN swipe using wrist history.

This module contains `GestureDetector` which implements a simple
time-windowed rule that tracks the wrist (landmark index 0) position
across recent frames and classifies LEFT, RIGHT, UP, or DOWN swipes
when movement exceeds a configurable threshold.

Assumptions and input format
- `landmarks` passed to `detect()` is the list returned by
  `MediapipeHandler.get_hand_landmarks()` where each hand is a dict with
  keys: `handedness`, `landmarks` (normalized x,y,z), and `landmarks_px`.
- Wrist landmark is `landmarks[0]` with normalized coordinates x, y, z in [0,1].
- x: horizontal (0=left, 1=right)
- y: vertical (0=top, 1=bottom)
- z: depth (0=close, 1=far)

Gesture detection:
- Tracks wrist position history over a sliding window of frames.
- Computes movement delta for both x (horizontal) and y (vertical).
- Determines dominant axis: if |deltaX| > |deltaY|, classify as LEFT/RIGHT;
  otherwise classify as UP/DOWN.
- Returns 'LEFT', 'RIGHT', 'UP', 'DOWN', or None.

Limitations
- This is a lightweight heuristic detector. It can be sensitive to
  noisy landmark detections and rapid camera movement.
- It does not perform multi-hand disambiguation beyond using the
  provided `handedness` label as an identifier.
- Thresholds are in normalized coordinates; you may need to tune them
  for different camera setups.
"""

from __future__ import annotations

import math
import time
from collections import deque
from typing import Any, Dict, List, Optional


class OneEuroFilter:
    """Low-latency jitter filter for noisy real-time signals (Casiez, Roussel &
    Vogel, 2012 - "1(euro) Filter"). This is the standard technique for smoothing
    hand/pointer tracking specifically because it adapts to speed: it filters
    hard when the hand is nearly still (killing jitter) and filters less when
    the hand is moving fast (killing lag), instead of a fixed moving-average
    which is always a lag/smoothness tradeoff compromise.

    This is the direct fix for "gestures aren't smooth" - raw per-frame wrist
    coordinates from MediaPipe are noisy even when the hand is stationary, and
    that noise was being diffed directly for swipe detection.
    """

    def __init__(self, min_cutoff: float = 1.0, beta: float = 0.3, d_cutoff: float = 1.0):
        self.min_cutoff = min_cutoff
        self.beta = beta
        self.d_cutoff = d_cutoff
        self._x_prev: Optional[float] = None
        self._dx_prev: float = 0.0
        self._t_prev: Optional[float] = None

    @staticmethod
    def _alpha(cutoff: float, dt: float) -> float:
        tau = 1.0 / (2 * math.pi * cutoff)
        return 1.0 / (1.0 + tau / dt)

    def filter(self, x: float, t: Optional[float] = None) -> float:
        t = time.monotonic() if t is None else t

        if self._t_prev is None:
            self._t_prev = t
            self._x_prev = x
            self._dx_prev = 0.0
            return x

        dt = max(1e-6, t - self._t_prev)

        # Estimate the derivative (speed) first, lightly smoothed.
        dx = (x - self._x_prev) / dt
        a_d = self._alpha(self.d_cutoff, dt)
        dx_hat = a_d * dx + (1 - a_d) * self._dx_prev

        # Cutoff adapts to speed: faster movement -> higher cutoff -> less lag.
        cutoff = self.min_cutoff + self.beta * abs(dx_hat)
        a = self._alpha(cutoff, dt)
        x_hat = a * x + (1 - a) * self._x_prev

        self._x_prev = x_hat
        self._dx_prev = dx_hat
        self._t_prev = t
        return x_hat


class GestureDetector:
    """Detect four-directional swipe gestures using wrist history.

    Configuration parameters:
    - `window_size`: number of frames to keep in history when computing movement
    - `horizontal_threshold`: minimum normalized horizontal delta (x-axis) required
      to trigger LEFT/RIGHT swipe (e.g., 0.12 means 12% of frame width)
    - `vertical_threshold`: minimum normalized vertical delta (y-axis) required
      to trigger UP/DOWN swipe (e.g., 0.12 means 12% of frame height)
    - `threshold`: (deprecated) legacy parameter that sets both horizontal_threshold
      and vertical_threshold when provided and explicit values are not given
    - `cooldown_frames`: number of frames to ignore new triggers for the same
      hand after a gesture has been reported
    - `min_cutoff`, `beta`: OneEuroFilter jitter-smoothing parameters (see
      OneEuroFilter docstring). Lower min_cutoff = steadier when still;
      higher beta = less lag once the hand is actually moving.
    """

    def __init__(
        self,
        window_size: int = 5,
        threshold: Optional[float] = None,
        horizontal_threshold: Optional[float] = None,
        vertical_threshold: Optional[float] = None,
        cooldown_frames: int = 6,
        enable_static_poses: bool = False,
        min_cutoff: float = 1.0,
        beta: float = 0.3,
    ) -> None:
        self.window_size = max(2, window_size)

        # Handle threshold parameter for backward compatibility
        if horizontal_threshold is None:
            horizontal_threshold = threshold if threshold is not None else 0.08
        if vertical_threshold is None:
            vertical_threshold = threshold if threshold is not None else 0.08

        self.horizontal_threshold = float(horizontal_threshold)
        self.vertical_threshold = float(vertical_threshold)
        self.cooldown_frames = int(cooldown_frames)
        self.enable_static_poses = enable_static_poses
        self.min_cutoff = float(min_cutoff)
        self.beta = float(beta)

        # Per-hand history of wrist x positions (normalized). Keyed by
        # handedness label when available, otherwise by numeric index.
        self._histories_x: Dict[str, deque[float]] = {}

        # Per-hand history of wrist y positions (normalized).
        self._histories_y: Dict[str, deque[float]] = {}

        # Per-hand jitter filters for wrist x/y (see OneEuroFilter docstring).
        # min_cutoff tuned low so a still hand stays rock-steady; beta tuned so
        # a real swipe still tracks with near-zero added lag.
        self._filters_x: Dict[str, OneEuroFilter] = {}
        self._filters_y: Dict[str, OneEuroFilter] = {}

        # Per-hand history of extended finger counts.
        self._histories_fingers: Dict[str, deque[int]] = {}

        # Last frame index when a gesture was triggered for each hand key
        self._last_trigger_frame: Dict[str, int] = {}

        # Simple frame counter to implement cooldowns
        self._frame_index = 0

    def count_extended_fingers(self, hand: Dict[str, Any]) -> int:
        """Count the number of extended fingers based on landmarks."""
        try:
            landmarks = hand.get("landmarks", [])
            if len(landmarks) < 21:
                return -1
                
            # Extended fingers check: tip y < pip/mcp y
            # Index: 8 (tip), 6 (pip)
            # Middle: 12 (tip), 10 (pip)
            # Ring: 16 (tip), 14 (pip)
            # Pinky: 20 (tip), 18 (pip)
            extended = 0
            
            # Index Finger
            if landmarks[8].get("y") < landmarks[6].get("y"):
                extended += 1
            # Middle Finger
            if landmarks[12].get("y") < landmarks[10].get("y"):
                extended += 1
            # Ring Finger
            if landmarks[16].get("y") < landmarks[14].get("y"):
                extended += 1
            # Pinky Finger
            if landmarks[20].get("y") < landmarks[18].get("y"):
                extended += 1
                
            # Thumb Heuristic: tip x compared to joint x
            handedness = hand.get("handedness", "Right")
            tip_x = landmarks[4].get("x")
            mcp_x = landmarks[2].get("x")
            
            if handedness == "Right":
                if tip_x < mcp_x - 0.04 or landmarks[4].get("y") < landmarks[2].get("y") - 0.05:
                    extended += 1
            else: # Left Hand
                if tip_x > mcp_x + 0.04 or landmarks[4].get("y") < landmarks[2].get("y") - 0.05:
                    extended += 1
                    
            return extended
        except Exception:
            return -1

    def _hand_key(self, hand: Dict[str, Any], index: int) -> str:
        """Produce a stable key for a detected hand.

        Prefer handedness label if present, else fall back to index.
        """
        label = hand.get("handedness")
        if isinstance(label, str) and label:
            return label
        return f"hand_{index}"

    def is_thumbs_up(self, hand: Dict[str, Any]) -> bool:
        try:
            landmarks = hand.get("landmarks", [])
            if len(landmarks) < 21:
                return False
            
            # Check other fingers are folded
            index_folded = landmarks[8].get("y") > landmarks[6].get("y")
            middle_folded = landmarks[12].get("y") > landmarks[10].get("y")
            ring_folded = landmarks[16].get("y") > landmarks[14].get("y")
            pinky_folded = landmarks[20].get("y") > landmarks[18].get("y")
            
            # Check thumb is pointing up
            thumb_up = landmarks[4].get("y") < landmarks[3].get("y") and landmarks[3].get("y") < landmarks[2].get("y")
            
            return index_folded and middle_folded and ring_folded and pinky_folded and thumb_up
        except Exception:
            return False

    def detect(self, hands: Optional[List[Dict[str, Any]]]) -> Optional[str]:
        """Process current frame hands and return 'LEFT', 'RIGHT', 'UP', 'DOWN', or finger gestures.

        Args:
            hands: list of hand dicts (as returned by `MediapipeHandler.get_hand_landmarks()`)

        Returns:
            'LEFT' | 'RIGHT' | 'UP' | 'DOWN' | 'CLOSED_FIST' | 'ONE_FINGER' | 'TWO_FINGERS' | 'THREE_FINGERS' | 'FOUR_FINGERS' | 'FIVE_FINGERS' | 'THUMBS_UP' | None
        """
        self._frame_index += 1

        if not hands:
            # Clear histories when no hands are detected to avoid ghost gestures
            self._histories_x.clear()
            self._histories_y.clear()
            self._histories_fingers.clear()
            self._filters_x.clear()
            self._filters_y.clear()
            return None

        # Clear histories for hands that are no longer detected
        detected_keys = {self._hand_key(h, i) for i, h in enumerate(hands)}
        for key in list(self._histories_x.keys()):
            if key not in detected_keys:
                self._histories_x[key].clear()
                self._histories_y[key].clear()
                if key in self._histories_fingers:
                    self._histories_fingers[key].clear()
                self._filters_x.pop(key, None)
                self._filters_y.pop(key, None)

        # Check each detected hand
        for idx, hand in enumerate(hands):
            key = self._hand_key(hand, idx)

            # 1. Update wrist history first (smoothed, not raw)
            try:
                wrist = hand.get("landmarks", [])[0]
                raw_x = float(wrist.get("x"))
                raw_y = float(wrist.get("y"))
            except Exception:
                continue

            filt_x = self._filters_x.setdefault(key, OneEuroFilter(min_cutoff=self.min_cutoff, beta=self.beta))
            filt_y = self._filters_y.setdefault(key, OneEuroFilter(min_cutoff=self.min_cutoff, beta=self.beta))
            now = time.monotonic()
            wrist_x = filt_x.filter(raw_x, now)
            wrist_y = filt_y.filter(raw_y, now)

            hist_x = self._histories_x.setdefault(key, deque(maxlen=self.window_size))
            hist_y = self._histories_y.setdefault(key, deque(maxlen=self.window_size))
            hist_x.append(wrist_x)
            hist_y.append(wrist_y)

            # 2. Check for Directional Swipes first (high priority for active navigation)
            if len(hist_x) >= 2 and len(hist_y) >= 2:
                # Compute movement from oldest to newest in the window
                delta_x = hist_x[-1] - hist_x[0]
                delta_y = hist_y[-1] - hist_y[0]

                # Cooldown check for swipes
                last_swipe = self._last_trigger_frame.get(key, -9999)
                if (self._frame_index - last_swipe) >= self.cooldown_frames:
                    abs_delta_x = abs(delta_x)
                    abs_delta_y = abs(delta_y)

                    if abs_delta_x > abs_delta_y:
                        if delta_x <= -self.horizontal_threshold:
                            self._last_trigger_frame[key] = self._frame_index
                            hist_x.clear()
                            hist_y.clear()
                            return "LEFT"
                        elif delta_x >= self.horizontal_threshold:
                            self._last_trigger_frame[key] = self._frame_index
                            hist_x.clear()
                            hist_y.clear()
                            return "RIGHT"
                    else:
                        if delta_y <= -self.vertical_threshold:
                            self._last_trigger_frame[key] = self._frame_index
                            hist_x.clear()
                            hist_y.clear()
                            return "UP"
                        elif delta_y >= self.vertical_threshold:
                            self._last_trigger_frame[key] = self._frame_index
                            hist_x.clear()
                            hist_y.clear()
                            return "DOWN"

            # 3. Check for Static Poses (only if the hand is relatively stationary)
            is_stationary = True
            if len(hist_x) >= 3:
                range_x = max(hist_x) - min(hist_x)
                range_y = max(hist_y) - min(hist_y)
                # If the hand is moving, don't trigger static poses (avoids noise during swipes)
                if range_x > 0.05 or range_y > 0.05:
                    is_stationary = False

            if self.enable_static_poses and is_stationary:
                # Check for Thumbs Up
                if self.is_thumbs_up(hand):
                    last_thumb = self._last_trigger_frame.get(key + "_thumb", -9999)
                    if (self._frame_index - last_thumb) > self.cooldown_frames:
                        self._last_trigger_frame[key + "_thumb"] = self._frame_index
                        return "THUMBS_UP"

                # Check for Finger Count Gestures
                fingers = self.count_extended_fingers(hand)
                if fingers >= 0:
                    hist_f = self._histories_fingers.setdefault(key, deque(maxlen=4))
                    hist_f.append(fingers)

                    if len(hist_f) >= 3:
                        from collections import Counter
                        count_freq = Counter(hist_f)
                        most_common, freq = count_freq.most_common(1)[0]
                        if freq >= 3:
                            last_finger = self._last_trigger_frame.get(key + "_finger", -9999)
                            if (self._frame_index - last_finger) > self.cooldown_frames:
                                gesture_map = {
                                    0: "CLOSED_FIST",
                                    1: "ONE_FINGER",
                                    2: "TWO_FINGERS",
                                    3: "THREE_FINGERS",
                                    4: "FOUR_FINGERS",
                                    5: "FIVE_FINGERS"
                                }
                                self._last_trigger_frame[key + "_finger"] = self._frame_index
                                return gesture_map[most_common]

        return None

    # Backwards-compatible alias
    def detect_gesture(self, landmarks: List[Any]) -> Optional[str]:
        return self.detect(landmarks)
