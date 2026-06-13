"""MediaPipe handler for camera capture and hand landmark extraction (tasks API).

This module implements a helper class that opens the default webcam using OpenCV,
runs MediaPipe HandLandmarker (via tasks.vision) on each frame, and returns hand
landmarks in a structured format suitable for gesture classification.

Requirements:
- mediapipe >= 0.10.0 (uses the tasks API)
- opencv-python >= 4.5.5
- numpy

Note: This implementation uses MediaPipe's newer tasks.vision API (0.10+)
rather than the deprecated solutions API (0.8 and earlier).

Important behaviours:
- Uses OpenCV (`cv2.VideoCapture(0)`) for camera input.
- Uses MediaPipe `tasks.vision.HandLandmarker` for hand detection/tracking.
- `get_hand_landmarks()` captures a frame, processes with HandLandmarker, draws
  onto the frame (for debugging) and returns a list of detected hands.
- The returned landmark format is a list where each entry represents a
  hand: {
      'handedness': 'Left'|'Right',
      'landmarks': [ {'index': int, 'x': float, 'y': float, 'z': float}, ... ],
      'landmarks_px': [ {'x': int, 'y': int}, ... ]
  }
  - `x,y,z` are normalized coordinates in the range [0,1] (as provided
    by MediaPipe). `landmarks_px` contains pixel coordinates useful for
    drawing or visualization.

Press 'q' in the display window to terminate the demo safely.
"""

from __future__ import annotations

from typing import List, Any, Optional, Dict
import logging
import numpy as np

try:
    import cv2
except Exception as e:  # pragma: no cover - import-time check
    raise ImportError("OpenCV (cv2) is required for MediapipeHandler: " + str(e))

try:
    from mediapipe.tasks import python as mp_python
    from mediapipe.tasks.python import vision
    from mediapipe import Image, ImageFormat
except Exception as e:
    raise ImportError("mediapipe 0.10+ with tasks API is required: " + str(e))


