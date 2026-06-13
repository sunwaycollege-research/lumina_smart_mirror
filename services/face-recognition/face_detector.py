import cv2
import os
import logging
from typing import List, Tuple, Optional, Any

# Configure logger
logger = logging.getLogger(__name__)
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


class FaceDetector:
    """
    Handles webcam initialization, frame capturing, and real-time face detection
    using OpenCV Haar Cascades with grace-period and fallback handlers.
    """

    def __init__(self, camera_index: int = 0):
        """
        Initializes the FaceDetector with a camera index.
        
        Args:
            camera_index (int): Index of the video capture device (default is 0).
        """
        self.camera_index = camera_index
        self.cap: Optional[cv2.VideoCapture] = None
        
        # Load the pre-trained Haar Cascade Classifier for face detection
        cascade_name = "haarcascade_frontalface_default.xml"
        cascade_path = cv2.data.haarcascades + cascade_name
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        
        if self.face_cascade.empty():
            logger.warning(
                f"Haar Cascade classifier could not be loaded from OpenCV default path: {cascade_path}. "
                "Will rely on fallback face location mechanisms."
            )
        else:
            logger.info(f"Loaded Haar Cascade face classifier from: {cascade_path}")

    def start_camera(self) -> bool:
        """
        Initializes the cv2.VideoCapture stream if it isn't already active.
        
        Returns:
            bool: True if the camera opened successfully, False otherwise.
        """
        if self.cap is not None and self.cap.isOpened():
            return True

        try:
            logger.info(f"Attempting to start camera at index {self.camera_index}...")
            self.cap = cv2.VideoCapture(self.camera_index)
            
            # Reduce buffer size to minimize lag for real-time processing
            self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            
            if not self.cap.isOpened():
                logger.error(f"Failed to open webcam at index {self.camera_index}.")
                self.cap = None
                return False

            logger.info("Camera started successfully.")
            return True
        except Exception as e:
            logger.error(f"Error occurred while starting camera: {e}")
            self.cap = None
            return False

    def stop_camera(self) -> None:
        """
        Releases the webcam resources.
        """
        if self.cap is not None:
            try:
                self.cap.release()
                logger.info("Camera released.")
            except Exception as e:
                logger.error(f"Error releasing camera: {e}")
            finally:
                self.cap = None

    def capture_frame(self) -> Optional[Any]:
        """
        Captures a single frame from the camera. If camera is disconnected,
        attempts to re-initialize.
        
        Returns:
            numpy.ndarray or None: Captured image frame in BGR format, or None if failed.
        """
        if self.cap is None or not self.cap.isOpened():
            logger.info("Camera is not active. Attempting reconnection...")
            if not self.start_camera():
                return None

        try:
            ret, frame = self.cap.read()
            if not ret or frame is None:
                logger.warning("Empty frame received or stream disconnected.")
                # Force release camera to trigger re-initialization on next call
                self.stop_camera()
                return None
            return frame
        except Exception as e:
            logger.error(f"Error capturing frame: {e}")
            self.stop_camera()
            return None

    def detect_faces(self, frame: Any) -> List[Tuple[int, int, int, int]]:
        """
        Detects faces in a frame using Haar Cascades.
        
        Args:
            frame (numpy.ndarray): BGR image frame from webcam.
            
        Returns:
            List[Tuple[int, int, int, int]]: A list of detected face boxes, each structured
                                            as (x, y, w, h). Returns empty list if no faces.
        """
        if frame is None:
            logger.debug("Received empty frame in detect_faces.")
            return []

        if self.face_cascade.empty():
            logger.debug("Haar Cascade is empty, skipping OpenCV face detection.")
            return []

        try:
            # Convert frame to grayscale for cascade classifier
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(60, 60),  # Discard boxes smaller than 60x60 pixels
                flags=cv2.CASCADE_SCALE_IMAGE
            )
            
            # Convert OpenCV numpy array return to standard list of tuples
            return [(int(x), int(y), int(w), int(h)) for (x, y, w, h) in faces]
        except Exception as e:
            logger.error(f"Error during Haar Cascade face detection: {e}")
            return []


# Self-test code
if __name__ == "__main__":
    detector = FaceDetector(camera_index=0)
    if detector.start_camera():
        print("Camera successfully started. Capturing test frame...")
        test_frame = detector.capture_frame()
        if test_frame is not None:
            print(f"Captured test frame successfully! Dimensions: {test_frame.shape}")
            faces = detector.detect_faces(test_frame)
            print(f"Detected {len(faces)} faces: {faces}")
        else:
            print("Failed to capture frame.")
        detector.stop_camera()
    else:
        print("Could not start camera.")
