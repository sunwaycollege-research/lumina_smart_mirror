"""Finger count detector for Lumina Smart Mirror.

This module contains `GestureDetector` which classifies extended finger counts
(CLOSED_FIST, ONE_FINGER, TWO_FINGERS, THREE_FINGERS, FOUR_FINGERS, FIVE_FINGERS)
from MediaPipe hand landmarks.
"""

from __future__ import annotations

import time
from collections import Counter, deque
from typing import Any, Dict, List, Optional


class GestureDetector:
    """Detect extended finger counts (0 to 5 fingers) from MediaPipe hand landmarks
    with continuous temporal verification and real-time progress tracking.

    Configuration parameters:
    - `cooldown_frames`: number of frames to ignore new triggers after a confirmed gesture.
    - `window_size`: history buffer size for finger count temporal smoothing.
    - `verification_frames`: continuous frames required to verify and confirm a gesture.
    """

    def __init__(
        self,
        cooldown_frames: int = 6,
        window_size: int = 3,
        verification_frames: int = 8,
        only_read_fingers: bool = True,
        **kwargs: Any,
    ) -> None:
        self.cooldown_frames = int(cooldown_frames)
        self.window_size = max(2, int(window_size))
        # Number of continuous matching frames needed to verify/confirm a gesture
        self.verification_frames = max(2, int(verification_frames))
        self.only_read_fingers = only_read_fingers

        # Per-hand history of extended finger counts
        self._histories_fingers: Dict[str, deque[int]] = {}

        # Continuous gesture verification state
        self._candidate_gesture: Optional[str] = None
        self._candidate_count: int = 0
        self._last_confirmed_gesture: Optional[str] = None
        self._is_confirmed: bool = False

        # Last frame index when a gesture was triggered/confirmed
        self._last_trigger_frame: Dict[str, int] = {}

        # Frame counter for cooldowns
        self._frame_index = 0

    def _hand_key(self, hand: Dict[str, Any], index: int) -> str:
        """Produce a stable key for a detected hand."""
        label = hand.get("handedness")
        if isinstance(label, str) and label:
            return label
        return f"hand_{index}"

    def count_extended_fingers(self, hand: Dict[str, Any]) -> int:
        """Count the number of extended fingers based on landmarks."""
        try:
            landmarks = hand.get("landmarks", [])
            if len(landmarks) < 21:
                return -1
                
            extended = 0
            
            # Index Finger (tip: 8, pip: 6)
            if landmarks[8].get("y") < landmarks[6].get("y"):
                extended += 1
            # Middle Finger (tip: 12, pip: 10)
            if landmarks[12].get("y") < landmarks[10].get("y"):
                extended += 1
            # Ring Finger (tip: 16, pip: 14)
            if landmarks[16].get("y") < landmarks[14].get("y"):
                extended += 1
            # Pinky Finger (tip: 20, pip: 18)
            if landmarks[20].get("y") < landmarks[18].get("y"):
                extended += 1
                
            # Thumb Heuristic: Distance from Thumb TIP (4) to Index MCP (5)
            # vs Thumb MCP (2) to Index MCP (5). When thumb is extended out, tip 4 is
            # significantly further from index MCP 5 than joint 2 is.
            import math
            x4, y4 = landmarks[4].get("x"), landmarks[4].get("y")
            x2, y2 = landmarks[2].get("x"), landmarks[2].get("y")
            x5, y5 = landmarks[5].get("x"), landmarks[5].get("y")
            
            dist_tip_to_index_mcp = math.hypot(x4 - x5, y4 - y5)
            dist_mcp_to_index_mcp = math.hypot(x2 - x5, y2 - y5)
            
            if dist_tip_to_index_mcp > dist_mcp_to_index_mcp + 0.03:
                extended += 1
                    
            return extended
        except Exception:
            return -1

    def process_verification(
        self, hands: Optional[List[Dict[str, Any]]], timestamp: Optional[float] = None
    ) -> Dict[str, Any]:
        """Process current frame hands and compute continuous gesture verification state.

        Returns:
            Dict with keys:
            - 'status': 'IDLE' | 'VERIFYING' | 'CONFIRMED'
            - 'verifying_gesture': str (e.g. 'THREE_FINGERS' or 'NONE')
            - 'progress': float (0.0 to 1.0)
            - 'active_gesture': str | 'NONE' (populated only when confirmed)
        """
        self._frame_index += 1

        gesture_map = {
            0: "CLOSED_FIST",
            1: "ONE_FINGER",
            2: "TWO_FINGERS",
            3: "THREE_FINGERS",
            4: "FOUR_FINGERS",
            5: "FIVE_FINGERS",
        }

        if not hands:
            self._histories_fingers.clear()
            self._candidate_count = max(0, self._candidate_count - 2)
            if self._candidate_count == 0:
                self._candidate_gesture = None
                self._is_confirmed = False
            
            return {
                "status": "IDLE",
                "verifying_gesture": "NONE",
                "progress": 0.0,
                "active_gesture": "NONE",
            }

        detected_keys = {self._hand_key(h, i) for i, h in enumerate(hands)}
        for key in list(self._histories_fingers.keys()):
            if key not in detected_keys:
                self._histories_fingers[key].clear()

        current_frame_gesture: Optional[str] = None
        for idx, hand in enumerate(hands):
            key = self._hand_key(hand, idx)
            fingers = self.count_extended_fingers(hand)
            if fingers in gesture_map:
                hist_f = self._histories_fingers.setdefault(key, deque(maxlen=self.window_size))
                hist_f.append(fingers)
                if len(hist_f) >= 2:
                    count_freq = Counter(hist_f)
                    most_common, freq = count_freq.most_common(1)[0]
                    if freq >= 2:
                        current_frame_gesture = gesture_map[most_common]
                        break

        if current_frame_gesture is None:
            self._candidate_count = max(0, self._candidate_count - 1)
            if self._candidate_count == 0:
                self._candidate_gesture = None
                self._is_confirmed = False
            progress = round(min(1.0, float(self._candidate_count) / float(self.verification_frames)), 2)
            return {
                "status": "VERIFYING" if self._candidate_gesture and progress > 0 else "IDLE",
                "verifying_gesture": self._candidate_gesture or "NONE",
                "progress": progress,
                "active_gesture": "NONE",
            }

        # Temporal accumulation & verification logic
        if self._candidate_gesture == current_frame_gesture:
            self._candidate_count += 1
        else:
            # New candidate gesture detected
            if self._candidate_count <= 2:
                self._candidate_gesture = current_frame_gesture
                self._candidate_count = 1
                self._is_confirmed = False
            else:
                # Decouple/decay previous candidate gesture first
                self._candidate_count -= 2

        progress = round(min(1.0, float(self._candidate_count) / float(self.verification_frames)), 2)

        if progress >= 1.0:
            last_trigger = self._last_trigger_frame.get("finger", -9999)
            if not self._is_confirmed and (self._frame_index - last_trigger) > self.cooldown_frames:
                self._is_confirmed = True
                self._last_trigger_frame["finger"] = self._frame_index
                self._last_confirmed_gesture = self._candidate_gesture
                return {
                    "status": "CONFIRMED",
                    "verifying_gesture": self._candidate_gesture,
                    "progress": 1.0,
                    "active_gesture": self._candidate_gesture,
                }
            else:
                # Continuous hold state after confirmation
                return {
                    "status": "CONFIRMED",
                    "verifying_gesture": self._candidate_gesture,
                    "progress": 1.0,
                    "active_gesture": "NONE",
                }
        else:
            self._is_confirmed = False
            return {
                "status": "VERIFYING",
                "verifying_gesture": self._candidate_gesture,
                "progress": progress,
                "active_gesture": "NONE",
            }

    def detect(self, hands: Optional[List[Dict[str, Any]]], timestamp: Optional[float] = None) -> Optional[str]:
        """Process current frame hands and return confirmed gesture string or None.

        Maintains full backwards compatibility with standard gesture detection interface.
        Returns:
            'CLOSED_FIST' | 'ONE_FINGER' | 'TWO_FINGERS' | 'THREE_FINGERS' | 'FOUR_FINGERS' | 'FIVE_FINGERS' | None
        """
        res = self.process_verification(hands, timestamp)
        if res["status"] == "CONFIRMED" and res["active_gesture"] != "NONE":
            return res["active_gesture"]
        return None

    # Backwards-compatible alias
    def detect_gesture(self, landmarks: List[Any]) -> Optional[str]:
        return self.detect(landmarks)

