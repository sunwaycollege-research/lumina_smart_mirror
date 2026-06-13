# Lumina Smart Mirror - Face Recognition Service

This Python-based service handles real-time face detection and face recognition using a webcam feed, maps recognized individuals to local user profiles, and outputs the active user's state to MagicMirror².

---

## Folder Structure

```
services/face-recognition/
├── face_service.py       # Main service orchestrator daemon (polls every 2s)
├── face_detector.py      # Camera handling and OpenCV Haar Cascade face detection
├── face_recognizer.py    # Face encoding comparisons using face-recognition
├── register_user.py      # CLI script to register faces and setup profile info
├── profile_manager.py    # Handles CRUD operations on users.json
├── requirements.txt      # Python dependencies list
├── README.md             # This document
└── profiles/
    ├── users.json        # Profile database (theme, role, welcome message)
    └── faces/
        ├── encodings.json# Serialized face vectors mapping to usernames
        └── [username]/   # Folders containing the raw face images captured
```

---

## Installation Requirements

### 1. Prerequisites (C++ Compiler & CMake)

The `face-recognition` library depends on `dlib`, which compiles C++ code during installation.
- **Windows**:
  - Install [Visual Studio Community Edition](https://visualstudio.microsoft.com/downloads/).
  - During installation, select the **Desktop development with C++** workload.
  - Ensure **CMake tools for Windows** is checked.
- **macOS**: `brew install cmake dlib`
- **Linux (Ubuntu/Raspbian)**: `sudo apt-get install build-essential cmake g++ gfortran`

### 2. Install Packages

Create a virtual environment (optional but recommended) and install the requirements:

```bash
# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

---

## How to Register a New User

To register a face, run the interactive registration CLI:

```bash
python register_user.py
```

1. Enter a unique, short alphanumeric username (e.g. `Utkrista`).
2. Provide details for their profile (Display name, Role, Theme, and Custom Welcome Message).
3. The camera window will pop up. Face the camera and look directly at it.
4. The system will automatically detect your face, wait for stability, and capture **5 different facial frames** (with a 1-second delay between snapshots).
5. Once complete, your images are saved, encodings are calculated/compiled, and the profile is saved.

---

## How to Run the Main Recognition Service

To start the face watcher service in the background:

```bash
python face_service.py
```

This starts the webcam capture loop:
- Captures and analyzes a frame every **2 seconds**.
- Logs in any registered user instantly upon recognition.
- Writes active profile data to the custom module directory (`modules/custom/MMM-FaceWatcher/face_data.json`).
- If you look away or leave, a **grace period of 3 cycles (6 seconds)** is applied before returning the display state to the guest "Unknown" user. This avoids annoying dashboard flickering if you blink or look away briefly.
- Implements a change-detection check to prevent writing to the JSON file if the user state hasn't changed, extending SD card and SSD lifespan.

---

## Troubleshooting

### Camera Fails to Open
- Check if another application (like Discord, Zoom, or the MagicMirror Electron container) is using your webcam.
- Change the `camera_index` from `0` to `1` or `2` in `face_service.py` and `register_user.py` if you have multiple video input devices.

### Dlib Installation Fails
- Ensure you have C++ Build Tools installed.
- Alternatively, search for a pre-compiled `dlib` wheel (`.whl`) matching your Python version (e.g., `dlib-19.22.99-cp310-cp310-win_amd64.whl` for Python 3.10 on Windows) and install it using `pip install <wheel_name>.whl` before running `pip install -r requirements.txt`.