class MediapipeHandler:
    """Handles webcam capture and MediaPipe Hands processing via tasks API.

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

        # OpenCV capture object
        self.capture: Optional[cv2.VideoCapture] = None

        # MediaPipe HandLandmarker object
        self._hand_landmarker: Optional[vision.HandLandmarker] = None

        # Simple logger
        self.logger = logging.getLogger(self.__class__.__name__)

    def init_camera(self) -> None:
        """Open the default webcam and initialize MediaPipe HandLandmarker.

        This prepares resources needed for `get_hand_landmarks()`.
        """
        # Initialize VideoCapture for webcam input.
        self.capture = cv2.VideoCapture(self.camera_id)
        if not self.capture.isOpened():
            raise RuntimeError(f"Unable to open camera id={self.camera_id}")

        # Initialize MediaPipe HandLandmarker with chosen parameters.
        # The HandLandmarker requires a model file. We use the default MediaPipe model
        # which will be downloaded automatically if not present.
        import urllib.request
        import os
        
        model_name = "hand_landmarker.task"
        model_url = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
        
        # Create a cache directory for models
        cache_dir = os.path.expanduser("~/.mediapipe_models")
        os.makedirs(cache_dir, exist_ok=True)
        model_path = os.path.join(cache_dir, model_name)
        
        # Download model if not already present
        if not os.path.exists(model_path):
            self.logger.info(f"Downloading MediaPipe hand landmark model to {model_path}...")
            try:
                urllib.request.urlretrieve(model_url, model_path)
                self.logger.info("Model downloaded successfully")
            except Exception as e:
                raise RuntimeError(f"Failed to download MediaPipe model: {e}")
        
        options = vision.HandLandmarkerOptions(
            base_options=mp_python.BaseOptions(model_asset_path=model_path),
            running_mode=vision.RunningMode.IMAGE,
            num_hands=self.max_num_hands,
            min_hand_detection_confidence=self.detection_confidence,
            min_hand_presence_confidence=self.tracking_confidence,
        )
        self._hand_landmarker = vision.HandLandmarker.create_from_options(options)

        self.logger.info("Camera and MediaPipe HandLandmarker initialized")

    def get_hand_landmarks(self) -> List[Dict[str, Any]]:
        """Capture one frame, process it with MediaPipe HandLandmarker, draw landmarks,
        and return structured landmark data.

        Returns:
            A list of detected hands. Each hand is a dict with keys:
            - 'handedness': 'Left' or 'Right'
            - 'landmarks': list of normalized landmark dicts {index,x,y,z}
            - 'landmarks_px': list of pixel dicts {x:int,y:int}

        Notes:
            - If no frame can be read or no hands detected, returns an empty list.
            - The method also updates an internal copy of the last frame with
              landmarks drawn on it for debugging/display purposes.
        """
        if self.capture is None or self._hand_landmarker is None:
            raise RuntimeError("Camera or MediaPipe HandLandmarker not initialized. Call init_camera() first.")

        ret, frame = self.capture.read()
        if not ret:
            self.logger.debug("Failed to read frame from capture")
            return []

        # Convert the BGR image (OpenCV) to RGB for MediaPipe processing.
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Create a MediaPipe Image object for processing.
        mp_image = Image(image_format=ImageFormat.SRGB, data=frame_rgb)
        hand_landmarker_result = self._hand_landmarker.detect(mp_image)

        hands_output: List[Dict[str, Any]] = []

        image_height, image_width = frame.shape[:2]

        # The HandLandmarkerResult may expose landmarks under different
        # attribute names depending on the mediapipe version. Be defensive
        # and try common attribute names.
        handedness_lists = getattr(hand_landmarker_result, "handedness", None)
        # Possible attribute names for landmarks
        landmarks_candidates = [
            getattr(hand_landmarker_result, "landmarks", None),
            getattr(hand_landmarker_result, "hand_landmarks", None),
            getattr(hand_landmarker_result, "hand_world_landmarks", None),
        ]
        # Pick the first non-empty candidate
        landmarks_lists = None
        for cand in landmarks_candidates:
            if cand:
                landmarks_lists = cand
                break

        if handedness_lists and landmarks_lists:
            # Iterate over detected hands and handedness classifications.
            for handedness_list, hand_landmarks_list in zip(
                handedness_lists, landmarks_lists
            ):
                # Extract handedness label ('Left' or 'Right')
                if handedness_list:
                    # category_name is used by tasks API
                    label = getattr(handedness_list[0], "category_name", "Unknown")
                else:
                    label = "Unknown"

                # Build normalized landmarks list and pixel coordinates
                normalized_landmarks = []
                pixel_landmarks = []
                for idx, lm in enumerate(hand_landmarks_list):
                    normalized = {"index": idx, "x": lm.x, "y": lm.y, "z": lm.z}
                    px = {"x": int(lm.x * image_width), "y": int(lm.y * image_height)}
                    normalized_landmarks.append(normalized)
                    pixel_landmarks.append(px)

                hands_output.append(
                    {
                        "handedness": label,
                        "landmarks": normalized_landmarks,
                        "landmarks_px": pixel_landmarks,
                    }
                )

                # Draw landmarks on the original frame for debugging/display
                self._draw_landmarks(frame, hand_landmarks_list, image_height, image_width)

        # Store last frame with drawings for external display if desired
        self._last_frame = frame

        return hands_output

    def _draw_landmarks(self, frame: Any, landmarks: List[Any], height: int, width: int) -> None:
        """Draw hand landmarks and connections on the frame.

        Args:
            frame: OpenCV frame to draw on (modified in-place).
            landmarks: List of normalized hand landmarks (x, y, z in [0, 1]).
            height: Frame height in pixels.
            width: Frame width in pixels.
        """
        # Connection pairs for hand skeleton (standard MediaPipe connections)
        HAND_CONNECTIONS = [
            (0, 1), (1, 2), (2, 3), (3, 4),
            (0, 5), (5, 6), (6, 7), (7, 8),
            (5, 9), (9, 10), (10, 11), (11, 12),
            (9, 13), (13, 14), (14, 15), (15, 16),
            (13, 17), (17, 18), (18, 19), (19, 20), (0, 17),
        ]
        # Draw connections (bones) first
        for connection in HAND_CONNECTIONS:
            start_idx, end_idx = connection
            if start_idx < len(landmarks) and end_idx < len(landmarks):
                x0, y0 = int(landmarks[start_idx].x * width), int(landmarks[start_idx].y * height)
                x1, y1 = int(landmarks[end_idx].x * width), int(landmarks[end_idx].y * height)
                cv2.line(frame, (x0, y0), (x1, y1), (0, 0, 255), 2)
        # Draw landmarks (nodes) on top
        for lm in landmarks:
            x, y = int(lm.x * width), int(lm.y * height)
            cv2.circle(frame, (x, y), 3, (0, 255, 0), -1)

    def show_last_frame(self, window_name: str = "Mediapipe Hands", overlay_text: Optional[str] = None) -> None:
        """Show the most recently processed frame (with landmarks drawn).

        If no frame has been processed yet this will do nothing.

        Args:
            window_name: Name of the OpenCV display window.
            overlay_text: Optional text to render on top of the frame.
        """
        if not hasattr(self, "_last_frame") or self._last_frame is None:
            return

        frame = self._last_frame.copy()
        if overlay_text:
            cv2.putText(
                frame,
                overlay_text,
                (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (255, 255, 255),
                2,
                cv2.LINE_AA,
            )
        cv2.imshow(window_name, frame)

    def close(self) -> None:
        """Release camera and MediaPipe resources safely.

        This closes the OpenCV capture and any OpenCV windows, and closes
        the MediaPipe HandLandmarker to free resources.
        """
        if self._hand_landmarker is not None:
            self._hand_landmarker.close()
            self._hand_landmarker = None

        if self.capture is not None:
            try:
                self.capture.release()
            finally:
                self.capture = None

        # Destroy any OpenCV windows that may have been created by the demo
        try:
            cv2.destroyAllWindows()
        except Exception:
            pass


def _demo_loop(camera_id: int = 0) -> None:
    """Small demo showing live webcam with MediaPipe hand landmarks.

    Press 'q' to quit the window and release resources.
    """
    handler = MediapipeHandler(camera_id=camera_id)
    handler.init_camera()

    try:
        while True:
            hands = handler.get_hand_landmarks()
            # Print a short summary for debugging. In production this would
            # be passed to a GestureDetector.
            if hands:
                handler.logger.info(f"Detected {len(hands)} hand(s): {[h['handedness'] for h in hands]}")

            handler.show_last_frame()

            # WaitKey is required for OpenCV window events; check for 'q'
            key = cv2.waitKey(1) & 0xFF
            if key == ord("q") or key == ord("Q"):
                handler.logger.info("'q' pressed - exiting demo")
                break

    except KeyboardInterrupt:
        handler.logger.info("KeyboardInterrupt received - exiting demo")
    finally:
        handler.close()


if __name__ == "__main__":
    # Basic example to run the handler and display the webcam stream.
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    _demo_loop()
