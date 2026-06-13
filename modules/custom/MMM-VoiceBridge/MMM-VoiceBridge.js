/* global Module */

Module.register("MMM-VoiceBridge", {

    defaults: {
        voiceFile: "/tmp/voice.json",
        pollInterval: 1000,
        staleThresholdSeconds: 5,
    },

    start() {
        this.lastProcessedTimestamp = 0;
        this.schedulePoll();
    },

    schedulePoll() {
        this.timer = setTimeout(() => {
            this.checkVoiceFile();
        }, this.config.pollInterval);
    },

    checkVoiceFile() {
        this.sendSocketNotification("READ_VOICE_FILE", {
            path: this.config.voiceFile,
            staleThresholdSeconds: this.config.staleThresholdSeconds,
            lastProcessedTimestamp: this.lastProcessedTimestamp,
        });
        this.schedulePoll();
    },

    socketNotificationReceived(notification, payload) {
        if (notification !== "VOICE_FILE_RESULT") {
            return;
        }

        if (!payload || typeof payload !== "object") {
            return;
        }

        const { command, timestamp, processed } = payload;
        if (!processed) {
            return;
        }

        if (timestamp <= this.lastProcessedTimestamp) {
            return;
        }

        this.lastProcessedTimestamp = timestamp;

        if (command === "NEXT") {
            this.sendNotification("PAGE_INCREMENT");
        } else if (command === "PREVIOUS") {
            this.sendNotification("PAGE_DECREMENT");
        } else if (command === "SHOW_SCHEDULE") {
            this.sendNotification("SHOW_SCHEDULE");
        } else if (command === "SHOW_HEALTH") {
            this.sendNotification("SHOW_HEALTH");
        }
    },

    notificationReceived(notification, payload, sender) {
        // no-op
    },
});
