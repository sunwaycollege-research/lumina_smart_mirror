# 🚀 Lumina / SOMA Smart Mirror - Raspberry Pi Complete Setup & Dependency Guide

This document contains step-by-step instructions and command lists for downloading and installing all required system packages, Node.js runtime, Python AI dependencies, and hardware drivers to directly operate the **Lumina / SOMA Smart Mirror** system on a Raspberry Pi (Raspberry Pi 4 / 5 running **Raspberry Pi OS 64-bit / Debian 12 Bookworm**).

---

## 🛠️ 1. Hardware Requirements

- **Single-Board Computer:** Raspberry Pi 4 B or Raspberry Pi 5 (64-bit OS required)
- **Camera Input:** USB HD Webcam or Raspberry Pi Camera Module (v2 / v3)
- **Audio Input:** USB Microphone / Sound card module
- **Display Output:** HDMI LCD Panel mounted behind a Dielectric 2-Way Mirror Glass
- **Proximity/Presence Sensors (Optional):** Ultrasonic Distance Sensor (HC-SR04) / PIR Motion Detector connected via GPIO pins

---

## 📋 2. Complete Dependency Checklist

| Category               | Component / Library                                                                                                                    | Purpose                                                        |
| :--------------------- | :------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------- |
| **Runtime**            | Node.js (v22.x LTS) & NPM                                                                                                              | Powers MagicMirror² engine, UI widgets, Electron container     |
| **System Tools**       | `git`, `curl`, `wget`, `cmake`, `build-essential`, `unclutter`                                                                         | System building, repository management, cursor hiding          |
| **Graphics & Vision**  | `libgl1-mesa-glx`, `libglib2.0-0`, `libopenblas-dev`, `liblapack-dev`                                                                  | OpenCV, MediaPipe, dlib hardware acceleration                  |
| **Audio Tools**        | `portaudio19-dev`, `alsa-utils`                                                                                                        | Microphone capture for Vosk speech recognition                 |
| **Python Backend**     | Python 3.10+, `venv`, `pip`                                                                                                            | Runs FastAPI daemon, MediaPipe hand gestures, face recognition |
| **Python Libraries**   | `fastapi`, `uvicorn`, `opencv-python-headless`, `mediapipe`, `face-recognition`, `numpy`, `scipy`, `scikit-learn`, `pydantic`, `httpx` | Vision pipeline, user profiles, API endpoints                  |
| **Auto-Start Manager** | `pm2`                                                                                                                                  | Manages automatic start on Pi boot                             |

---

## ⚡ 3. Step-by-Step Installation Guide

Open a terminal on your Raspberry Pi (or SSH into it) and execute the following steps in sequence:

### Step 1: Update System & Install Native Apt Dependencies

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y \
  build-essential \
  cmake \
  gfortran \
  g++ \
  pkg-config \
  git \
  curl \
  wget \
  unclutter \
  python3 \
  python3-pip \
  python3-venv \
  python3-dev \
  libopenblas-dev \
  liblapack-dev \
  libjpeg-dev \
  libpng-dev \
  libtiff-dev \
  libgl1-mesa-glx \
  libglib2.0-0 \
  portaudio19-dev \
  alsa-utils
```

---

### Step 2: Install Node.js (v22.x LTS)

MagicMirror² requires **Node.js 22.x or 24.x**. Install Node.js LTS via NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node and NPM versions
node -v # Should display v22.x.x
npm -v  # Should display 10.x.x or higher
```

---

### Step 3: Clone Repository & Install Node Dependencies

```bash
# Clone the repository (if not already cloned)
git clone https://github.com/dawgybey/lumina.git
cd lumina

# Install MagicMirror production dependencies
npm install --no-audit --no-fund --no-update-notifier
```

---

### Step 4: Add User Hardware Permissions

Ensure your user has access to camera (`video`) and microphone (`audio`) hardware interfaces:

```bash
sudo usermod -aG video,audio $USER
```

_(Note: Log out and log back in or reboot for group permissions to take effect)._

---

### Step 5: Run Automated Python AI Setup Script

Run the built-in setup script to automatically create the `.venv` virtual environment and install all Python AI requirements (`FastAPI`, `Uvicorn`, `MediaPipe`, `Face Recognition`, `OpenCV`, `NumPy`, `Scipy`, `Scikit-Learn`):

```bash
chmod +x setup.sh
./setup.sh
```

---

### Step 6: Verify Offline Speech Recognition Model (Vosk)

The repository includes the pre-packaged Vosk offline speech model in `vosk-model-small-en-us-0.15`. Check that the model folder is present:

```bash
ls -la vosk-model-small-en-us-0.15
```

If missing, download and extract it manually:

```bash
wget https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip
unzip vosk-model-small-en-us-0.15.zip
rm vosk-model-small-en-us-0.15.zip
```

---

## 🖥️ 4. Operating & Launching the Smart Mirror

### Option A: Launch Display Mode (X11 / Wayland Desktop)

If you are logged into the Raspberry Pi desktop environment:

**For X11 (Default Raspberry Pi OS Desktop):**

```bash
npm run start:x11
```

**For Wayland (Labwc / Wayfire on Pi 5):**

```bash
npm run start:wayland
```

### Option B: Headless Server Mode (Testing via Browser)

To run without opening an Electron window (accessible via any browser on your Wi-Fi at `http://<PI_IP_ADDRESS>:8080`):

```bash
npm run server
```

---

## 🔄 5. Configure Automatic Boot on Raspberry Pi (PM2 Setup)

To make the Lumina / SOMA Smart Mirror automatically launch when the Raspberry Pi boots up:

1. **Install PM2 globally:**

   ```bash
   sudo npm install -g pm2
   ```

2. **Configure PM2 startup script:**

   ```bash
   pm2 startup
   ```

   _(Copy and run the command provided in the output of `pm2 startup`)._

3. **Create PM2 Process Configuration:**
   Save a file named `mm.sh` in your project root:

   ```bash
   echo '#!/bin/bash' > mm.sh
   echo 'cd /home/pi/lumina && DISPLAY=:0 npm run start:x11' >> mm.sh
   chmod +x mm.sh
   ```

4. **Start and Save PM2 Process:**
   ```bash
   pm2 start mm.sh --name "LuminaSmartMirror"
   pm2 save
   ```

Now your Smart Mirror will launch automatically every time the Pi powers on!

---

## 🔧 6. Hardware Troubleshooting & Tips

- **Face Recognition Dlib Build Times out or Out of Memory:**
  If compiling `dlib` fails due to RAM usage on 2GB/4GB Raspberry Pi, temporarily increase your swap size before running `./setup.sh`:

  ```bash
  sudo dphys-swapfile swapoff
  sudo nano /etc/dphys-swapfile # Set CONF_SWAPSIZE=2048
  sudo dphys-swapfile setup
  sudo dphys-swapfile swapon
  ```

- **Webcam Not Detected:**
  Verify that the camera is recognized by the OS:

  ```bash
  ls -l /dev/video*
  ```

- **Microphone Not Detected:**
  Verify USB audio recording devices:

  ```bash
  arecord -l
  ```

- **Hide Mouse Cursor on Mirror Display:**
  `unclutter -idle 0.5 -root &` will automatically hide the mouse cursor when idle.

---

## 👥 Core System & Support

Developed for the **Lumina / SOMA Smart Mirror Platform**.  
For updates and issues, refer to the main repository documentation.
