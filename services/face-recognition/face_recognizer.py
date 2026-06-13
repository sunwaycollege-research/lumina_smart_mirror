import os
import json
import logging
import numpy as np
import cv2
import face_recognition
from typing import Dict, List, Tuple, Optional, Any

# Configure logger
logger = logging.getLogger(__name__)
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


class FaceRecognizer:
    """
    Manages loading/saving local 128D facial encodings and performing comparisons
    against faces detected on the camera stream.
    """

    def __init__(self, encodings_path: str):
        """
        Initializes the FaceRecognizer with the path to the encodings JSON file.
        
        Args:
            encodings_path (str): Absolute or relative path to encodings.json.
        """
        self.encodings_path = encodings_path
        self.known_face_encodings: List[np.ndarray] = []
        self.known_face_names: List[str] = []
        self.load_encodings()

    def load_encodings(self) -> None:
        """
        Loads user face encodings from the JSON database.
        """
        self.known_face_encodings = []
        self.known_face_names = []

        if not os.path.exists(self.encodings_path):
            logger.warning(f"Encodings file not found at: {self.encodings_path}. Starting with empty face database.")
            return

        try:
            with open(self.encodings_path, 'r') as f:
                data = json.load(f)

            for username, encodings in data.items():
                for enc in encodings:
                    # Encodings are saved as list of floats; convert back to numpy array
                    self.known_face_encodings.append(np.array(enc))
                    self.known_face_names.append(username)

            logger.info(f"Loaded {len(self.known_face_encodings)} face encodings for {len(data)} users.")
        except Exception as e:
            logger.error(f"Failed to load encodings from {self.encodings_path}: {e}")

    def save_encodings(self, encodings_dict: Dict[str, List[List[float]]]) -> bool:
        """
        Overwrites or saves the encodings database to the JSON file.
        
        Args:
            encodings_dict (dict): Dictionary mapping usernames to list of their face encodings.
            
        Returns:
            bool: True if saving succeeded, False otherwise.
        """
        try:
            os.makedirs(os.path.dirname(self.encodings_path), exist_ok=True)
            with open(self.encodings_path, 'w') as f:
                json.dump(encodings_dict, f, indent=4)
            logger.info(f"Encodings saved successfully to {self.encodings_path}")
            # Reload internal encodings
            self.load_encodings()
            return True
        except Exception as e:
            logger.error(f"Failed to save face encodings to {self.encodings_path}: {e}")
            return False

    def get_encodings_dict(self) -> Dict[str, List[List[float]]]:
        """
        Retrieves the current encodings file as a dictionary.
        
        Returns:
            Dict[str, List[List[float]]]: Dictionary of usernames to list of encodings (as float lists).
        """
        if not os.path.exists(self.encodings_path):
            return {}
        try:
            with open(self.encodings_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error reading encodings dictionary: {e}")
            return {}

    def recognize_face(self, bgr_frame: Any, face_location_cv: Tuple[int, int, int, int], tolerance: float = 0.6) -> Dict[str, Any]:
        """
        Recognizes a face within a specific bounding box of the frame.
        
        Args:
            bgr_frame (numpy.ndarray): Frame captured from webcam (in standard BGR format).
            face_location_cv (Tuple[int, int, int, int]): Face box in OpenCV format: (x, y, w, h).
            tolerance (float): Threshold distance for face match (lower is more strict; default 0.6).
            
        Returns:
            dict: Status code matching the user request structure:
                  {"recognized": True, "user": "Username"} or {"recognized": False, "user": "Unknown"}
        """
        if not self.known_face_encodings:
            return {"recognized": False, "user": "Unknown"}

        try:
            # Convert BGR (OpenCV) frame to RGB (face_recognition uses RGB)
            rgb_frame = cv2.cvtColor(bgr_frame, cv2.COLOR_BGR2RGB)
            
            # Convert OpenCV coordinates (x, y, w, h) to dlib format: (top, right, bottom, left)
            x, y, w, h = face_location_cv
            face_location_dlib = (y, x + w, y + h, x)

            # Generate encoding for this single face
            face_encodings = face_recognition.face_encodings(rgb_frame, [face_location_dlib])
            if not face_encodings:
                return {"recognized": False, "user": "Unknown"}
            
            face_encoding = face_encodings[0]

            # Perform comparisons
            matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding, tolerance=tolerance)
            face_distances = face_recognition.face_distance(self.known_face_encodings, face_encoding)

            if len(face_distances) == 0 or not any(matches):
                return {"recognized": False, "user": "Unknown"}

            # Find the best match (minimum distance)
            best_match_idx = np.argmin(face_distances)
            if matches[best_match_idx] and face_distances[best_match_idx] <= tolerance:
                username = self.known_face_names[best_match_idx]
                logger.debug(f"Match found: {username} with distance {face_distances[best_match_idx]:.4f}")
                return {"recognized": True, "user": username}

            return {"recognized": False, "user": "Unknown"}
        except Exception as e:
            logger.error(f"Error during face recognition: {e}")
            return {"recognized": False, "user": "Unknown"}
