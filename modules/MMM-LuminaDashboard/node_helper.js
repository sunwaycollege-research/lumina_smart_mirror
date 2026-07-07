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
            console.log(`[LUMINA OS ENGINE STDOUT]: ${data}`);
        });

        this.coreProcess.stderr.on("data", (data) => {
            console.error(`[LUMINA OS ENGINE STDERR]: ${data}`);
        });
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "LOG_GESTURE") {
            console.log(`[LUMINA OS ENGINE STDOUT]: [LUMINA HUD ACTION] Gesture triggered: ${payload}`);
        }
    }
});