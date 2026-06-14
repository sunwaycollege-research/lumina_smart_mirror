const NodeHelper = require("node_helper");
const fs = require("fs");
const path = require("path");

// Compute cross-platform gesture file path: <project_root>/temp/gesture.json
const PROJECT_ROOT = path.resolve(__dirname, "..", "..", "..");
const DEFAULT_GESTURE_FILE = path.join(PROJECT_ROOT, "temp", "gesture.json");

module.exports = NodeHelper.create({
    start: function() {
        this.timer = null;
        this.lastTimestamp = 0;
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "START_POLLING") {
            this.config = payload;
            this.poll();
        }
    },

    poll: function() {
        const gestureFile = (this.config && this.config.gestureFile) ? this.config.gestureFile : DEFAULT_GESTURE_FILE;
        fs.readFile(gestureFile, "utf8", (err, data) => {
            if (!err) {
                try {
                    const record = JSON.parse(data);
                    const timestamp = record.timestamp;
                    const ageSeconds = (Date.now() / 1000) - timestamp;

                    if (ageSeconds <= this.config.staleThresholdSeconds && timestamp > this.lastTimestamp) {
                        this.lastTimestamp = timestamp;
                        this.sendSocketNotification("GESTURE_DETECTED", record);
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            }

            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                this.poll();
            }, this.config.pollInterval);
        });
    }
});
