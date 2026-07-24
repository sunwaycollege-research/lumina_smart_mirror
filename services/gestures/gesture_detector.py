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
    """Detect extended finger counts (0 to 5 fingers) from MediaPipe hand landmarks.

    Configuration parameters:
    - `cooldown_frames`: number of frames to ignore new triggers after a finger
      pose has been reported.
    - `window_size`: history buffer size for finger count temporal smoothing.
    """

    def __init__(
        self,
        cooldown_frames: int = 6,
        window_size: int = 3,
        only_read_fingers: bool = True,
        **kwargs: Any,
    ) -> None:
        self.cooldown_frames = int(cooldown_frames)
        self.window_size = max(2, window_size)
        self.only_read_fingers = only_read_fingers

        # Per-hand history of extended finger counts
        self._histories_fingers: Dict[str, deque[int]] = {}

        # Last frame index when a gesture was triggered for each hand key
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

    def detect(self, hands: Optional[List[Dict[str, Any]]], timestamp: Optional[float] = None) -> Optional[str]:
        """Process current frame hands and return finger count gesture string.

        Returns:
            'CLOSED_FIST' | 'ONE_FINGER' | 'TWO_FINGERS' | 'THREE_FINGERS' | 'FOUR_FINGERS' | 'FIVE_FINGERS' | None
        """
        self._frame_index += 1

        if not hands:
            self._histories_fingers.clear()
            return None

        detected_keys = {self._hand_key(h, i) for i, h in enumerate(hands)}
        for key in list(self._histories_fingers.keys()):
            if key not in detected_keys:
                self._histories_fingers[key].clear()

        for idx, hand in enumerate(hands):
            key = self._hand_key(hand, idx)

            fingers = self.count_extended_fingers(hand)
            if fingers >= 0:
                hist_f = self._histories_fingers.setdefault(key, deque(maxlen=self.window_size))
                hist_f.append(fingers)

                if len(hist_f) >= 2:
                    count_freq = Counter(hist_f)
                    most_common, freq = count_freq.most_common(1)[0]
                    if freq >= 2:
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
