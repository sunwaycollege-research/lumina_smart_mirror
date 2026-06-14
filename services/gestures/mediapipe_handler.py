"""MediaPipe handler for camera capture and hand landmark extraction (tasks API).

Uses the newer mediapipe >= 0.10 tasks.vision API with RunningMode.VIDEO,
which is required for live webcam feeds (IMAGE mode only processes static frames
and misses hands in continuous video streams).

Requirements:
- mediapipe >= 0.10.0 (tasks API)
- opencv-python >= 4.5.5
- numpy
"""

from __future__ import annotations

from typing import List, Any, Optional, Dict
import logging
import time
import numpy as np

try:
    import cv2
except Exception as e:
    raise ImportError("OpenCV (cv2) is required for MediapipeHandler: " + str(e))

try:
    from mediapipe.tasks import python as mp_python
    from mediapipe.tasks.python import vision
    from mediapipe import Image, ImageFormat
except Exception as e:
    raise ImportError("mediapipe 0.10+ with tasks API is required: " + str(e))


class MediapipeHandler:
    """Handles webcam capture and MediaPipe Hands processing via tasks API (VIDEO mode).

    Args:
        camera_id: integer device id passed to `cv2.VideoCapture` (default 0).
        max_num_hands: maximum hands to detect.
        detection_confidence: minimum detection confidence for MediaPipe.
        tracking_confidence: minimum tracking confidence for MediaPipe.
    """

    def __init__(
        self,
        camera_id: int = 0,
        max_num_hands: int = 2,
        detection_confidence: float = 0.5,
        tracking_confidence: float = 0.5,
    ) -> None:
        self.camera_id = camera_id
        self.max_num_hands = max_num_hands
        self.detection_confidence = detection_confidence
        self.tracking_confidence = tracking_confidence

        self.capture: Optional[cv2.VideoCapture] = None
        self._hand_landmarker: Optional[vision.HandLandmarker] = None
        self._start_time_ms: int = 0

        self.logger = logging.getLogger(self.__class__.__name__)

    def init_camera(self) -> None:
        """Open the webcam and initialize MediaPipe HandLandmarker in VIDEO mode."""
        self.capture = cv2.VideoCapture(self.camera_id)
        if not self.capture.isOpened():
            raise RuntimeError(f"Unable to open camera id={self.camera_id}")

        import urllib.request
        import os

        model_name = "hand_landmarker.task"
        model_url = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"

        cache_dir = os.path.expanduser("~/.mediapipe_models")
        os.makedirs(cache_dir, exist_ok=True)
        model_path = os.path.join(cache_dir, model_name)

        if not os.path.exists(model_path):
            self.logger.info(f"Downloading MediaPipe hand landmark model to {model_path}...")
            try:
                urllib.request.urlretrieve(model_url, model_path)
                self.logger.info("Model downloaded successfully")
            except Exception as e:
                raise RuntimeError(f"Failed to download MediaPipe model: {e}")

        # KEY FIX: Use RunningMode.VIDEO instead of IMAGE for live webcam streams.
        # IMAGE mode is for static single-frame processing only. VIDEO mode
        # tracks hands across frames, enabling reliable real-time detection.
        options = vision.HandLandmarkerOptions(
            base_options=mp_python.BaseOptions(model_asset_path=model_path),
            running_mode=vision.RunningMode.VIDEO,
            num_hands=self.max_num_hands,
            min_hand_detection_confidence=self.detection_confidence,
            min_hand_presence_confidence=self.tracking_confidence,
            min_tracking_confidence=self.tracking_confidence,
        )
        self._hand_landmarker = vision.HandLandmarker.create_from_options(options)
        self._start_time_ms = int(time.time() * 1000)

        self.logger.info("Camera and MediaPipe HandLandmarker initialized (VIDEO mode)")

    def get_hand_landmarks(self) -> List[Dict[str, Any]]:
        """Capture one frame, run MediaPipe HandLandmarker in VIDEO mode, return landmarks.

        Returns:
            List of detected hands, each a dict with:
            - 'handedness': 'Left' or 'Right'
            - 'landmarks': list of normalized {index, x, y, z} dicts
            - 'landmarks_px': list of pixel {x, y} dicts
        """
        if self.capture is None or self._hand_landmarker is None:
            raise RuntimeError("Not initialized. Call init_camera() first.")

        ret, frame = self.capture.read()
        if not ret:
            self.logger.debug("Failed to read frame from capture")
            return []

        # Store raw frame for sharing with other services
        self._last_raw_frame = frame.copy()

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # VIDEO mode requires a monotonically increasing timestamp in milliseconds
        timestamp_ms = int(time.time() * 1000) - self._start_time_ms
        if timestamp_ms < 0:
            timestamp_ms = 0

        mp_image = Image(image_format=ImageFormat.SRGB, data=frame_rgb)
        hand_landmarker_result = self._hand_landmarker.detect_for_video(mp_image, timestamp_ms)

        hands_output: List[Dict[str, Any]] = []
        image_height, image_width = frame.shape[:2]

        handedness_lists = getattr(hand_landmarker_result, "handedness", None)

        # Try the correct attribute name for landmarks in tasks API
        landmarks_lists = getattr(hand_landmarker_result, "hand_landmarks", None)
        if not landmarks_lists:
            landmarks_lists = getattr(hand_landmarker_result, "landmarks", None)

        if handedness_lists and landmarks_lists:
            for handedness_list, hand_landmarks_list in zip(handedness_lists, landmarks_lists):
                label = "Unknown"
                if handedness_list:
                    label = getattr(handedness_list[0], "category_name", "Unknown")

                normalized_landmarks = []
                pixel_landmarks = []
                for idx, lm in enumerate(hand_landmarks_list):
                    normalized_landmarks.append({"index": idx, "x": lm.x, "y": lm.y, "z": lm.z})
                    pixel_landmarks.append({"x": int(lm.x * image_width), "y": int(lm.y * image_height)})

                hands_output.append({
                    "handedness": label,
                    "landmarks": normalized_landmarks,
                    "landmarks_px": pixel_landmarks,
                })

                self._draw_landmarks(frame, hand_landmarks_list, image_height, image_width)

        self._last_frame = frame
        return hands_output

    def _draw_landmarks(self, frame: Any, landmarks: List[Any], height: int, width: int) -> None:
        """Draw hand landmarks and connections on the frame."""
        HAND_CONNECTIONS = [
            (0, 1), (1, 2), (2, 3), (3, 4),
            (0, 5), (5, 6), (6, 7), (7, 8),
            (5, 9), (9, 10), (10, 11), (11, 12),
            (9, 13), (13, 14), (14, 15), (15, 16),
            (13, 17), (17, 18), (18, 19), (19, 20), (0, 17),
        ]
        for connection in HAND_CONNECTIONS:
            start_idx, end_idx = connection
            if start_idx < len(landmarks) and end_idx < len(landmarks):
                x0, y0 = int(landmarks[start_idx].x * width), int(landmarks[start_idx].y * height)
                x1, y1 = int(landmarks[end_idx].x * width), int(landmarks[end_idx].y * height)
                cv2.line(frame, (x0, y0), (x1, y1), (0, 0, 255), 2)
        for lm in landmarks:
            x, y = int(lm.x * width), int(lm.y * height)
            cv2.circle(frame, (x, y), 3, (0, 255, 0), -1)

    def show_last_frame(self, window_name: str = "Mediapipe Hands", overlay_text: Optional[str] = None, overlay_callback: Optional[Any] = None) -> None:
        """Show the most recently processed frame (with landmarks drawn)."""
        if not hasattr(self, "_last_frame") or self._last_frame is None:
            return

        frame = self._last_frame.copy()
        if overlay_text:
            cv2.putText(frame, overlay_text, (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2, cv2.LINE_AA)

        if overlay_callback:
            overlay_callback(frame)

        cv2.imshow(window_name, frame)

    def close(self) -> None:
        """Release camera and MediaPipe resources safely."""
        if self._hand_landmarker is not None:
            self._hand_landmarker.close()
            self._hand_landmarker = None

        if self.capture is not None:
            try:
                self.capture.release()
            finally:
                self.capture = None

        try:
            cv2.destroyAllWindows()
        except Exception:
            pass
