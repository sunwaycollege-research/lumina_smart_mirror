Module.register("mmm-kchakhabar", {
    defaults: {
        updateInterval: 10000, // Rotate headlines every 10 seconds
        fetchInterval: 300000  // Refresh from API every 5 minutes
    },

    start: function () {
        Log.info("Launching KChakhabar Dynamic News Core...");
        this.stories = [];
        this.activeIdx = 0;
        this.loaded = false;

        // Fetch immediately on startup
        this.sendSocketNotification("FETCH_KCHAKHABAR_JSON");

        // Schedule continuous background api sync cycles safely
        setInterval(() => {
            this.sendSocketNotification("FETCH_KCHAKHABAR_JSON");
        }, this.config.fetchInterval);

        // Schedule ticker rotations safely without dropping execution context
        setInterval(() => {
            this.rotateHeadline();
        }, this.config.updateInterval);
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "KCHAKHABAR_DATA_SHIPPED") {
            // Protect against empty or malformed payloads
            if (payload && Array.isArray(payload) && payload.length > 0) {
                this.stories = payload;
                this.loaded = true;
                this.updateDom(300); // Smooth 300ms fade transition
            } else {
                Log.error("KChakhabar payload arrived empty or structurally broken.");
                this.loaded = true; // Let the DOM update know we finished trying
                this.updateDom(300);
            }
        }
    },

    rotateHeadline: function () {
        if (this.stories && this.stories.length > 1) {
            this.activeIdx = (this.activeIdx + 1) % this.stories.length;
            this.updateDom(300); // Fade out old headline, fade in new one
        }
    },

    getDom: function () {
        let wrapper = document.createElement("div");
        wrapper.className = "newsfeed";

        // If the backend has not responded yet
        if (!this.loaded) {
            wrapper.innerHTML = "<div class='dimmed small' style='letter-spacing: 0.15em;'>SYNCING KCHAKHABAR INTELLIGENCE MATRIX...</div>";
            return wrapper;
        }

        // Fallback layout if the array is entirely empty
        if (!this.stories || this.stories.length === 0) {
            wrapper.innerHTML = "<div class='dimmed small' style='letter-spacing: 0.15em;'>NO LOCALIZED STORIES ACTIVE FOR TODAY</div>";
            return wrapper;
        }

        let currentStory = this.stories[this.activeIdx];

        // Format clean, minimal markup blocks matching your premium custom.css
        let sourceTitle = document.createElement("div");
        sourceTitle.className = "newsfeed-source";
        sourceTitle.innerText = "K CHAKHABAR • KATHMANDU INTELLIGENCE";

        let headlineText = document.createElement("div");
        headlineText.className = "newsfeed-title";

        // Safety checks for API item structures (handles .title or .story_title keys)
        headlineText.innerText = currentStory.title || currentStory.story_title || "Untitled Intelligence Record";

        wrapper.appendChild(sourceTitle);
        wrapper.appendChild(headlineText);
        return wrapper;
    }
});