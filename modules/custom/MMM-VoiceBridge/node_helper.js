/* global require, module */
const NodeHelper = require("node_helper");
const fs = require("fs");

module.exports = NodeHelper.create({

    start() {
        this.voiceFile = null;
        this.staleThresholdSeconds = 5;
        this.lastProcessedTimestamp = 0;
    },

    socketNotificationReceived(notification, payload) {
        if (notification !== "READ_VOICE_FILE") {
            return;
        }

        this.voiceFile = payload.path;
        this.staleThresholdSeconds = payload.staleThresholdSeconds;
        this.lastProcessedTimestamp = payload.lastProcessedTimestamp;
        this.readVoiceFile();
    },

    readVoiceFile() {
        if (!this.voiceFile) {
            this.sendSocketNotification("VOICE_FILE_RESULT", { processed: false });
            return;
        }

        fs.readFile(this.voiceFile, "utf8", (err, data) => {
            if (err) {
                this.sendSocketNotification("VOICE_FILE_RESULT", { processed: false });
                return;
            }

            let record;
            try {
                record = JSON.parse(data);
            } catch (parseError) {
                this.sendSocketNotification("VOICE_FILE_RESULT", { processed: false });
                return;
            }

            if (!record || typeof record !== "object") {
                this.sendSocketNotification("VOICE_FILE_RESULT", { processed: false });
                return;
            }

            const { command, timestamp } = record;
            if (typeof command !== "string" || typeof timestamp !== "number") {
                this.sendSocketNotification("VOICE_FILE_RESULT", { processed: false });
                return;
            }

            const ageSeconds = (Date.now() / 1000) - timestamp;
            if (ageSeconds > this.staleThresholdSeconds) {
                this.sendSocketNotification("VOICE_FILE_RESULT", { processed: false });
                return;
            }

            if (timestamp <= this.lastProcessedTimestamp) {
                this.sendSocketNotification("VOICE_FILE_RESULT", { processed: false });
                return;
            }

            this.lastProcessedTimestamp = timestamp;
            this.sendSocketNotification("VOICE_FILE_RESULT", {
                command,
                timestamp,
                processed: true,
            });
        });
    },
});
