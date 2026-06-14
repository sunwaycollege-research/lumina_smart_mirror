Module.register("MMM-GestureStatus", {
    defaults: {
        gestureFile: require("os").tmpdir().replace(/\\/g, "/") + "/gesture.json",
        pollInterval: 1000,
        staleThresholdSeconds: 5,
        displayDuration: 2000
    },

    getStyles: function() {
        return ["MMM-GestureStatus.css"];
    },

    start: function() {
        this.currentGesture = null;
        this.lastTimestamp = 0;
        this.resetTimer = null;
        this.message = "Ready for gesture...";
        this.sendSocketNotification("START_POLLING", this.config);
    },

    getDom: function() {
        var wrapper = document.createElement("div");
        wrapper.className = "gesture-status-wrapper";

        var header = document.createElement("div");
        header.className = "gesture-status-header";
        header.innerHTML = "Gesture Control";
        wrapper.appendChild(header);

        var content = document.createElement("div");
        content.className = "gesture-status-content " + (this.currentGesture ? "active" : "");
        content.innerHTML = this.message;
        wrapper.appendChild(content);

        return wrapper;
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "GESTURE_DETECTED") {
            const { gesture, timestamp } = payload;
            
            if (timestamp > this.lastTimestamp) {
                this.lastTimestamp = timestamp;
                this.currentGesture = gesture;
                
                switch (gesture) {
                    case "LEFT": this.message = "&larr; Left Swipe Detected"; break;
                    case "RIGHT": this.message = "&rarr; Right Swipe Detected"; break;
                    case "UP": this.message = "&uarr; Up Swipe Detected"; break;
                    case "DOWN": this.message = "&darr; Down Swipe Detected"; break;
                    default: this.message = gesture + " Detected"; break;
                }
                
                this.updateDom();
                
                if (this.resetTimer) {
                    clearTimeout(this.resetTimer);
                }
                
                this.resetTimer = setTimeout(() => {
                    this.currentGesture = null;
                    this.message = "Ready for gesture...";
                    this.updateDom();
                }, this.config.displayDuration);
            }
        }
    }
});
