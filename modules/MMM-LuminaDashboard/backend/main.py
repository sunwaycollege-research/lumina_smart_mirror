import os
import sys
import warnings

# Suppress noisy C++ and third-party library warning messages
os.environ["GLOG_minloglevel"] = "2"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
warnings.filterwarnings("ignore", category=UserWarning, module="face_recognition_models")
warnings.filterwarnings("ignore", category=UserWarning)
warnings.filterwarnings("ignore", category=DeprecationWarning)
warnings.filterwarnings("ignore", message=".*pkg_resources.*")

import asyncio
import cv2
import json
import time
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import database_core
from vision_pipeline import LuminaVisionPipeline
from calendar_engine import AsyncCalendarEngine
from config_loader import load_config
import httpx
from logger import get_logger

logger = get_logger("LuminaBackend")

app = FastAPI(title="Lumina Smart Mirror OS Engine v2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/register", response_class=HTMLResponse)
def get_registration_page():
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lumina - User Biometric Registration</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
            background: radial-gradient(circle at center, #0f0f0f 0%, #000000 100%);
            color: #ffffff;
            font-family: 'Inter', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            overflow-x: hidden;
        }
        .container {
            width: 100%;
            max-width: 460px;
            padding: 40px 30px;
            box-sizing: border-box;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(212, 175, 55, 0.12);
            border-radius: 24px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            backdrop-filter: blur(10px);
            text-align: center;
            animation: fadeIn 0.6s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .logo-text {
            font-family: 'Outfit', sans-serif;
            font-weight: 700;
            font-size: 2.2rem;
            letter-spacing: 4px;
            color: #d4af37;
            margin-bottom: 5px;
            text-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
        }
        .subtitle {
            font-size: 0.85rem;
            letter-spacing: 2px;
            color: #888;
            text-transform: uppercase;
            margin-bottom: 35px;
        }
        .input-group {
            margin-bottom: 20px;
            text-align: left;
        }
        label {
            display: block;
            font-size: 0.75rem;
            letter-spacing: 1px;
            color: #aaa;
            margin-bottom: 8px;
            text-transform: uppercase;
            font-weight: 600;
        }
        input {
            width: 100%;
            padding: 14px 18px;
            box-sizing: border-box;
            background: rgba(0, 0, 0, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            color: #ffffff;
            font-size: 0.95rem;
            transition: all 0.3s ease;
        }
        input:focus {
            outline: none;
            border-color: #d4af37;
            box-shadow: 0 0 10px rgba(212, 175, 55, 0.15);
        }
        button {
            width: 100%;
            padding: 16px;
            background: #d4af37;
            color: #000000;
            border: none;
            border-radius: 12px;
            font-family: 'Outfit', sans-serif;
            font-weight: 700;
            font-size: 1rem;
            letter-spacing: 1.5px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 15px;
        }
        button:hover {
            background: #f3cf65;
            box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
            transform: translateY(-1px);
        }
        button:active {
            transform: translateY(1px);
        }
        .status-card {
            margin-top: 25px;
            background: rgba(212, 175, 55, 0.05);
            border: 1px solid rgba(212, 175, 55, 0.2);
            border-radius: 14px;
            padding: 20px;
            display: none;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            animation: slideDown 0.4s ease-out;
        }
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .spinner {
            width: 32px;
            height: 32px;
            border: 3px solid rgba(212, 175, 55, 0.1);
            border-top-color: #d4af37;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .status-text {
            font-size: 0.9rem;
            color: #d4af37;
            line-height: 1.4;
        }
        .success-icon {
            font-size: 2.2rem;
            color: #10b981;
            animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes pop {
            from { transform: scale(0); }
            to { transform: scale(1); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo-text">LUMINA</div>
        <div class="subtitle">Biometric Face Registration</div>
        
        <form id="regForm">
            <div class="input-group">
                <label for="username">Username</label>
                <input type="text" id="username" placeholder="e.g. Sulav" required autocomplete="off">
            </div>
            <div class="input-group">
                <label for="display_name">Display Name</label>
                <input type="text" id="display_name" placeholder="e.g. Sulav Shrestha" required autocomplete="off">
            </div>
            <div class="input-group">
                <label for="role">Role</label>
                <input type="text" id="role" placeholder="e.g. Developer" required autocomplete="off">
            </div>
            <div class="input-group">
                <label for="welcome_message">Custom Welcome Message</label>
                <input type="text" id="welcome_message" placeholder="e.g. Greetings, Sulav" required autocomplete="off">
            </div>
            <button type="submit" id="submitBtn">START FACE SCAN</button>
        </form>
        
        <div id="statusCard" class="status-card">
            <div id="statusIndicator" class="spinner"></div>
            <div id="statusText" class="status-text">Positioning face...</div>
        </div>
    </div>

    <script>
        const form = document.getElementById('regForm');
        const submitBtn = document.getElementById('submitBtn');
        const statusCard = document.getElementById('statusCard');
        const statusText = document.getElementById('statusText');
        const statusIndicator = document.getElementById('statusIndicator');
        let pollInterval = null;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const display_name = document.getElementById('display_name').value.trim();
            const role = document.getElementById('role').value.trim();
            const welcome_message = document.getElementById('welcome_message').value.trim();
            
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
            statusCard.style.display = 'flex';
            statusText.innerText = 'Initializing scan sequence...';
            statusIndicator.className = 'spinner';
            
            try {
                const response = await fetch('/api/register/start', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username,
                        display_name,
                        role,
                        welcome_message,
                        theme: 'gold'
                    })
                });
                
                const data = await response.json();
                statusText.innerText = 'Capture mode active. Please look at the mirror webcam...';
                
                // Start polling status
                if (pollInterval) clearInterval(pollInterval);
                pollInterval = setInterval(checkStatus, 500);
            } catch (err) {
                statusText.innerText = 'Failed to start registration sequence.';
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                statusIndicator.style.display = 'none';
            }
        });

        async function checkStatus() {
            try {
                const response = await fetch('/api/register/status');
                const data = await response.json();
                
                statusText.innerText = data.status_message;
                
                if (!data.active) {
                    clearInterval(pollInterval);
                    if (data.status_message.includes('successful')) {
                        statusIndicator.className = 'success-icon';
                        statusIndicator.innerHTML = '✓';
                        statusText.style.color = '#10b981';
                        setTimeout(() => {
                            submitBtn.disabled = false;
                            submitBtn.style.opacity = '1';
                            statusCard.style.display = 'none';
                            form.reset();
                        }, 5000);
                    } else {
                        statusIndicator.style.display = 'none';
                        submitBtn.disabled = false;
                        submitBtn.style.opacity = '1';
                    }
                }
            } catch (err) {
                console.error('Error polling status:', err);
            }
        }
    </script>
