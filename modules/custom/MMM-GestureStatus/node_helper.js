const NodeHelper = require("node_helper");
const fs = require("fs");

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
        if (!this.config || !this.config.gestureFile) return;

        fs.readFile(this.config.gestureFile, "utf8", (err, data) => {
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
