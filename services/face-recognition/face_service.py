import os
import sys
import time
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional

from face_detector import FaceDetector
from face_recognizer import FaceRecognizer
from profile_manager import ProfileManager

# Configure logger
logger = logging.getLogger("FaceService")
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


class FaceService:
    """
    Main orchestrator for the Lumina Smart Mirror Face Recognition Service.
    Runs a 2-second polling loop to detect/recognize users and output profile states.
    """

    def __init__(self, camera_index: int = 0, update_interval: float = 2.0, max_misses: int = 3, tolerance: float = 0.4, required_streak: int = 3):
        """
        Initializes modules and paths.
        
        Args:
            camera_index (int): Webcam index.
            update_interval (float): Time in seconds between face checks (default 2.0).
            max_misses (int): Number of consecutive frames face can be missing before logging out.
            tolerance (float): Face recognition tolerance (lower => stricter). Default 0.4.
            required_streak (int): Number of consecutive recognitions required before confirming a user. Default 3.
        """
        self.update_interval = update_interval
        self.max_misses = max_misses
        self.tolerance = tolerance
        self.required_streak = required_streak
        self.recognition_streak = 0
        self.last_candidate = None
        
        # Paths setup
        self.service_dir = os.path.dirname(os.path.abspath(__file__))
        self.workspace_dir = os.path.dirname(os.path.dirname(self.service_dir))
        
        self.profiles_json = os.path.join(self.service_dir, "profiles", "users.json")
        self.encodings_json = os.path.join(self.service_dir, "profiles", "faces", "encodings.json")
        self.output_json = os.path.join(self.workspace_dir, "modules", "custom", "MMM-FaceWatcher", "face_data.json")
        
        logger.info("Initializing components...")
        self.detector = FaceDetector(camera_index=camera_index)
        self.recognizer = FaceRecognizer(self.encodings_json)
        self.profile_manager = ProfileManager(self.profiles_json)
        
        # State tracking
        self.current_user = "Unknown"
        self.miss_count = 0
        self.last_written_state: Dict[str, Any] = {}

    def update_active_user(self, recognized_user: str) -> None:
        """
        Updates the internal state machine with the current recognized user.
        Requires a streak of consecutive recognitions before confirming a user.
        Applies a grace period (max_misses) for temporary face loss.
        """
        if recognized_user != "Unknown":
            # Candidate user detected
            if recognized_user == self.last_candidate:
                self.recognition_streak += 1
            else:
                self.last_candidate = recognized_user
                self.recognition_streak = 1

            if self.recognition_streak >= self.required_streak:
                if recognized_user != self.current_user:
                    logger.info(f"User transitioned: '{self.current_user}' -> '{recognized_user}' (after {self.recognition_streak} consecutive detections)")
                    self.current_user = recognized_user
                self.miss_count = 0
                # reset streak after successful transition
                self.recognition_streak = 0
                self.last_candidate = None
        else:
            # No user recognized in this frame
            self.recognition_streak = 0
            self.last_candidate = None
            if self.current_user != "Unknown":
                self.miss_count += 1
                logger.debug(f"Active user '{self.current_user}' not seen. Miss count: {self.miss_count}/{self.max_misses}")
                if self.miss_count >= self.max_misses:
                    logger.info(f"User logged out due to absence: '{self.current_user}' -> 'Unknown'")
                    self.current_user = "Unknown"
                    self.miss_count = 0

    def write_state(self) -> None:
        """
        Retrieves active profile data and writes to the MagicMirror custom module output JSON.
        Compares core fields to avoid duplicate writes.
        """
        # If we are starting up, ensure UI is cleared (unknown state)
        if self.current_user == "Unknown":
            # Force write an unknown/guest state so UI does not show stale data
            self._write_unknown_state()
            return

        # Reload profiles to react to runtime registrations
        self.profile_manager.load_profile()
        
        profile_data = self.profile_manager.get_active_profile(self.current_user)
        
        # Check if the core state changed (excluding timestamp)
        state_changed = (
            profile_data.get("recognized") != self.last_written_state.get("recognized") or
            profile_data.get("user") != self.last_written_state.get("user") or
            profile_data.get("welcomeMessage") != self.last_written_state.get("welcomeMessage")
        )

        if not state_changed:
            logger.debug("Active profile state unchanged. Skipping write to save disk wear.")
            return

        # Add timestamp for fresh write
        profile_data["lastSeen"] = datetime.now().isoformat()
        
        try:
            # Ensure folder structure exists
            os.makedirs(os.path.dirname(self.output_json), exist_ok=True)
            
            # Write to output file
            with open(self.output_json, 'w') as f:
                json.dump(profile_data, f, indent=4)
                
            self.last_written_state = profile_data.copy()
            logger.info(f"Wrote updated state to face_data.json: {self.current_user}")
        except Exception as e:
            logger.error(f"Failed to write state file {self.output_json}: {e}")

    def _write_unknown_state(self) -> None:
        """Force write a minimal unknown/guest state to clear the UI."""
        unknown_data = {
            "recognized": False,
            "user": "",
            "welcomeMessage": "",
            "lastSeen": datetime.now().isoformat()
        }
        try:
            os.makedirs(os.path.dirname(self.output_json), exist_ok=True)
            with open(self.output_json, "w") as f:
                json.dump(unknown_data, f, indent=4)
            self.last_written_state = unknown_data.copy()
            logger.info("Wrote unknown/guest state to face_data.json")
        except Exception as e:
            logger.error(f"Failed to write unknown state file {self.output_json}: {e}")

    def run(self) -> None:
        """
        Main execution loop. Captures frames and updates profile JSON files.
        """
        logger.info("Starting face service daemon loop...")

        # Write initial guest state
        self.write_state()

        if not self.detector.start_camera():
            logger.error("Camera startup failed. Face recognition loop will wait and retry.")

        try:
            while True:
                start_time = time.time()
                
                # Check and reload encodings periodically in case a user registered
                self.recognizer.load_encodings()

                # Grab camera frame
                frame = self.detector.capture_frame()
                detected_user = "Unknown"

                if frame is not None:
                    # Detect faces using cascade
                    faces = self.detector.detect_faces(frame)
                    
                    if faces:
                        logger.debug(f"Detected {len(faces)} face(s) in frame.")
                        # Check each detected face against database
                        for face_loc in faces:
                            result = self.recognizer.recognize_face(frame, face_loc, tolerance=self.tolerance)
                            if result.get("recognized"):
                                detected_user = result["user"]
                                break  # Prioritize the first recognized face
                    else:
                        logger.debug("No faces detected in frame.")
                else:
                    logger.warning("Failed to retrieve webcam stream.")

                # Update the state machine
                self.update_active_user(detected_user)
                
                # Write current user status to JSON if changed
                self.write_state()

                # Sleep to maintain requested interval, accounting for processing time
                elapsed = time.time() - start_time
                sleep_time = max(0.01, self.update_interval - elapsed)
                time.sleep(sleep_time)

        except KeyboardInterrupt:
            logger.info("Service stopping due to user interruption.")
        finally:
            self.detector.stop_camera()
        # On graceful exit, reset UI to unknown/guest state
        self.current_user = "Unknown"
        self._write_unknown_state()
        logger.info("Face service exited – UI cleared.")


if __name__ == "__main__":
    # Standard service configuration
    service = FaceService(camera_index=0, update_interval=2.0, max_misses=3, tolerance=0.4, required_streak=3)
    # Ensure any stale JSON is cleared before starting the service loop
    service._write_unknown_state()
    service.run()
