# soma_smart_mirror (Lumina Smart Mirror Ecosystem)

SOMA is an interactive smart mirror ecosystem designed to bring ambient, on-device intelligence into modern environments. By combining computer vision, spatial sensors, and a semi-transparent dielectric optical surface, SOMA turns a standard mirror into a privacy-first, context-aware information portal.

🌐 **Live Website:** [https://dawgybey.github.io/lumina/](https://dawgybey.github.io/lumina/)  
_(Note: Project is transitioning from Lumina to the SOMA framework)._

---

## 🚀 Key Features

- **100% Local Inference:** Built with a strict privacy-first architecture. All computer vision and data processing happen entirely on the local device—no cloud uploads.
- **Continuous Temporal Gesture Verification:** Real-time MediaPipe hand pose tracking with hold-to-confirm temporal verification (`0%` → `100%` progress HUD pill), eliminating false triggers and twitchy navigation.
- **rPPG Biological Telemetry:** Optical blood volume pulse analysis recovering heart rate (BPM), HRV (ms), stress level (%), and respiration rate (RPM) directly from webcam frames.
- **Biometric Face Recognition & Web Registration:** Real-time face recognition with multi-user profiles and an interactive web registration portal (`/register`).
- **Proactive Proximity Sensing:** Uses PIR motion detection and ultrasonic distance mapping to dynamically wake up the display as a user approaches.
- **Dielectric Optical Layer:** Uses specialized two-way glass over a high-luminance display panel, appearing as a premium mirror when idle and rendering crisp UI elements when active.

---

## 🛠️ Hardware Stack

- **Compute Unit:** Raspberry Pi 4 / Raspberry Pi 5 (64-bit OS)
- **Optics:** High-transmittance two-way acrylic glass + 500-nit LCD panel
- **Sensors & Input:** Ultrasonic Distance Sensors, PIR Motion Detectors, HD Webcam / Pi Camera Module, USB Microphone

---

## ⚙️ Quick Start (Raspberry Pi Setup)

> 📘 **Full Raspberry Pi Installation Guide:** For complete package lists, system setup, hardware permission fixes, and auto-boot PM2 setup, see **[RASPBERRY_PI_SETUP.md](file:///home/dawgybey/DejaVu/lumina_smart_mirror/RASPBERRY_PI_SETUP.md)**.

### 1. Install System Dependencies & Node 22

```bash
sudo apt update && sudo apt install -y build-essential cmake gfortran g++ pkg-config git curl python3 python3-pip python3-venv python3-dev libgl1-mesa-glx libglib2.0-0 portaudio19-dev
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Clone the Repository & Install Node Packages

```bash
git clone https://github.com/dawgybey/lumina.git
cd lumina
npm install
```

### 3. Setup Python AI Virtual Environment & Dependencies

```bash
chmod +x setup.sh
./setup.sh
```

### 4. Start Smart Mirror

```bash
# Display mode (X11 / Wayland Desktop)
npm start

# Or Headless Browser Server mode
npm run server
```

---

## 👥 Core Team & Mentors

### Engineering Team

- **Utkirsta Adhikari** — Hardware & Team Lead
- **Sulav Nepal** — AI Software Engineer
- **Prince KC** — UI/UX Designer
- **Nishant Kumar Kharga** — Integration Engineer
- **Anusha Ghimire** — Systems QA & Testing

### Mentors

- **Mr. Ayush Dangol** — HCI & Embedded Systems Specialist
- **Mr. Raj Kumar Chaurasiya** — Computer Vision & Edge AI Expert

---

## 📄 Recognition

Developed for the SUNWAY RAIN Innovation Summit.

© 2025 ALL RIGHTS RESERVED.
