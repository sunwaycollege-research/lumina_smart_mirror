#!/usr/bin/env python3

import unittest

from gesture_detector import GestureDetector


class GestureDetectorTests(unittest.TestCase):
    def setUp(self) -> None:
        self.detector = GestureDetector(
            window_size=4,
            horizontal_threshold=0.10,
            vertical_threshold=0.10,
            cooldown_frames=3,
        )

    def _make_frame(
        self, x: float = 0.5, y: float = 0.5, handedness: str = "Right"
    ) -> dict:
        return {
            "handedness": handedness,
            "landmarks": [{"x": x, "y": y, "z": 0.0}],
            "landmarks_px": [{"x": x * 640, "y": y * 480, "z": 0.0}],
        }

    # Horizontal gesture tests (LEFT/RIGHT)
    def test_right_swipe_detected(self) -> None:
        frames = [self._make_frame(x) for x in [0.10, 0.12, 0.18, 0.23]]
        result = None
        for frame in frames:
            gesture = self.detector.detect([frame])
            if gesture is not None:
                result = gesture
                break
        self.assertEqual(result, "RIGHT")

    def test_left_swipe_detected(self) -> None:
        frames = [self._make_frame(x) for x in [0.80, 0.76, 0.68, 0.64]]
        result = None
        for frame in frames:
            gesture = self.detector.detect([frame])
            if gesture is not None:
                result = gesture
                break
        self.assertEqual(result, "LEFT")

    # Vertical gesture tests (UP/DOWN)
    def test_down_swipe_detected(self) -> None:
        """Test DOWN swipe (y increases)."""
        frames = [self._make_frame(y=y) for y in [0.20, 0.25, 0.32, 0.40]]
        result = None
        for frame in frames:
            gesture = self.detector.detect([frame])
            if gesture is not None:
                result = gesture
                break
        self.assertEqual(result, "DOWN")

    def test_up_swipe_detected(self) -> None:
        """Test UP swipe (y decreases)."""
        frames = [self._make_frame(y=y) for y in [0.80, 0.75, 0.68, 0.60]]
        result = None
        for frame in frames:
            gesture = self.detector.detect([frame])
            if gesture is not None:
                result = gesture
                break
        self.assertEqual(result, "UP")

    # Diagonal movement tests (dominant axis logic)
    def test_horizontal_dominates_diagonal(self) -> None:
        """Test that dominant horizontal movement is classified as LEFT/RIGHT."""
        # Large horizontal movement, small vertical movement
        frames = [
            self._make_frame(x=0.10, y=0.50),
            self._make_frame(x=0.15, y=0.52),
            self._make_frame(x=0.20, y=0.54),
            self._make_frame(x=0.25, y=0.56),
        ]
        result = None
        for frame in frames:
            gesture = self.detector.detect([frame])
            if gesture is not None:
                result = gesture
                break
        # Should be RIGHT because |deltaX| (0.15) > |deltaY| (0.06)
        self.assertEqual(result, "RIGHT")

    def test_vertical_dominates_diagonal(self) -> None:
        """Test that dominant vertical movement is classified as UP/DOWN."""
        # Small horizontal movement, large vertical movement
        frames = [
            self._make_frame(x=0.50, y=0.20),
            self._make_frame(x=0.51, y=0.25),
            self._make_frame(x=0.52, y=0.32),
            self._make_frame(x=0.53, y=0.40),
        ]
        result = None
        for frame in frames:
            gesture = self.detector.detect([frame])
            if gesture is not None:
                result = gesture
                break
        # Should be DOWN because |deltaY| (0.20) > |deltaX| (0.03)
        self.assertEqual(result, "DOWN")

    # Threshold and noise tests
    def test_no_swipe_for_small_horizontal_movement(self) -> None:
        frames = [self._make_frame(x=x) for x in [0.45, 0.47, 0.48, 0.50]]
        result = None
        for frame in frames:
            result = self.detector.detect([frame])
        self.assertIsNone(result)

    def test_no_swipe_for_small_vertical_movement(self) -> None:
        frames = [self._make_frame(y=y) for y in [0.45, 0.47, 0.48, 0.50]]
        result = None
        for frame in frames:
            result = self.detector.detect([frame])
        self.assertIsNone(result)

    # Cooldown mechanism tests
    def test_cooldown_prevents_retrigger_horizontal(self) -> None:
        frames = [self._make_frame(x=x) for x in [0.10, 0.15, 0.23, 0.30]]
        result = None
        for frame in frames:
            gesture = self.detector.detect([frame])
            if gesture is not None:
                result = gesture
                break
        self.assertEqual(result, "RIGHT")

        # Immediately feed more movement in the same direction; should be blocked by cooldown
        for x in [0.32, 0.35, 0.38]:
            secondary = self.detector.detect([self._make_frame(x=x)])
            self.assertIsNone(secondary)

        # After cooldown expires, we can trigger again with enough movement
        later = None
        for x in [0.36, 0.40, 0.50, 0.62]:
            gesture = self.detector.detect([self._make_frame(x=x)])
            if gesture is not None:
                later = gesture
                break
        self.assertEqual(later, "RIGHT")

    def test_cooldown_prevents_retrigger_vertical(self) -> None:
        frames = [self._make_frame(y=y) for y in [0.20, 0.25, 0.32, 0.40]]
        result = None
        for frame in frames:
            gesture = self.detector.detect([frame])
            if gesture is not None:
                result = gesture
                break
        self.assertEqual(result, "DOWN")

        # Immediately feed more movement in the same direction; should be blocked by cooldown
        for y in [0.42, 0.45, 0.48]:
            secondary = self.detector.detect([self._make_frame(y=y)])
            self.assertIsNone(secondary)

        # After cooldown expires, we can trigger again with enough movement
        later = None
        for y in [0.46, 0.50, 0.60, 0.72]:
            gesture = self.detector.detect([self._make_frame(y=y)])
            if gesture is not None:
                later = gesture
                break
        self.assertEqual(later, "DOWN")

    # Multi-hand tracking tests
    def test_multiple_hands_are_tracked_separately(self) -> None:
        left_hand = self._make_frame(0.80, handedness="Left")
        right_hand = self._make_frame(0.20, handedness="Right")

        self.detector.detect([left_hand, right_hand])
        self.detector.detect([
            self._make_frame(0.72, handedness="Left"),
            self._make_frame(0.30, handedness="Right"),
        ])
        result = self.detector.detect([
            self._make_frame(0.64, handedness="Left"),
            self._make_frame(0.40, handedness="Right"),
        ])
        self.assertEqual(result, "LEFT")

    def test_multiple_hands_vertical_gestures(self) -> None:
        """Test that multiple hands with different vertical gestures are tracked separately."""
        left_hand = self._make_frame(y=0.80, handedness="Left")
        right_hand = self._make_frame(y=0.20, handedness="Right")

        self.detector.detect([left_hand, right_hand])
        self.detector.detect([
            self._make_frame(y=0.72, handedness="Left"),
            self._make_frame(y=0.25, handedness="Right"),
        ])
        result = self.detector.detect([
            self._make_frame(y=0.64, handedness="Left"),
            self._make_frame(y=0.32, handedness="Right"),
        ])
        # Should detect UP from left hand (y decreases)
        self.assertEqual(result, "UP")

    # Backward compatibility test
    def test_legacy_threshold_parameter(self) -> None:
        """Test that the old 'threshold' parameter still works for backward compatibility."""
        detector = GestureDetector(
            window_size=4,
            threshold=0.10,  # Old parameter style
            cooldown_frames=3,
        )
        frames = [detector._make_frame(x) if hasattr(detector, '_make_frame')
                  else self._make_frame(x) for x in [0.10, 0.15, 0.23, 0.30]]
        
        # Just verify the detector initializes without error
        self.assertIsNotNone(detector.horizontal_threshold)
        self.assertIsNotNone(detector.vertical_threshold)
        self.assertEqual(detector.horizontal_threshold, 0.10)
        self.assertEqual(detector.vertical_threshold, 0.10)


if __name__ == "__main__":
    unittest.main()
