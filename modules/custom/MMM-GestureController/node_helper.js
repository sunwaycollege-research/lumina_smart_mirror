/* global require, module */
const NodeHelper = require("node_helper");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

module.exports = NodeHelper.create({

    start() {
        this.voiceFile = null; // Clean/reset if needed
        this.gestureFile = null;
        this.staleThresholdSeconds = 5;
        this.lastProcessedTimestamp = 0;
        this.gestureProcess = null;

        // Clean up any existing orphan gesture.py processes first
        try {
            const { execSync } = require("child_process");
            if (process.platform === "win32") {
                execSync('powershell -Command "Get-CimInstance Win32_Process -Filter \\"name = \'python.exe\'\\" | Where-Object { $_.CommandLine -like \'*gesture.py*\' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"');
            } else {
                execSync("pkill -f gesture.py || true");
            }
            console.log("[MMM-GestureController] Cleaned up existing gesture processes");
        } catch (e) {
            console.warn("[MMM-GestureController] Warning during cleanup of old processes: " + e.message);
        }

        this.spawnGestureService();
    },

    spawnGestureService() {
        // Resolve the project root (3 levels up from modules/custom/MMM-GestureController)
        const projectRoot = path.resolve(__dirname, "..", "..", "..");
        const scriptPath = path.join(projectRoot, "services", "gestures", "gesture.py");

        // Try .venv first, then fall back to system python
        const venvPython = path.join(projectRoot, ".venv", "Scripts", "python.exe");
        const pythonCmd = fs.existsSync(venvPython) ? venvPython : "python";

        console.log(`[MMM-GestureController] Launching gesture service: ${pythonCmd} ${scriptPath}`);

        this.gestureProcess = spawn(pythonCmd, [scriptPath, "--headless"], {
            cwd: path.join(projectRoot, "services", "gestures"),
            stdio: ["pipe", "pipe", "pipe"],
            env: { ...process.env, PYTHONUNBUFFERED: "1" },
        });

        this.gestureProcess.stdout.on("data", (data) => {
            const lines = data.toString().trim().split("\n");
            for (const line of lines) {
                if (line) console.log(`[gesture.py] ${line}`);
            }
        });

        this.gestureProcess.stderr.on("data", (data) => {
            const lines = data.toString().trim().split("\n");
            for (const line of lines) {
                // Filter out noisy TF/MediaPipe warnings
                if (line && !line.includes("oneDNN") && !line.includes("absl::")) {
                    console.log(`[gesture.py] ${line}`);
                }
            }
        });

        this.gestureProcess.on("error", (err) => {
            console.error(`[MMM-GestureController] Failed to start gesture service: ${err.message}`);
        });

        this.gestureProcess.on("close", (code) => {
            console.log(`[MMM-GestureController] Gesture service exited with code ${code}`);
            this.gestureProcess = null;
        });
    },

    stop() {
        if (this.gestureProcess) {
            console.log("[MMM-GestureController] Stopping gesture service...");
            this.gestureProcess.kill("SIGTERM");
            this.gestureProcess = null;
        }
    },

    socketNotificationReceived(notification, payload) {
        if (notification !== "READ_GESTURE_FILE") {
            return;
        }

        this.gestureFile = payload.path;
        this.staleThresholdSeconds = payload.staleThresholdSeconds;
        this.lastProcessedTimestamp = payload.lastProcessedTimestamp;
        this.readGestureFile();
    },

    readGestureFile() {
        if (!this.gestureFile) {
            this.sendSocketNotification("GESTURE_FILE_RESULT", { processed: false });
            return;
        }

        fs.readFile(this.gestureFile, "utf8", (err, data) => {
            if (err) {
                this.sendSocketNotification("GESTURE_FILE_RESULT", { processed: false });
                return;
            }

            let record;
            try {
                record = JSON.parse(data);
            } catch (parseError) {
                this.sendSocketNotification("GESTURE_FILE_RESULT", { processed: false });
                return;
            }

            if (!record || typeof record !== "object") {
                this.sendSocketNotification("GESTURE_FILE_RESULT", { processed: false });
                return;
            }

            const { gesture, timestamp } = record;
            if (typeof gesture !== "string" || typeof timestamp !== "number") {
                this.sendSocketNotification("GESTURE_FILE_RESULT", { processed: false });
                return;
            }

            const ageSeconds = (Date.now() / 1000) - timestamp;
            if (ageSeconds > this.staleThresholdSeconds) {
                this.sendSocketNotification("GESTURE_FILE_RESULT", { processed: false });
                return;
            }

            if (timestamp <= this.lastProcessedTimestamp) {
                this.sendSocketNotification("GESTURE_FILE_RESULT", { processed: false });
                return;
            }

            this.lastProcessedTimestamp = timestamp;
            this.sendSocketNotification("GESTURE_FILE_RESULT", {
                gesture,
                timestamp,
                processed: true,
            });
        });
    },
});