</body>
</html>"""
    return HTMLResponse(content=html_content, status_code=200)

# Resolution paths and import additions
backend_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(backend_dir, "..", "..", ".."))

# Load config.json (project root) - this is "the place to insert" your own
# Google Calendar link, news feed choice, and gesture/health tuning. See
# config.json itself for exact instructions on each field.
app_config = load_config(project_root)

sys.path.append(os.path.join(project_root, "services", "gestures"))
sys.path.append(os.path.join(project_root, "services", "face-recognition"))

# Import direct processors
from mediapipe_handler import MediapipeHandler
from gesture_detector import GestureDetector
from face_recognizer import FaceRecognizer
from profile_manager import ProfileManager
import face_recognition

# Global Services instances
vision_system = LuminaVisionPipeline(min_signal_quality=app_config["health_monitor"]["min_signal_quality"])
calendar_link = app_config["calendar"]["ical_url"]
cal_engine = AsyncCalendarEngine(calendar_link)

encodings_json = os.path.join(project_root, "services", "face-recognition", "profiles", "faces", "encodings.json")
face_recognizer = FaceRecognizer(encodings_json)

profiles_json = os.path.join(project_root, "services", "face-recognition", "profiles", "users.json")
profile_manager = ProfileManager(profiles_json)

gesture_handler = MediapipeHandler()
gesture_handler.init_landmarker()
gesture_detector = GestureDetector(
    min_cutoff=app_config["gestures"]["min_cutoff"],
    beta=app_config["gestures"]["beta"],
    horizontal_threshold=app_config["gestures"]["horizontal_threshold"],
    vertical_threshold=app_config["gestures"]["vertical_threshold"],
    cooldown_frames=app_config["gestures"]["cooldown_frames"],
)

cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
face_cascade = cv2.CascadeClassifier(cascade_path)

# Registration State Model
class RegisterRequest(BaseModel):
    username: str
    display_name: str
    role: str
    welcome_message: str
    theme: str = "dark"

registration_state = {
    "active": False,
    "username": "",
    "display_name": "",
    "role": "",
    "theme": "",
    "welcome_message": "",
    "samples_captured": 0,
    "encodings": [],
    "status_message": "idle",
    "last_capture_time": 0.0
}

system_health = {
    "camera_status": "disconnected",
    "face_recognition": "initializing",
    "gesture_engine": "initializing",
    "websocket_active_connections": 0,
    "last_processed_fps": 0.0,
}

@app.on_event("startup")
async def boot_database_sequences():
    await asyncio.to_thread(database_core.init_master_db)
    logger.info("Startup complete: Database sequence finished.")

@app.get("/api/health")
async def get_health_status():
    """System health check endpoint supplying diagnostics data."""
    from datetime import datetime
    is_face_rec_loaded = len(face_recognizer.known_face_encodings) > 0 if hasattr(face_recognizer, "known_face_encodings") else False
    is_gesture_loaded = gesture_handler._hand_landmarker is not None if hasattr(gesture_handler, "_hand_landmarker") else False
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "camera_status": system_health["camera_status"],
        "face_recognition": "active" if is_face_rec_loaded else "no_encodings_loaded",
        "gesture_engine": "active" if is_gesture_loaded else "inactive",
        "websocket_connections": system_health["websocket_active_connections"],
        "fps": system_health["last_processed_fps"],
        "system": {
            "cpu": get_cpu_usage(),
            "ram": get_ram_usage()
        }
    }

@app.get("/api/dashboard/summary/{username}")
async def get_user_dashboard_summary(username: str):
    """Aggregates biographical history and recent analytics for user metric dashboards without blocking."""
    trends = await asyncio.to_thread(database_core.get_historical_trends, username)
    if not trends:
        return {"user": username, "status": "No database data profile points resolved."}
        
    valid_hrs = [t["heart_rate"] for t in trends if isinstance(t["heart_rate"], (int, float))]
    avg_hr = sum(valid_hrs) / len(valid_hrs) if valid_hrs else 72.0
    return {
        "user": username,
        "historical_records_count": len(trends),
        "average_heart_rate": round(avg_hr, 1),
        "timeline": trends[:10]
    }

def get_fallback_news():
    return [
        {
            "title": "Lumina Smart Mirror OS Operational",
            "description": "System booted successfully. Hybrid gesture and mouse control systems fully active.",
            "link": "https://lumina.smartmirror",
            "pubDate": "Mon, 06 Jul 2026 12:00:00 GMT"
        },
        {
            "title": "rPPG Optical Bio-Sensors Calibrated",
            "description": "Vascular hemoglobin reflection tracking is running with optimized ambient noise filters.",
            "link": "https://lumina.smartmirror",
            "pubDate": "Mon, 06 Jul 2026 10:30:00 GMT"
        },
        {
            "title": "Intelligent Schedule Assistant Online",
            "description": "Interactive schedule manager syncs with public iCal services and corporate calendar backends.",
            "link": "https://lumina.smartmirror",
            "pubDate": "Mon, 06 Jul 2026 08:15:00 GMT"
        }
    ]

async def _fetch_rss_items(url: str) -> list | None:
    """Fetches and parses one RSS feed. Returns None (not []) on any failure,
    so callers can distinguish "feed had zero items" from "feed failed"."""
    async with httpx.AsyncClient() as client:
        try:
            headers = {"User-Agent": "Mozilla/5.0 (Windows / Smart Mirror) Lumina OS Engine"}
            response = await client.get(url, headers=headers, timeout=10.0)
            if response.status_code != 200:
                return None

            import xml.etree.ElementTree as ET
            root = ET.fromstring(response.text)
            items = []
            for item in root.findall(".//item"):
                title = item.find("title")
                description = item.find("description")
                link = item.find("link")
                pub_date = item.find("pubDate")

                items.append({
                    "title": title.text.strip() if title is not None and title.text else "No Title",
                    "description": description.text.strip() if description is not None and description.text else "",
                    "link": link.text.strip() if link is not None and link.text else "",
                    "pubDate": pub_date.text.strip() if pub_date is not None and pub_date.text else ""
                })
            return items[:10] if items else None
        except Exception as e:
            print(f"[NEWS FETCH ERROR] {url}: {e}")
            return None


@app.get("/api/dashboard/news")
async def get_dashboard_news():
    """Fetches the configured news RSS feed(s) and parses headlines to JSON.

    Tries, in order: primary_rss_url from config.json (Nepali source by
    default), then fallback_rss_url from config.json, then a small static
    list so the dashboard never shows a blank news panel.
    """
    primary_url = app_config["news"]["primary_rss_url"]
    fallback_url = app_config["news"]["fallback_rss_url"]

    items = await _fetch_rss_items(primary_url)
    if items:
        return items

    if fallback_url and fallback_url != primary_url:
        items = await _fetch_rss_items(fallback_url)
        if items:
            return items

    return get_fallback_news()

@app.post("/api/register/start")
def start_registration(req: RegisterRequest):
    """Triggers registration mode. WebCam stream will begin capturing 5 samples."""
    registration_state.update({
        "active": True,
        "username": req.username,
        "display_name": req.display_name,
        "role": req.role,
        "theme": req.theme,
        "welcome_message": req.welcome_message,
        "samples_captured": 0,
        "encodings": [],
        "status_message": "Position your face in front of the camera...",
        "last_capture_time": 0.0
    })
    return {"status": "started", "username": req.username}

@app.get("/api/register/status")
def get_registration_status():
    """Returns the current state of registration."""
    return {
        "active": registration_state["active"],
        "samples_captured": registration_state["samples_captured"],
        "status_message": registration_state["status_message"]
    }

def get_cpu_usage():
    try:
        with open('/proc/loadavg', 'r') as f:
            load = f.read().split()[0]
        cores = os.cpu_count() or 1
        pct = (float(load) / cores) * 100
        return min(100.0, round(pct, 1))
    except Exception:
        return 22.5

def get_ram_usage():
    try:
        with open('/proc/meminfo', 'r') as f:
            lines = f.readlines()
        mem_total = 0
        mem_free = 0
        mem_available = 0
        for line in lines:
            if 'MemTotal' in line:
                mem_total = int(line.split()[1])
            elif 'MemAvailable' in line:
                mem_available = int(line.split()[1])
            elif 'MemFree' in line:
                mem_free = int(line.split()[1])
        if mem_available == 0:
            mem_available = mem_free
        used = mem_total - mem_available
        pct = (used / mem_total) * 100
        return min(100.0, round(pct, 1))
    except Exception:
        return 65.4

@app.websocket("/ws/dashboard/stream")
async def primary_dashboard_websocket_stream(websocket: WebSocket):
    """Primary streaming loop supplying high frequency UI data updates."""
    await websocket.accept()
    system_health["websocket_active_connections"] += 1
    logger.info(f"WebSocket client connected. Active connections: {system_health['websocket_active_connections']}")
    
    camera = cv2.VideoCapture(0)
    if not camera.isOpened():
        camera = cv2.VideoCapture(1)
    
    if camera.isOpened():
        camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        system_health["camera_status"] = "connected"
        logger.info("Webcam initialized successfully.")
    else:
        system_health["camera_status"] = "disconnected"
        logger.warning("Failed to open webcam index 0 or 1.")
        
    loop_active = True
    ticker_counter = 0
    consecutive_failures = 0
    last_reconnect_attempt = 0.0
    
    # State tracking variables
    recognized_user = "Unknown"
    current_user_name = "Searching..."
    identity_confidence = 0
    last_user_check_time = 0.0
    
    # FPS tracking variables
    fps_start_time = time.time()
    fps_frames = 0
    
    try:
        while loop_active:
            vision_data = {"detected": False, "bpm": "Calibrating...", "mood": "NEUTRAL", "anxiety": "LOW"}
            active_gesture = "NONE"
            
            # Camera reconnection logic if disconnected
            if not camera.isOpened():
                system_health["camera_status"] = "disconnected"
                current_time = time.time()
                if current_time - last_reconnect_attempt > 3.0:
                    last_reconnect_attempt = current_time
                    logger.info("Attempting to reconnect to webcam...")
                    camera = cv2.VideoCapture(0)
                    if not camera.isOpened():
                        camera = cv2.VideoCapture(1)
                    if camera.isOpened():
                        camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                        camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                        logger.info("Webcam reconnected successfully.")
                        system_health["camera_status"] = "connected"
                        consecutive_failures = 0
            
            if camera.isOpened():
                ret, frame = camera.read()
                if ret and frame is not None:
                    consecutive_failures = 0
                    system_health["camera_status"] = "connected"
                    
                    # Mirror the frame horizontally for natural mirror-like behavior
                    frame = cv2.flip(frame, 1)
                    
                    # 1. Run vision and gesture processing in parallel for lower latency
                    loop = asyncio.get_event_loop()
                    vision_future = loop.run_in_executor(None, vision_system.process_frame, frame)
                    gesture_future = loop.run_in_executor(None, gesture_handler.process_frame_direct, frame)
                    
                    vision_data = await vision_future
                    hand_landmarks = await gesture_future
                    
                    # 2. Gesture classification (lightweight, runs on main thread)
                    raw_gesture = gesture_detector.detect(hand_landmarks)
                    if raw_gesture:
                        logger.info(f"[GESTURE DEBUG] Detected raw gesture: {raw_gesture}")
                        if raw_gesture == "LEFT":
                            active_gesture = "SWIPE_LEFT"
                        elif raw_gesture == "RIGHT":
                            active_gesture = "SWIPE_RIGHT"
                        elif raw_gesture == "UP":
                            active_gesture = "SWIPE_UP"
                        elif raw_gesture == "DOWN":
                            active_gesture = "SWIPE_DOWN"
                        else:
                            active_gesture = raw_gesture
                    
                    # 3. Biometric Identity and registration processes
                    if registration_state["active"]:
                        current_time = time.time()
                        # Capture at 1.2s intervals to get variation
                        if current_time - registration_state["last_capture_time"] > 1.2:
                            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                            faces = face_cascade.detectMultiScale(
                                gray, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80)
                            )
                            if len(faces) == 1:
                                try:
                                    x, y, w, h = faces[0]
                                    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                                    face_loc_dlib = (y, x + w, y + h, x)
                                    encs = await asyncio.to_thread(face_recognition.face_encodings, rgb_frame, [face_loc_dlib])
                                    if encs:
                                        encoding_list = encs[0].tolist()
                                        registration_state["encodings"].append(encoding_list)
                                        registration_state["samples_captured"] += 1
                                        registration_state["last_capture_time"] = current_time
                                        
                                        # Save images
                                        faces_dir = os.path.join(project_root, "services", "face-recognition", "profiles", "faces", registration_state["username"])
                                        os.makedirs(faces_dir, exist_ok=True)
                                        img_path = os.path.join(faces_dir, f"face_{registration_state['samples_captured']}.jpg")
                                        cv2.imwrite(img_path, frame)
                                        
                                        registration_state["status_message"] = f"Captured face sample {registration_state['samples_captured']}/5. Hold still..."
                                        
                                        if registration_state["samples_captured"] >= 5:
                                            # Save encodings and database entries
                                            encs_dict = await asyncio.to_thread(face_recognizer.get_encodings_dict)
                                            encs_dict[registration_state["username"]] = registration_state["encodings"]
                                            await asyncio.to_thread(face_recognizer.save_encodings, encs_dict)
                                            
                                            await asyncio.to_thread(
                                                profile_manager.create_profile,
                                                username=registration_state["username"],
                                                name=registration_state["display_name"],
                                                theme=registration_state["theme"],
                                                role=registration_state["role"],
                                                welcome_message=registration_state["welcome_message"]
                                            )
                                            
                                            registration_state["active"] = False
                                            registration_state["status_message"] = "Registration successful!"
                                    else:
                                        registration_state["status_message"] = "Face detected, but landmarks not captured. Align face..."
                                except Exception as err:
                                    logger.error(f"Error during user face registration: {err}", exc_info=True)
                                    registration_state["status_message"] = f"Registration error: {str(err)}"
                            elif len(faces) > 1:
                                registration_state["status_message"] = "Multiple faces detected. Ensure single target is visible."
                            else:
                                registration_state["status_message"] = "Align face to camera..."
                    else:
                        # Regular Face recognition checks
                        current_time = time.time()
                        if current_time - last_user_check_time > 1.5:
                            last_user_check_time = current_time
                            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                            faces = face_cascade.detectMultiScale(
                                gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60)
                            )
                            if len(faces) > 0:
                                result = await asyncio.to_thread(face_recognizer.recognize_face, frame, faces[0], 0.4)
                                if result.get("recognized"):
                                    new_user = result["user"]
                                    if new_user != recognized_user:
                                        recognized_user = new_user
                                        prof = await asyncio.to_thread(profile_manager.get_active_profile, recognized_user)
                                        current_user_name = prof.get("name", recognized_user)
                                        
                                        # Keep custom face_data.json updated for compatibility
                                        try:
                                            face_watcher_path = os.path.join(project_root, "modules", "custom", "MMM-FaceWatcher", "face_data.json")
                                            os.makedirs(os.path.dirname(face_watcher_path), exist_ok=True)
                                            with open(face_watcher_path, "w") as f:
                                                json.dump(prof, f, indent=4)
                                        except Exception:
                                            pass
                                    identity_confidence = 98
                                else:
                                    if recognized_user != "Guest":
                                        recognized_user = "Guest"
                                        current_user_name = "Guest"
                                        try:
                                            face_watcher_path = os.path.join(project_root, "modules", "custom", "MMM-FaceWatcher", "face_data.json")
                                            os.makedirs(os.path.dirname(face_watcher_path), exist_ok=True)
                                            with open(face_watcher_path, "w") as f:
                                                guest_profile = await asyncio.to_thread(profile_manager.get_active_profile, "Unknown")
                                                json.dump(guest_profile, f, indent=4)
                                        except Exception:
                                            pass
                                    identity_confidence = 0
                            else:
                                if recognized_user != "Unknown":
                                    recognized_user = "Unknown"
                                    current_user_name = "Searching..."
                                    try:
                                        face_watcher_path = os.path.join(project_root, "modules", "custom", "MMM-FaceWatcher", "face_data.json")
                                        os.makedirs(os.path.dirname(face_watcher_path), exist_ok=True)
                                        with open(face_watcher_path, "w") as f:
                                            guest_profile = await asyncio.to_thread(profile_manager.get_active_profile, "Unknown")
                                            json.dump(guest_profile, f, indent=4)
                                    except Exception:
                                        pass
                                identity_confidence = 0
                else:
                    consecutive_failures += 1
                    if consecutive_failures >= 30:
                        logger.warning("Consecutive frame read failures exceeded limit. Releasing camera for reconnection.")
                        camera.release()
                        system_health["camera_status"] = "disconnected"
                        consecutive_failures = 0
            
            ticker_counter += 1
            fps_frames += 1
            
            # FPS tracking
            now_time = time.time()
            elapsed_fps = now_time - fps_start_time
            if elapsed_fps >= 1.0:
                system_health["last_processed_fps"] = round(fps_frames / elapsed_fps, 1)
                fps_frames = 0
                fps_start_time = now_time
                
            # Periodically write data entries to disk to protect storage longevity
            if vision_data["detected"] and ticker_counter % 60 == 0:
                if isinstance(vision_data["bpm"], (int, float)) and recognized_user not in ["Unknown", "Guest"]:
                    await asyncio.to_thread(
                        database_core.log_health_metrics,
                        recognized_user,
                        vision_data["bpm"],
                        vision_data["mood"],
                        vision_data["anxiety"]
                    )
            
            # Every 150 frames, asynchronously update calendar events
            agenda_payload = []
            if ticker_counter % 150 == 0:
                agenda_payload = await cal_engine.fetch_and_parse_agenda()
            
            identity_payload = {
                "currentUser": current_user_name,
                # Raw registry key (e.g. "Sulav"), as opposed to the display
                # name (e.g. "Dawgybey"). log_health_metrics() below writes
                # under this same key - the frontend must query summaries
                # with THIS value, not the display name, or it'll look up
                # a username that was never actually written to the DB.
                "currentUserKey": recognized_user if recognized_user not in ["Unknown", "Guest"] else "",
                "confidence": identity_confidence
            }
            
            outbound_packet = {
                "biometrics": vision_data,
                "agenda": agenda_payload if agenda_payload else "CACHED_NOMINAL",
                "gestures": {
                    "activeGesture": active_gesture,
                    "power_state": "WAKE"
                },
                "identity": identity_payload,
                "registration": {
                    "active": registration_state["active"],
                    "samples_captured": registration_state["samples_captured"],
                    "status_message": registration_state["status_message"]
                },
                "system_stats": {
                    "cpu": get_cpu_usage(),
                    "ram": get_ram_usage()
                }
            }
            
            await websocket.send_json(outbound_packet)
            await asyncio.sleep(0.03)  # Throttle execution loop to yield ~30 FPS on the CPU
            
    except WebSocketDisconnect:
        logger.info("WebSocket connection disconnected.")
    except Exception as e:
        logger.error(f"Unexpected error in WebSocket loop: {e}", exc_info=True)
    finally:
        system_health["websocket_active_connections"] = max(0, system_health["websocket_active_connections"] - 1)
        logger.info(f"WebSocket cleanup. Active connections: {system_health['websocket_active_connections']}")
        if camera.isOpened():
            camera.release()