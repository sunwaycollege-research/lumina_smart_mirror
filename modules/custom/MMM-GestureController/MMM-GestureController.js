/* global Module */

Module.register("MMM-GestureController", {

    defaults: {
        gestureFile: "/tmp/gesture.json",
        pollInterval: 1000,
        staleThresholdSeconds: 5,
    },

    start() {
        this.lastProcessedTimestamp = 0;
        this.timer = null;
        this.schedulePoll();
    },

    schedulePoll() {
        this.timer = setTimeout(() => {
            this.checkGestureFile();
        }, this.config.pollInterval);
    },

    checkGestureFile() {
        this.sendSocketNotification("READ_GESTURE_FILE", {
            path: this.config.gestureFile,
            staleThresholdSeconds: this.config.staleThresholdSeconds,
            lastProcessedTimestamp: this.lastProcessedTimestamp,
        });
        this.schedulePoll();
    },

    socketNotificationReceived(notification, payload) {
        if (notification !== "GESTURE_FILE_RESULT") {
            return;
        }

        if (!payload || typeof payload !== "object") {
            return;
        }

        const { gesture, timestamp, processed } = payload;
        if (!processed) {
            return;
        }

        if (timestamp <= this.lastProcessedTimestamp) {
            return;
        }

        this.lastProcessedTimestamp = timestamp;

        if (gesture === "LEFT") {
            this.sendNotification("PAGE_DECREMENT");
        } else if (gesture === "RIGHT") {
            this.sendNotification("PAGE_INCREMENT");
        }
    },

    notificationReceived(notification, payload, sender) {
        // no-op
    },
});
