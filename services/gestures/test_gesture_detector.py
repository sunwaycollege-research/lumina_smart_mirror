#!/usr/bin/env python3

import unittest
from gesture_detector import GestureDetector


class GestureDetectorTests(unittest.TestCase):
    def setUp(self) -> None:
        self.detector = GestureDetector(cooldown_frames=2, window_size=3)

    def _make_hand_with_fingers(self, extended_count: int, handedness: str = "Right") -> dict:
        landmarks = [{"x": 0.5, "y": 0.5, "z": 0.0} for _ in range(21)]
        landmarks[0] = {"x": 0.5, "y": 0.8, "z": 0.0}
        
        for pip in [6, 10, 14, 18]:
            landmarks[pip] = {"x": 0.5, "y": 0.4, "z": 0.0}
        for tip in [8, 12, 16, 20]:
            landmarks[tip] = {"x": 0.5, "y": 0.6, "z": 0.0}
            
        landmarks[2] = {"x": 0.5, "y": 0.5, "z": 0.0}
        landmarks[4] = {"x": 0.5, "y": 0.5, "z": 0.0}
        
        finger_tips_pips = [(8, 6), (12, 10), (16, 14), (20, 18)]
        for i in range(min(extended_count, 4)):
            tip, pip = finger_tips_pips[i]
            landmarks[tip] = {"x": 0.5, "y": 0.2, "z": 0.0}
            
        if extended_count == 5:
            landmarks[4] = {"x": 0.4, "y": 0.4, "z": 0.0}
            
        return {
            "handedness": handedness,
            "landmarks": landmarks,
            "landmarks_px": [{"x": l["x"] * 640, "y": l["y"] * 480, "z": 0.0} for l in landmarks],
        }

    def test_closed_fist(self) -> None:
        hand = self._make_hand_with_fingers(0)
        res = None
        for _ in range(3):
            g = self.detector.detect([hand])
            if g:
                res = g
        self.assertEqual(res, "CLOSED_FIST")

    def test_one_finger(self) -> None:
        hand = self._make_hand_with_fingers(1)
        res = None
        for _ in range(3):
            g = self.detector.detect([hand])
            if g:
                res = g
        self.assertEqual(res, "ONE_FINGER")

    def test_two_fingers(self) -> None:
        hand = self._make_hand_with_fingers(2)
        res = None
        for _ in range(3):
            g = self.detector.detect([hand])
            if g:
                res = g
        self.assertEqual(res, "TWO_FINGERS")

    def test_three_fingers(self) -> None:
        hand = self._make_hand_with_fingers(3)
        res = None
        for _ in range(3):
            g = self.detector.detect([hand])
            if g:
                res = g
        self.assertEqual(res, "THREE_FINGERS")

    def test_four_fingers(self) -> None:
        hand = self._make_hand_with_fingers(4)
        res = None
        for _ in range(3):
            g = self.detector.detect([hand])
            if g:
                res = g
        self.assertEqual(res, "FOUR_FINGERS")

    def test_five_fingers(self) -> None:
        hand = self._make_hand_with_fingers(5)
        res = None
        for _ in range(3):
            g = self.detector.detect([hand])
            if g:
                res = g
        self.assertEqual(res, "FIVE_FINGERS")

    def test_no_hands_resets_history(self) -> None:
        hand = self._make_hand_with_fingers(2)
        self.detector.detect([hand])
        self.detector.detect(None)
        res = self.detector.detect([hand])
        self.assertIsNone(res)


if __name__ == "__main__":
    unittest.main()
