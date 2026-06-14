#!/usr/bin/env python3
"""Gesture recognition service entry point.

This script initializes the MediaPipe hand tracking handler, a swipe gesture
classifier, and processes webcam frames continuously. Detected gestures are
printed to the console and the demo shuts down cleanly when the user exits.

Run as a script::
    python services/gestures/gesture.py
    python services/gestures/gesture.py --headless   # no OpenCV window
"""
from __future__ import annotations

import argparse
import json
import logging
import os
import signal
import sys
import tempfile
import time
from pathlib import Path

import cv2

try:
    # Support package and script execution contexts
    from .mediapipe_handler import MediapipeHandler
    from .gesture_detector import GestureDetector
    from .visual_feedback import GestureVisualFeedback
    from .frame_server import FrameServer
except Exception:
    from mediapipe_handler import MediapipeHandler
    from gesture_detector import GestureDetector
    from visual_feedback import GestureVisualFeedback
    from frame_server import FrameServer


def _gesture_file_path() -> str:
    """Return the cross-platform path to the gesture JSON file."""
    return os.path.join(tempfile.gettempdir(), "gesture.json")


def _save_gesture(gesture: str, path: str | None = None) -> None:
    """Save the detected gesture and timestamp to a JSON file."""
    if path is None:
        path = _gesture_file_path()
    record = {"gesture": gesture, "timestamp": int(time.time())}
    try:
        target = Path(path)
        target.parent.mkdir(parents=True, exist_ok=True)
        with target.open("w", encoding="utf-8") as handle:
            json.dump(record, handle)
            handle.write("\n")
    except OSError as error:
        print(f"Failed to save gesture to {path}: {error}")


def main() -> None:
    """Initialize the webcam and gesture detector, then process frames continuously."""
    parser = argparse.ArgumentParser(description="Gesture recognition service")
    parser.add_argument("--headless", action="store_true",
                        help="Run without OpenCV display window (for background use)")
    args = parser.parse_args()

    headless = args.headless

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    logger = logging.getLogger("gesture_service")

    logger.info("Starting gesture recognition service%s", " (headless)" if headless else "")

    # Allow graceful shutdown via SIGTERM (sent by node_helper on MagicMirror stop)
    running = True

    def _handle_signal(signum, frame):
        nonlocal running
        logger.info("Received signal %s - shutting down", signum)
        running = False

    signal.signal(signal.SIGTERM, _handle_signal)
    if sys.platform != "win32":
        signal.signal(signal.SIGHUP, _handle_signal)

    mp = MediapipeHandler()
    detector = GestureDetector()
    feedback = GestureVisualFeedback(arrow_duration=0.75, dashboard_duration=2.0)

    # Start the frame server so the health dashboard can read camera frames
    frame_server = FrameServer(port=5001)
    frame_server.start()
    logger.info("Frame server started on http://127.0.0.1:5001")

    try:
        mp.init_camera()
        logger.info("Camera initialized")

        while running:
            landmarks = mp.get_hand_landmarks()
            gesture = detector.detect(landmarks)

            if gesture is not None:
                print(f"Detected gesture: {gesture}")
                _save_gesture(gesture)
                feedback.trigger(gesture)

            # Share the raw frame (without landmarks) with the health dashboard
            raw_frame = getattr(mp, "_last_raw_frame", None)
            if raw_frame is not None:
                frame_server.update(raw_frame)

            if not headless:
                mp.show_last_frame(
                    overlay_text=f"Last Gesture: {feedback.current_gesture or 'None'}",
                    overlay_callback=feedback.draw
                )

                key = cv2.waitKey(1) & 0xFF
                if key == ord("q") or key == ord("Q"):
                    logger.info("'q' pressed - exiting gesture loop")
                    break

            time.sleep(0.05)

    except KeyboardInterrupt:
        logger.info("KeyboardInterrupt received - exiting gesture loop")
    finally:
        frame_server.stop()
        mp.close()
        logger.info("Gesture service stopped")


if __name__ == "__main__":
    main()
