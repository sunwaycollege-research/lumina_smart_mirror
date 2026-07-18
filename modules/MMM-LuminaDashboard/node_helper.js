const NodeHelper = require("node_helper");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

module.exports = NodeHelper.create({
    start: function() {
        console.log("[LUMINA CORE SYSTEM] Initializing System Core Daemons...");
        this.restartAttempts = 0;
        this.launchCoreDaemon();
    },

    // Resolve which python/uvicorn to run the backend with.
    // Expects a venv at <project_root>/.venv (created via the backend's requirements.txt).
    // Falls back to plain "python3 -m uvicorn" on PATH if no venv is found, so failures
    // are loud instead of silent.
    resolveUvicornCommand: function() {
        const projectRoot = path.join(__dirname, "..", "..");
        const venvUvicorn = process.platform === "win32"
            ? path.join(projectRoot, ".venv", "Scripts", "uvicorn.exe")
            : path.join(projectRoot, ".venv", "bin", "uvicorn");

        if (fs.existsSync(venvUvicorn)) {
            return { cmd: venvUvicorn, args: ["main:app", "--host", "127.0.0.1", "--port", "8000"] };
        }

        console.error(
            `[LUMINA CORE SYSTEM] No venv found at ${path.join(projectRoot, ".venv")}. ` +
            `Falling back to system "python3 -m uvicorn". Run setup.sh at the project root ` +
            `to create the expected .venv with modules/MMM-LuminaDashboard/backend/requirements.txt installed.`
        );
        return { cmd: "python3", args: ["-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"] };
    },

    launchCoreDaemon: function() {
        const backendDir = path.join(__dirname, "backend");
        const { cmd, args } = this.resolveUvicornCommand();

        console.log(`[LUMINA CORE SYSTEM] Launching backend: ${cmd} ${args.join(" ")} (cwd=${backendDir})`);

        this.coreProcess = spawn(cmd, args, { cwd: backendDir });

        // Without this, a failed spawn (e.g. missing binary) throws an uncaught
        // "error" event and/or fails completely silently — this is the fix.
        this.coreProcess.on("error", (err) => {
            console.error(`[LUMINA CORE SYSTEM] Failed to start backend process: ${err.message}`);
            console.error(
                "[LUMINA CORE SYSTEM] Make sure a Python venv exists with the backend requirements installed. " +
                "See setup.sh at the project root."
            );
        });

        this.coreProcess.on("exit", (code, signal) => {
            console.warn(`[LUMINA CORE SYSTEM] Backend process exited (code=${code}, signal=${signal}).`);
            if (this.restartAttempts < 5) {
                this.restartAttempts += 1;
                console.log(`[LUMINA CORE SYSTEM] Attempting restart ${this.restartAttempts}/5 in 3s...`);
                setTimeout(() => this.launchCoreDaemon(), 3000);
            } else {
                console.error("[LUMINA CORE SYSTEM] Backend keeps crashing. Giving up auto-restart; check logs above.");
            }
        });

        this.coreProcess.stdout.on("data", (data) => {
            this.handleLogData(data, false);
        });

        this.coreProcess.stderr.on("data", (data) => {
            this.handleLogData(data, true);
        });
    },

    handleLogData: function(data, isStderrStream) {
        if (!data) return;
        const lines = data.toString().split(/\r?\n/);

        // Define spam patterns to filter out completely
        const spamPatterns = [
            "InitializeLog()",
            "gl_context_egl.cc",
            "gl_context.cc",
            "XNNPACK delegate",
            "feedback_manager.cc",
            "landmark_projection_calculator.cc",
            "NORM_RECT without IMAGE_DIMENSIONS"
        ];

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            // Check for ignore/spam matches
            const isSpam = spamPatterns.some(pattern => trimmed.includes(pattern));
            if (isSpam) {
                continue;
            }

            // Determine if the line represents an actual error or traceback
            const hasErrorKeyword = trimmed.includes("[ERROR]") ||
                                    trimmed.includes("ERROR:") ||
                                    trimmed.includes("Traceback") ||
                                    trimmed.includes("Exception") ||
                                    trimmed.includes("CRITICAL:") ||
                                    trimmed.toLowerCase().includes("failed");

            // Uvicorn/Python libraries print startup/info/warning to stderr.
            // Treat them as standard logs if they don't contain real error keywords.
            const isInfoOrWarning = trimmed.startsWith("INFO:") ||
                                    trimmed.startsWith("WARNING:") ||
                                    trimmed.includes("[INFO]") ||
                                    trimmed.includes("[WARNING]") ||
                                    trimmed.includes("[DEBUG]");

            if (isStderrStream && hasErrorKeyword && !isInfoOrWarning) {
                console.error(`[LUMINA OS ENGINE STDERR]: ${trimmed}`);
            } else {
                console.log(`[LUMINA OS ENGINE STDOUT]: ${trimmed}`);
            }
        }
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "LOG_GESTURE") {
            console.log(`[LUMINA OS ENGINE STDOUT]: [LUMINA HUD ACTION] Gesture triggered: ${payload}`);
        }
    },

    stop: function() {
        if (this.coreProcess) {
            this.coreProcess.removeAllListeners("exit");
            this.coreProcess.kill();
        }
    }
});
