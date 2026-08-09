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
from schedule_manager import ScheduleManager
from text_logger import TextLogger
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
        input, select {
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
        input:focus, select:focus {
            outline: none;
            border-color: #d4af37;
            box-shadow: 0 0 10px rgba(212, 175, 55, 0.15);
        }
        select option {
            background: #0c0e12;
            color: #ffffff;
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
                <input type="text" id="role" placeholder="e.g. Student" required autocomplete="off">
            </div>
            <div class="input-group">
                <label for="semester_section">Semester Class Section</label>
                <select id="semester_section" required>
                    <option value="l1">L1 (Level 1 / Semester 1-2)</option>
                    <option value="l2">L2 (Level 2 / Semester 3-4)</option>
                    <option value="l3">L3 (Level 3 / Semester 5-6)</option>
                    <option value="l4">L4 (Level 4 / Semester 7-8)</option>
                </select>
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
            const semester_section = document.getElementById('semester_section').value;
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
                        semester_section,
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
from mediapipe_handler import MediapipeHandler  # type: ignore
from gesture_detector import GestureDetector  # type: ignore
from face_recognizer import FaceRecognizer  # type: ignore
from profile_manager import ProfileManager  # type: ignore
import face_recognition

# Global Services instances
vision_system = LuminaVisionPipeline(min_signal_quality=app_config["health_monitor"]["min_signal_quality"])
calendar_link = app_config["calendar"]["ical_url"]
cal_engine = AsyncCalendarEngine(calendar_link)

encodings_json = os.path.join(project_root, "services", "face-recognition", "profiles", "faces", "encodings.json")
face_recognizer = FaceRecognizer(encodings_json)

profiles_json = os.path.join(project_root, "services", "face-recognition", "profiles", "users.json")
profile_manager = ProfileManager(profiles_json)

schedules_json = os.path.join(project_root, "services", "schedules.json")
schedule_manager = ScheduleManager(schedules_json)

activity_log_txt = os.path.join(backend_dir, "logs", "activity_logs.txt")
text_logger = TextLogger(activity_log_txt)

gesture_handler = MediapipeHandler()
gesture_handler.init_landmarker()
gesture_detector = GestureDetector(
    min_cutoff=app_config["gestures"]["min_cutoff"],
    beta=app_config["gestures"]["beta"],
    horizontal_threshold=app_config["gestures"]["horizontal_threshold"],
    vertical_threshold=app_config["gestures"]["vertical_threshold"],
    cooldown_frames=app_config["gestures"]["cooldown_frames"],
    verification_frames=app_config["gestures"].get("verification_frames", 8),
    enable_static_poses=app_config["gestures"].get("enable_static_poses", True),
    only_read_fingers=app_config["gestures"].get("only_read_fingers", True),
)

cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
face_cascade = cv2.CascadeClassifier(cascade_path)

# Registration State Model
class RegisterRequest(BaseModel):
    username: str
    display_name: str
    role: str
    welcome_message: str
    semester_section: str = "l1"
    theme: str = "dark"

registration_state = {
    "active": False,
    "username": "",
    "display_name": "",
    "role": "",
    "semester_section": "l1",
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

def _clean_html(text: str) -> str:
    import re
    if not text:
        return ""
    clean = re.sub(r'<[^>]+>', '', text)
    return clean.strip()

@app.get("/api/dashboard/weather")
async def get_nepal_weather():
    """Fetches real-time weather data for Kathmandu, Nepal from Open-Meteo API."""
    url = "https://api.open-meteo.com/v1/forecast?latitude=27.7172&longitude=85.3240&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Asia%2FKathmandu"
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, timeout=5.0)
            if resp.status_code == 200:
                data = resp.json()
                cur = data.get("current", {})
                code = cur.get("weather_code", 0)
                condition = "Clear Sky"
                icon = "☀️"
                if 1 <= code <= 3:
                    condition = "Partly Cloudy"
                    icon = "⛅"
                elif 45 <= code <= 48:
                    condition = "Foggy"
                    icon = "🌫️"
                elif 51 <= code <= 67:
                    condition = "Rain Drizzle"
                    icon = "🌧️"
                elif 80 <= code <= 82:
                    condition = "Heavy Rain"
                    icon = "⛈️"
                elif code >= 95:
                    condition = "Thunderstorm"
                    icon = "🌩️"
                    
                return {
                    "city": "Kathmandu, Nepal",
                    "temperature": f"{round(cur.get('temperature_2m', 24))}°C",
                    "humidity": f"{round(cur.get('relative_humidity_2m', 65))}%",
                    "wind": f"{cur.get('wind_speed_10m', 8)} km/h",
                    "condition": condition,
                    "icon": icon,
                    "air_quality": "Good"
                }
        except Exception as e:
            logger.error(f"[WEATHER FETCH ERROR] {e}")
            
    return {
        "city": "Kathmandu, Nepal",
        "temperature": "26°C",
        "humidity": "65%",
        "wind": "10 km/h",
        "condition": "Mostly Cloudy",
        "icon": "☀️",
        "air_quality": "Good"
    }

def _clean_xml_text(xml_str: str) -> str:
    import re
    entities = {
        '&nbsp;': ' ', '&copy;': '(c)', '&reg;': '(r)', '&trade;': '(tm)',
        '&mdash;': '-', '&ndash;': '-', '&hellip;': '...', '&quot;': '"',
        '&apos;': "'", '&amp;': '&'
    }
    xml_clean = re.sub(r'&(?!([a-zA-Z0-9]+|#[0-9]+|#x[0-9a-fA-F]+);)', '&amp;', xml_str)
    for ent, val in entities.items():
        if ent != '&amp;':
            xml_clean = xml_clean.replace(ent, val)
    return xml_clean

async def _fetch_rss_items(url: str, source_name: str = "Nepali News") -> list | None:
    """Fetches and parses one RSS feed. Returns None (not []) on any failure."""
    async with httpx.AsyncClient(follow_redirects=True) as client:
        try:
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Lumina OS Engine"}
            response = await client.get(url, headers=headers, timeout=10.0)
            if response.status_code != 200:
                return None

            import xml.etree.ElementTree as ET
            cleaned_text = _clean_xml_text(response.text)
            root = ET.fromstring(cleaned_text)
            items = []
            for item in root.findall(".//item"):
                title = item.find("title")
                description = item.find("description")
                link = item.find("link")
                pub_date = item.find("pubDate")
                category = item.find("category")

                raw_desc = description.text.strip() if description is not None and description.text else ""
                clean_desc = _clean_html(raw_desc)

                items.append({
                    "title": title.text.strip() if title is not None and title.text else "No Title",
                    "description": clean_desc if clean_desc else "Live Nepal & World News update.",
                    "link": link.text.strip() if link is not None and link.text else "",
                    "pubDate": pub_date.text.strip() if pub_date is not None and pub_date.text else "",
                    "source": source_name,
                    "category": category.text.strip() if category is not None and category.text else "Nepal"
                })
            return items[:15] if items else None
        except Exception as e:
            logger.error(f"[NEWS FETCH ERROR] {url}: {e}")
            return None


@app.get("/api/dashboard/nepali-news")
async def get_nepali_news():
    """Fetches top headlines from the primary single working News API (Google News Nepal RSS)."""
    primary_url = app_config.get("news", {}).get("primary_rss_url", "https://news.google.com/rss/search?q=Nepal&hl=en-NP&gl=NP&ceid=NP:en")
    fallback_url = app_config.get("news", {}).get("fallback_rss_url", "https://www.onlinekhabar.com/feed")

    items = await _fetch_rss_items(primary_url, "Google News Nepal")
    if items:
        return items[:20]

    fallback_items = await _fetch_rss_items(fallback_url, "OnlineKhabar")
    if fallback_items:
        return fallback_items[:20]

    return get_fallback_news()


@app.get("/api/dashboard/news")
async def get_dashboard_news():
    """Fetches the configured single news RSS feed and parses headlines to JSON."""
    return await get_nepali_news()

class LogActivityRequest(BaseModel):
    user: str = "Unknown"
    feature: str
    details: str = ""
    mood: str = ""
    happiness_score: float = 0.0

class GeneralScheduleUpdateRequest(BaseModel):
    schedule: list

@app.get("/api/schedules/{username}")
async def get_student_schedule(username: str):
    """Returns the class schedule for a designated student from schedules.json."""
    prof = profile_manager.get_active_profile(username) if username not in ["Unknown", "Guest"] else None
    user_sec = prof.get("semester_section") if prof else None
    return schedule_manager.get_schedule_for_student(username, user_section=user_sec)

@app.post("/api/schedules/general")
async def update_general_schedule_endpoint(req: GeneralScheduleUpdateRequest):
    """Updates the master schedule for all students in schedules.json."""
    success = schedule_manager.update_general_schedule(req.schedule)
    if success:
        return {"status": "success", "message": "General schedule updated for all students."}
    return {"status": "error", "message": "Failed to update general schedule."}

@app.post("/api/logs/record")
async def record_activity_log(req: LogActivityRequest):
    """Appends an activity/feature usage log entry into logs/activity_logs.txt for registered students."""
    text_logger.log_feature_usage(
        username=req.user,
        new_feature=req.feature,
        mood=req.mood,
        happiness_score=req.happiness_score,
        details=req.details
    )
    return {"status": "success", "logged_feature": req.feature}

@app.post("/api/register/start")
def start_registration(req: RegisterRequest):
    """Triggers registration mode. WebCam stream will begin capturing 5 samples."""
    registration_state.update({
        "active": True,
        "username": req.username,
        "display_name": req.display_name,
        "role": req.role,
        "semester_section": req.semester_section,
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

    # Grace period and streak tracking
    miss_count = 0
    max_misses = 4  # 4 checks * 1.5s = 6.0s grace period
    recognition_streak = 0
    required_streak = 2  # Require 2 consecutive recognitions to log in a user
    last_candidate = None
    
    # FPS tracking variables
    fps_start_time = time.time()
    fps_frames = 0
    
    # Gesture latch: hold a detected gesture for multiple frames so the
    # frontend is guaranteed to receive it over WebSocket
    latched_gesture = "NONE"
    gesture_latch_remaining = 0
    GESTURE_LATCH_FRAMES = 1  # single frame — the cooldown fix handles dedup now
    
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
                    
                    # 1. Downsample frame for fast AI landmark inference (320x240 reduces tensor ops by 75%)
                    small_frame = cv2.resize(frame, (320, 240), interpolation=cv2.INTER_NEAREST)
                    
                    # Run vision and gesture processing in parallel on background thread pool
                    loop = asyncio.get_event_loop()
                    vision_future = loop.run_in_executor(None, vision_system.process_frame, small_frame)
                    gesture_future = loop.run_in_executor(None, gesture_handler.process_frame_direct, small_frame)
                    
                    vision_data = await vision_future
                    hand_landmarks = await gesture_future
                    
                    # 2. Continuous gesture verification (lightweight, runs on main thread)
                    verification_res = gesture_detector.process_verification(hand_landmarks)
                    raw_gesture = verification_res.get("active_gesture", "NONE")
                    verifying_gesture = verification_res.get("verifying_gesture", "NONE")
                    verification_progress = verification_res.get("progress", 0.0)
                    verification_status = verification_res.get("status", "IDLE")

                    if raw_gesture != "NONE":
                        logger.info(f"[GESTURE DEBUG] Verified gesture confirmed: {raw_gesture}")
                        latched_gesture = raw_gesture
                        gesture_latch_remaining = GESTURE_LATCH_FRAMES
                    
                    # Apply latch: emit the gesture while frames remain, then clear
                    if gesture_latch_remaining > 0:
                        active_gesture = latched_gesture
                        gesture_latch_remaining -= 1
                    else:
                        active_gesture = "NONE"
                        latched_gesture = "NONE"
                    
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
                                                welcome_message=registration_state["welcome_message"],
                                                semester_section=registration_state.get("semester_section", "l1")
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
                            faces = await asyncio.to_thread(
                                face_cascade.detectMultiScale,
                                gray, 1.1, 5, 0, (60, 60)
                            )
                            
                            detected_user = "Unknown"
                            is_recognized = False
                            
                            if len(faces) > 0:
                                # A face is detected. Reset miss count because a face is seen.
                                miss_count = 0
                                
                                result = await asyncio.to_thread(face_recognizer.recognize_face, frame, faces[0], 0.52)
                                if result.get("recognized"):
                                    detected_user = result["user"]
                                    is_recognized = True
                                else:
                                    detected_user = "Guest"
                            else:
                                detected_user = "Unknown"
                            
                            # Handle state transitions based on detected_user
                            if is_recognized:
                                # We recognized a known user
                                if detected_user == last_candidate:
                                    recognition_streak += 1
                                else:
                                    last_candidate = detected_user
                                    recognition_streak = 1
                                    
                                if recognition_streak >= required_streak:
                                    if recognized_user != detected_user:
                                        logger.info(f"WebSocket User login transition: '{recognized_user}' -> '{detected_user}'")
                                        prev_user = recognized_user
                                        recognized_user = detected_user
                                        prof = await asyncio.to_thread(profile_manager.get_active_profile, recognized_user)
                                        current_user_name = prof.get("name", recognized_user)
                                        trigger_schedule_popup = True
                                        
                                        # End session for previous student if any
                                        if prev_user and prev_user not in ["Unknown", "Guest"]:
                                            text_logger.end_student_session(prev_user)

                                        # Start student session (logs login timestamp & initial Class Schedule popup)
                                        text_logger.start_student_session(
                                            username=recognized_user,
                                            initial_feature="Class Schedules (Auto Popup)",
                                            mood=vision_data.get("mood", "NEUTRAL"),
                                            happiness_score=vision_data.get("happiness_score", 50.0)
                                        )
                                        
                                        # Keep custom face_data.json updated for compatibility
                                        try:
                                            face_watcher_path = os.path.join(project_root, "modules", "custom", "MMM-FaceWatcher", "face_data.json")
                                            os.makedirs(os.path.dirname(face_watcher_path), exist_ok=True)
                                            with open(face_watcher_path, "w") as f:
                                                json.dump(prof, f, indent=4)
                                        except Exception:
                                            pass
                                    identity_confidence = 98
                                    recognition_streak = 0
                                    last_candidate = None
                                    
                            elif detected_user == "Guest":
                                # Face detected but unrecognized guest -> ignore text logging for guests
                                recognition_streak = 0
                                last_candidate = None
                                
                                if recognized_user in ["Unknown", "Guest"]:
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
                                
                            else:  # detected_user == "Unknown" (no face detected at all)
                                recognition_streak = 0
                                last_candidate = None
                                
                                if recognized_user != "Unknown":
                                    miss_count += 1
                                    logger.info(f"Face absent. Miss count: {miss_count}/{max_misses}")
                                    if miss_count >= max_misses:
                                        logger.info(f"WebSocket User logged out due to absence: '{recognized_user}' -> 'Unknown'")
                                        # End session for registered student
                                        text_logger.end_student_session(recognized_user)
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
                                        miss_count = 0
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

            # Periodically write happiness and mood metrics to disk
            if vision_data.get("detected") and ticker_counter % 60 == 0:
                if recognized_user not in ["Unknown", "Guest"]:
                    await asyncio.to_thread(
                        database_core.log_health_metrics,
                        recognized_user,
                        vision_data.get("happiness_score", 50.0),
                        vision_data.get("mood", "NEUTRAL"),
                        "LOW"
                    )

            active_profile = await asyncio.to_thread(profile_manager.get_active_profile, recognized_user) if recognized_user not in ["Unknown", "Guest"] else None
            student_schedule_data = schedule_manager.get_schedule_for_student(recognized_user)
            
            identity_payload = {
                "currentUser": current_user_name,
                "currentUserKey": recognized_user if recognized_user not in ["Unknown", "Guest"] else "",
                "confidence": identity_confidence,
                "profile": active_profile,
                "welcomeMessage": active_profile.get("welcome_message", "") if active_profile else ""
            }
            
            has_popup_trigger = False
            if 'trigger_schedule_popup' in locals() and trigger_schedule_popup:
                has_popup_trigger = True
                trigger_schedule_popup = False
            
            outbound_packet = {
                "biometrics": vision_data,
                "student_schedule": student_schedule_data,
                "trigger_schedule_popup": has_popup_trigger,
                "gestures": {
                    "activeGesture": active_gesture,
                    "verifyingGesture": verifying_gesture if 'verifying_gesture' in locals() else "NONE",
                    "progress": verification_progress if 'verification_progress' in locals() else 0.0,
                    "status": verification_status if 'verification_status' in locals() else "IDLE",
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
            await asyncio.sleep(0.05)  # Yield ~20 FPS for low CPU load and smooth streaming
            
    except WebSocketDisconnect:
        logger.info("WebSocket connection disconnected.")
    except Exception as e:
        logger.error(f"Unexpected error in WebSocket loop: {e}", exc_info=True)
    finally:
        system_health["websocket_active_connections"] = max(0, system_health["websocket_active_connections"] - 1)
        logger.info(f"WebSocket cleanup. Active connections: {system_health['websocket_active_connections']}")
        if camera.isOpened():
            camera.release()