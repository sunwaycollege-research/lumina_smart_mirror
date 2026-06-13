/* global require, module */
const NodeHelper = require("node_helper");
const fs = require("fs");
const path = require("path");

module.exports = NodeHelper.create({

    start() {
        this.gestureFile = null;
        this.staleThresholdSeconds = 5;
        this.lastProcessedTimestamp = 0;
    },

    socketNotificationReceived(notification, payload) {
        if (notification !== "READ_GESTURE_FILE") {
            return;
        }

        let targetPath = payload.path;
        if (targetPath === "/tmp/gesture.json" || targetPath === "tmp/gesture.json") {
            targetPath = path.resolve(__dirname, "../../tmp/gesture.json");
        }
        this.gestureFile = targetPath;
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
