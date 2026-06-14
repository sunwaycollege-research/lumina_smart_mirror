import os
import cv2
import time
import json
import logging
import re
from typing import List, Dict, Any, Optional

from face_detector import FaceDetector
from face_recognizer import FaceRecognizer
from profile_manager import ProfileManager

# Configure logger
logger = logging.getLogger(__name__)
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


def validate_username(username: str) -> bool:
    """
    Validates that the username contains only letters, numbers, hyphens, and underscores.
    Must be between 2 and 30 characters.
    """
    if not username:
        return False
    return bool(re.match(r"^[a-zA-Z0-9_-]{2,30}$", username))


def _find_camera_index(max_index: int = 2) -> int | None:
    """
    Probes camera indices 0 through max_index and returns the first one
    that OpenCV can open successfully.  Returns None if no camera is found.
    """
    for idx in range(max_index + 1):
        cap = cv2.VideoCapture(idx)
        if cap is not None and cap.isOpened():
            cap.release()
            logger.info(f"Auto-detected camera at index {idx}.")
            return idx
        if cap is not None:
            cap.release()
    logger.error(f"No camera found at indices 0–{max_index}.")
    return None


def register_user(username: str) -> None:
    """
    Registers a new user by capturing face images from the webcam, generating
    DeepFace embeddings, and writing profile details.

    Args:
        username (str): The unique identifier for the user.
    """
    # Define absolute paths
    service_dir = os.path.dirname(os.path.abspath(__file__))
    profiles_json = os.path.join(service_dir, "profiles", "users.json")
    encodings_json = os.path.join(service_dir, "profiles", "faces", "encodings.json")
    faces_dir = os.path.join(service_dir, "profiles", "faces", username)

    # Initialize managers
    pm = ProfileManager(profiles_json)
    recognizer = FaceRecognizer(encodings_json)

    # Auto-detect the first available camera index (tries 0, 1, 2)
    camera_index = _find_camera_index()
    if camera_index is None:
        print("[ERROR] No camera found at indices 0, 1, or 2. Please check camera connections.")
        return
    detector = FaceDetector(camera_index=camera_index)

    # Abort early if DeepFace failed to load
    if not recognizer._deepface_ready:
        print(
            "\n[ERROR] DeepFace is not installed or failed to initialise.\n"
            "Run:  pip install deepface tf-keras\n"
            "Then re-run this script."
        )
        return

    # 1. Validation and Checks
    if not validate_username(username):
        print("\n[ERROR] Invalid username. Use only alphanumeric characters, underscores, or hyphens (2-30 chars).")
        return

    # Check for duplicate user
    existing_profiles = pm.load_profile()
    if username in existing_profiles:
        choice = input(f"\n[WARNING] User '{username}' already exists. Overwrite profile & face? (y/n): ").strip().lower()
        if choice != 'y':
            print("Registration cancelled.")
            return
        print(f"Overwriting user '{username}'...")

    # 2. Gather Profile Info
    print("\n--- Enter Profile Information ---")
    display_name = input(f"Display Name [{username}]: ").strip() or username
    role = input("User Role (e.g. Student, Professor, Guest) [Student]: ").strip() or "Student"
    theme = input("Preferred UI Theme (dark/light) [dark]: ").strip().lower() or "dark"
    if theme not in ["dark", "light"]:
        theme = "dark"
    welcome_message = input(f"Custom Welcome Message [Welcome back {display_name}]: ").strip()
    if not welcome_message:
        welcome_message = f"Welcome back {display_name}"

    # 3. Start Camera and Capture Images
    print("\n--- Starting Camera Stream ---")
    print("Please look directly at the camera. Capturing 5 face samples automatically...")
    if not detector.start_camera():
        print("[ERROR] Could not open camera. Please check camera connections.")
        return

    os.makedirs(faces_dir, exist_ok=True)
    captured_encodings: List[List[float]] = []
    sample_count = 0
    max_samples = 5
    consecutive_empty_frames = 0
    show_preview = True

    try:
        while sample_count < max_samples:
            frame = detector.capture_frame()
            if frame is None:
                consecutive_empty_frames += 1
                if consecutive_empty_frames > 15:
                    print("[ERROR] Multiple camera capture failures. Stopping registration.")
                    break
                time.sleep(0.1)
                continue
            
            consecutive_empty_frames = 0
            
            # Detect faces
            faces = detector.detect_faces(frame)
            
            # Render frame with bounding box if window is available
            preview_frame = frame.copy()
            for (x, y, w, h) in faces:
                cv2.rectangle(preview_frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                cv2.putText(
                    preview_frame, 
                    f"Capturing: {sample_count + 1}/{max_samples}", 
                    (x, y - 10), 
                    cv2.FONT_HERSHEY_SIMPLEX, 
                    0.6, 
                    (0, 255, 0), 
                    2
                )

            if show_preview:
                try:
                    cv2.imshow("Registering - Press Q to Quit", preview_frame)
                    # Break loop on keypress 'q' or 'Q'
                    key = cv2.waitKey(1) & 0xFF
                    if key == ord('q') or key == ord('Q'):
                        print("Registration cancelled by user.")
                        break
                except cv2.error:
                    # Occurs if running headless (e.g. Docker, SSH, or systems without GUI output)
                    show_preview = False
                    logger.warning("GUI window not available. Running registration in headless mode.")

            # Only capture if exactly 1 face is visible (prevents overlapping encodings)
            if len(faces) == 1:
                face_loc = faces[0]  # (x, y, w, h)

                # Generate DeepFace embedding for this face crop
                embedding = recognizer.get_embedding(frame, face_loc)
                if embedding is not None:
                    # Save raw image to profiles/faces/<username>/face_X.jpg
                    sample_count += 1
                    img_filename = f"face_{sample_count}.jpg"
                    img_path = os.path.join(faces_dir, img_filename)
                    cv2.imwrite(img_path, frame)

                    # Store embedding as plain Python list for JSON serialisation
                    captured_encodings.append(embedding.tolist())

                    print(f"Captured face sample {sample_count}/{max_samples} and saved to {img_filename}")

                    # Short delay to capture slightly different angles
                    time.sleep(1.0)
                else:
                    logger.debug("Detected face but DeepFace returned no embedding. Skipping frame.")
            elif len(faces) > 1:
                print("[WARNING] Multiple faces detected. Please make sure only one face is visible.")
                time.sleep(1.0)
            else:
                # No faces detected
                if not show_preview:
                    print("Scanning... No face detected. Please face the camera.")
                    time.sleep(1.0)

    finally:
        detector.stop_camera()
        try:
            cv2.destroyAllWindows()
        except Exception:
            pass

    # 4. Save Data if we successfully got all samples
    if sample_count == max_samples:
        print("\n--- Processing and Saving Data ---")
        
        # Save face embeddings to encodings.json
        encodings_dict = recognizer.get_encodings_dict()
        encodings_dict[username] = captured_encodings
        if recognizer.save_encodings(encodings_dict):
            print("Facial embeddings saved successfully.")
        
        # Save profile metadata to users.json
        pm.create_profile(
            username=username,
            name=display_name,
            theme=theme,
            role=role,
            welcome_message=welcome_message
        )
        print(f"\n[SUCCESS] User '{username}' successfully registered and profile created!")
    else:
        print(f"\n[ERROR] Registration failed. Captured only {sample_count}/{max_samples} samples.")


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        reg_name = sys.argv[1]
    else:
        reg_name = input("Enter unique username to register (e.g. Utkrista): ").strip()
    
    if reg_name:
        register_user(reg_name)
    else:
        print("Username cannot be empty.")
