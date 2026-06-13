Module.register("MMM-FaceWatcher", {
	// Default config values
	defaults: {
		updateInterval: 2000 // file polling speed in ms
	},

	// Module startup hook
	start () {
		Log.info(`Starting module: ${this.name}`);

		// Initial guest state layout
		this.userData = {
			recognized: false,
			user: "",
			welcomeMessage: "",
			lastSeen: null
		};

		// Notify node helper to begin file monitoring
		this.sendSocketNotification("START_WATCHING", {
			updateInterval: this.config.updateInterval
		});
	},

	// Get CSS style sheets
	getStyles () {
		return []; // Embedded CSS is injected inside getDom to keep module self-contained
	},

	// Render HTML DOM structure
	getDom () {
		const wrapper = document.createElement("div");
		wrapper.className = "mmm-facewatcher-wrapper";

		// Minimal black & white styling
		const style = document.createElement("style");
		style.textContent = `
            .mmm-facewatcher-wrapper {
                padding: 12px 16px;
                background: #000000;
                color: #ffffff;
                font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                border-radius: 12px;
                min-width: 200px;
            }
            .mmm-facewatcher-header {
                display: flex;
                align-items: center;
                font-size: 1.2rem;
                font-weight: 600;
                gap: 8px;
            }
            .mmm-facewatcher-status-dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                display: inline-block;
                background-color: ${this.userData.recognized ? '#10b981' : '#ef4444'};
            }
            .mmm-facewatcher-message {
                margin-top: 8px;
                font-size: 0.95rem;
                color: #d1d5db;
            }
        `;
		wrapper.appendChild(style);

		const header = document.createElement("div");
		header.className = "mmm-facewatcher-header";
		const statusDot = document.createElement("span");
		statusDot.className = "mmm-facewatcher-status-dot";
		header.appendChild(statusDot);
		const nameTitle = document.createElement("span");
		nameTitle.innerText = this.userData.recognized ? `Hello, ${this.userData.user}` : "";
		header.appendChild(nameTitle);
		wrapper.appendChild(header);

		const msg = document.createElement("div");
		msg.className = "mmm-facewatcher-message";
		msg.innerText = this.userData.welcomeMessage || "";
		wrapper.appendChild(msg);

		return wrapper;
	},

	// Listen to socket notifications from node_helper
	socketNotificationReceived (notification, payload) {
		if (notification === "USER_UPDATED") {
			// Check if user has changed
			const isDifferentUser = this.userData.user !== payload.user || this.userData.recognized !== payload.recognized;

			this.userData = payload;

			// Re-render display layout
			this.updateDom(400); // 400ms fade transition

			// Optional: Broadcast theme changes to the broader MagicMirror environment
			if (isDifferentUser) {
				Log.log(`MMM-FaceWatcher: Profile updated to: ${payload.user}`);
				this.sendNotification("USER_PROFILE_CHANGED", payload);
			}
		}
	}
});
