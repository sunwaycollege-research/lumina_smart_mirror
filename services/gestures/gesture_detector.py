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

from collections import deque
from typing import Any, Dict, List, Optional


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
    """

    def __init__(
        self,
        window_size: int = 8,
        threshold: Optional[float] = None,
        horizontal_threshold: Optional[float] = None,
        vertical_threshold: Optional[float] = None,
        cooldown_frames: int = 10,
    ) -> None:
        self.window_size = max(2, window_size)

        # Handle threshold parameter for backward compatibility
        if horizontal_threshold is None:
            horizontal_threshold = threshold if threshold is not None else 0.12
        if vertical_threshold is None:
            vertical_threshold = threshold if threshold is not None else 0.12

        self.horizontal_threshold = float(horizontal_threshold)
        self.vertical_threshold = float(vertical_threshold)
        self.cooldown_frames = int(cooldown_frames)

        # Per-hand history of wrist x positions (normalized). Keyed by
        # handedness label when available, otherwise by numeric index.
        self._histories_x: Dict[str, deque[float]] = {}

        # Per-hand history of wrist y positions (normalized).
        self._histories_y: Dict[str, deque[float]] = {}

        # Last frame index when a gesture was triggered for each hand key
        self._last_trigger_frame: Dict[str, int] = {}

        # Simple frame counter to implement cooldowns
        self._frame_index = 0

    def _hand_key(self, hand: Dict[str, Any], index: int) -> str:
        """Produce a stable key for a detected hand.

        Prefer handedness label if present, else fall back to index.
        """
        label = hand.get("handedness")
        if isinstance(label, str) and label:
            return label
        return f"hand_{index}"

    def detect(self, hands: Optional[List[Dict[str, Any]]]) -> Optional[str]:
        """Process current frame hands and return 'LEFT', 'RIGHT', 'UP', 'DOWN', or None.

        Args:
            hands: list of hand dicts (as returned by `MediapipeHandler.get_hand_landmarks()`)

        Returns:
            'LEFT' | 'RIGHT' | 'UP' | 'DOWN' | None
        """
        self._frame_index += 1

        if not hands:
            # No hands detected: decay nothing but keep advancing frame index
            return None

        # Check each detected hand for a swipe
        for idx, hand in enumerate(hands):
            key = self._hand_key(hand, idx)

            # Extract wrist x,y in normalized coordinates. Expect `landmarks` list
            # of dicts with keys 'x' and 'y'. Be defensive against unexpected formats.
            try:
                landmarks = hand.get("landmarks", [])
                wrist = landmarks[0]
                wrist_x = float(wrist.get("x"))
                wrist_y = float(wrist.get("y"))

            except Exception:
                # Can't extract wrist position for this hand
                continue

            hist_x = self._histories_x.setdefault(key, deque(maxlen=self.window_size))
            hist_y = self._histories_y.setdefault(key, deque(maxlen=self.window_size))
            hist_x.append(wrist_x)
            hist_y.append(wrist_y)

            # Need at least two samples to compute delta
            if len(hist_x) < 2 or len(hist_y) < 2:
                continue

            # Compute movement from oldest to newest in the window
            delta_x = hist_x[-1] - hist_x[0]
            delta_y = hist_y[-1] - hist_y[0]

            # Cooldown check
            last = self._last_trigger_frame.get(key, -9999)
            if (self._frame_index - last) < self.cooldown_frames:
                # Still in cooldown for this hand
                continue

            # Determine dominant axis and classify gesture
            abs_delta_x = abs(delta_x)
            abs_delta_y = abs(delta_y)

            # If horizontal movement dominates, check for LEFT/RIGHT
            if abs_delta_x > abs_delta_y:
                if delta_x <= -self.horizontal_threshold:
                    # Significant movement to the left
                    self._last_trigger_frame[key] = self._frame_index
                    hist_x.clear()
                    hist_y.clear()
                    return "LEFT"
                if delta_x >= self.horizontal_threshold:
                    # Significant movement to the right
                    self._last_trigger_frame[key] = self._frame_index
                    hist_x.clear()
                    hist_y.clear()
                    return "RIGHT"
            # If vertical movement dominates, check for UP/DOWN
            else:
                if delta_y <= -self.vertical_threshold:
                    # Significant upward movement (y decreases when moving up)
                    self._last_trigger_frame[key] = self._frame_index
                    hist_x.clear()
                    hist_y.clear()
                    return "UP"
                if delta_y >= self.vertical_threshold:
                    # Significant downward movement (y increases when moving down)
                    self._last_trigger_frame[key] = self._frame_index
                    hist_x.clear()
                    hist_y.clear()
                    return "DOWN"

        return None

    # Backwards-compatible alias
    def detect_gesture(self, landmarks: List[Any]) -> Optional[str]:
        return self.detect(landmarks)
