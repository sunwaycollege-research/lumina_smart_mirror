const NodeHelper = require("node_helper");
const { exec } = require("child_process");
const path = require("path");

module.exports = NodeHelper.create({
    start: function() {
        console.log("[LUMINA CORE SYSTEM] Initializing System Core Daemons...");
        this.launchCoreDaemon();
    },

    launchCoreDaemon: function() {
        const backendDir = path.join(__dirname, "backend");
        const venvUvicorn = path.join(__dirname, "..", "..", ".venv", "bin", "uvicorn");
        const cmd = `"${venvUvicorn}" main:app --host 127.0.0.1 --port 8000`;
        this.coreProcess = exec(cmd, { cwd: backendDir });

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
    }
});