import os
import json
import logging
import numpy as np
import cv2
from typing import Dict, List, Tuple, Optional, Any

try:
    # pyrefly: ignore [missing-import]
    from deepface import DeepFace
    _DEEPFACE_AVAILABLE = True
except ImportError:
    _DEEPFACE_AVAILABLE = False

# Configure logger
logger = logging.getLogger(__name__)
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

# DeepFace model used for all embedding generation and comparison.
# "Facenet512" gives strong accuracy; "VGG-Face" is a reliable alternative.
DEEPFACE_MODEL = "Facenet512"
DEEPFACE_DETECTOR = "opencv"   # fast built-in detector used only when extracting from full frame


class FaceRecognizer:
    """
    Manages loading/saving local 128-512D facial embeddings and performing
    cosine-similarity comparisons against faces detected on the camera stream.

    Uses DeepFace (Facenet512 model) instead of dlib/face_recognition so that
    the module works on Python 3.13 without requiring any C++ build tools.
    """

    # Cosine-distance threshold: embeddings whose distance is below this value
    # are considered a match.  Facenet512 docs recommend ~0.30 at tolerance 0.40.
    _DEFAULT_THRESHOLD = 0.30

    def __init__(self, encodings_path: str):
        """
        Initializes the FaceRecognizer with the path to the encodings JSON file.

        Args:
            encodings_path (str): Absolute or relative path to encodings.json.
        """
        self.encodings_path = encodings_path
        self.known_face_encodings: List[np.ndarray] = []
        self.known_face_names: List[str] = []
        self._deepface_ready = False
        self._init_deepface()
        self.load_encodings()

    # ------------------------------------------------------------------
    # DeepFace initialisation
    # ------------------------------------------------------------------

    def _init_deepface(self) -> None:
        """Verify DeepFace is available and mark the recognizer as ready."""
        if not _DEEPFACE_AVAILABLE:
            logger.error(
                "DeepFace is not installed. Run: pip install deepface tf-keras\n"
                "Face recognition will be disabled until the package is installed."
            )
            return

        logger.info(f"DeepFace initialising model '{DEEPFACE_MODEL}' …")
        self._deepface_ready = True
        logger.info(f"DeepFace model '{DEEPFACE_MODEL}' ready.")

    # ------------------------------------------------------------------
    # Public helpers – embedding generation
    # ------------------------------------------------------------------

    def get_embedding(self, bgr_frame: Any, face_location_cv: Tuple[int, int, int, int]) -> Optional[np.ndarray]:
        """
        Crops the face region from a BGR frame and returns its DeepFace embedding.

        Args:
            bgr_frame:          Full BGR webcam frame.
            face_location_cv:   (x, y, w, h) from OpenCV/Haar detection.

        Returns:
            numpy.ndarray of shape (512,) or None on failure.
        """
        if not self._deepface_ready:
            return None

        try:
            x, y, w, h = face_location_cv

            # Add a small margin so DeepFace alignment doesn't clip facial landmarks
            margin = int(min(w, h) * 0.10)
            h_max, w_max = bgr_frame.shape[:2]
            x1 = max(0, x - margin)
            y1 = max(0, y - margin)
            x2 = min(w_max, x + w + margin)
            y2 = min(h_max, y + h + margin)

            face_crop_bgr = bgr_frame[y1:y2, x1:x2]
            if face_crop_bgr.size == 0:
                return None

            # DeepFace.represent expects RGB
            face_crop_rgb = cv2.cvtColor(face_crop_bgr, cv2.COLOR_BGR2RGB)

            result = DeepFace.represent(
                img_path=face_crop_rgb,
                model_name=DEEPFACE_MODEL,
                detector_backend="skip",   # we already cropped the face
                enforce_detection=False,
            )
            if result:
                return np.array(result[0]["embedding"], dtype=np.float32)
        except Exception as e:
            logger.error(f"DeepFace embedding error: {e}")
        return None

    # ------------------------------------------------------------------
    # Encodings file I/O
    # ------------------------------------------------------------------

    def load_encodings(self) -> None:
        """Loads user face embeddings from the JSON database."""
        self.known_face_encodings = []
        self.known_face_names = []

        if not os.path.exists(self.encodings_path):
            logger.warning(
                f"Encodings file not found at: {self.encodings_path}. "
                "Starting with empty face database."
            )
            return

        try:
            with open(self.encodings_path, 'r') as f:
                data = json.load(f)

            for username, encodings in data.items():
                for enc in encodings:
                    self.known_face_encodings.append(np.array(enc, dtype=np.float32))
                    self.known_face_names.append(username)

            logger.info(
                f"Loaded {len(self.known_face_encodings)} face embeddings "
                f"for {len(data)} users."
            )
        except Exception as e:
            logger.error(f"Failed to load encodings from {self.encodings_path}: {e}")

    def save_encodings(self, encodings_dict: Dict[str, List[List[float]]]) -> bool:
        """
        Overwrites or saves the embeddings database to the JSON file.

        Args:
            encodings_dict: Dict mapping usernames to list of their face embeddings.

        Returns:
            bool: True if saving succeeded, False otherwise.
        """
        try:
            os.makedirs(os.path.dirname(self.encodings_path), exist_ok=True)
            with open(self.encodings_path, 'w') as f:
                json.dump(encodings_dict, f, indent=4)
            logger.info(f"Encodings saved successfully to {self.encodings_path}")
            self.load_encodings()
            return True
        except Exception as e:
            logger.error(f"Failed to save face encodings to {self.encodings_path}: {e}")
            return False

    def get_encodings_dict(self) -> Dict[str, List[List[float]]]:
        """Retrieves the current encodings file as a plain Python dictionary."""
        if not os.path.exists(self.encodings_path):
            return {}
        try:
            with open(self.encodings_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error reading encodings dictionary: {e}")
            return {}

    # ------------------------------------------------------------------
    # Recognition
    # ------------------------------------------------------------------

    @staticmethod
    def _cosine_distance(a: np.ndarray, b: np.ndarray) -> float:
        """Returns cosine distance in [0, 2]; lower means more similar."""
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0 or norm_b == 0:
            return 2.0
        return float(1.0 - np.dot(a, b) / (norm_a * norm_b))

    def recognize_face(
        self,
        bgr_frame: Any,
        face_location_cv: Tuple[int, int, int, int],
        tolerance: float = 0.40,
    ) -> Dict[str, Any]:
        """
        Recognizes a face within a specific bounding box of the frame.

        Args:
            bgr_frame:          Frame captured from webcam (BGR format).
            face_location_cv:   Face box in OpenCV format: (x, y, w, h).
            tolerance:          Recognition sensitivity.  The value is mapped to a
                                cosine-distance threshold so callers do not need to
                                change existing configuration.
                                tolerance 0.4 → cosine threshold ~0.35
                                tolerance 0.6 → cosine threshold ~0.50 (lenient)

        Returns:
            dict: {"recognized": True, "user": "Username"}
               or {"recognized": False, "user": "Unknown"}
        """
        if not self.known_face_encodings:
            return {"recognized": False, "user": "Unknown"}

        if not self._deepface_ready:
            logger.warning("DeepFace not initialised; skipping recognition.")
            return {"recognized": False, "user": "Unknown"}

        # Map the face_recognition-style tolerance (0.0–1.0) to a cosine distance
        # threshold.  face_recognition default tolerance 0.6 ≈ cosine 0.50.
        cosine_threshold = tolerance * self._DEFAULT_THRESHOLD / 0.30

        embedding = self.get_embedding(bgr_frame, face_location_cv)
        if embedding is None:
            return {"recognized": False, "user": "Unknown"}

        # Compute cosine distance to every known encoding
        distances = np.array(
            [self._cosine_distance(embedding, enc) for enc in self.known_face_encodings]
        )

        best_idx = int(np.argmin(distances))
        best_dist = float(distances[best_idx])

        logger.debug(
            f"Best match: {self.known_face_names[best_idx]} "
            f"(cosine dist={best_dist:.4f}, threshold={cosine_threshold:.4f})"
        )

        if best_dist <= cosine_threshold:
            return {"recognized": True, "user": self.known_face_names[best_idx]}

        return {"recognized": False, "user": "Unknown"}
