#!/usr/bin/env python3
"""Gesture recognition service entry point.

This script initializes the MediaPipe hand tracking handler, a swipe gesture
classifier, and processes webcam frames continuously. Detected gestures are
printed to the console and the demo shuts down cleanly when the user exits.

Run as a script::
    python services/gestures/gesture.py
"""
from __future__ import annotations

import json
import logging
import time
from pathlib import Path

import cv2

try:
    # Support package and script execution contexts
    from .mediapipe_handler import MediapipeHandler
    from .gesture_detector import GestureDetector
except Exception:
    from mediapipe_handler import MediapipeHandler
    from gesture_detector import GestureDetector


def _save_gesture(gesture: str, path: str = "/tmp/gesture.json") -> None:
    """Save the detected gesture and timestamp to a JSON file."""
    record = {"gesture": gesture, "timestamp": int(time.time())}
    try:
        target = Path(path)
        target.parent.mkdir(parents=True, exist_ok=True)
        with target.open("w", encoding="utf-8") as handle:
            json.dump(record, handle)
            handle.write("\n")
        print(f"Gesture saved: {gesture} -> {path}")
    except OSError as error:
        print(f"Failed to save gesture to {path}: {error}")


def main() -> None:
    """Initialize the webcam and gesture detector, then process frames continuously."""
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    logger = logging.getLogger("gesture_service")

    logger.info("Starting gesture recognition service")

    mp = MediapipeHandler()
    detector = GestureDetector()

    try:
        mp.init_camera()
        logger.info("Camera initialized")

        while True:
            landmarks = mp.get_hand_landmarks()
            gesture = detector.detect(landmarks)

            if gesture is not None:
                print(f"Detected gesture: {gesture}")
                _save_gesture(gesture)

            mp.show_last_frame(overlay_text=f"Gesture: {gesture or 'None'}")

            key = cv2.waitKey(1) & 0xFF
            if key == ord("q") or key == ord("Q"):
                logger.info("'q' pressed - exiting gesture loop")
                break

            time.sleep(0.05)

    except KeyboardInterrupt:
        logger.info("KeyboardInterrupt received - exiting gesture loop")
    finally:
        mp.close()
        logger.info("Gesture service stopped")


if __name__ == "__main__":
    main()
