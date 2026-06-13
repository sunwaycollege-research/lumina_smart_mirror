/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
	start () {
		console.log("MMM-FaceWatcher: node_helper initialized.");
		this.dataPath = path.join(__dirname, "face_data.json");
		this.lastData = "";
		this.intervalId = null;
	},

	socketNotificationReceived (notification, payload) {
		if (notification === "START_WATCHING") {
			this.startWatching(payload.updateInterval || 2000);
		}
	},

	startWatching (interval) {
		if (this.intervalId) {
			clearInterval(this.intervalId);
		}

		// Immediate initial read
		this.readData();

		// Check for updates periodically
		this.intervalId = setInterval(() => {
			this.readData();
		}, interval);
	},

	readData () {
		// Handle case where file does not exist yet (e.g. before first Python run)
		if (!fs.existsSync(this.dataPath)) {
			const defaultData = {
				recognized: false,
				user: "Unknown",
				theme: "dark",
				role: "Guest",
				welcomeMessage: "Hello! Register to personalize.",
				lastSeen: new Date().toISOString()
			};
			try {
				fs.writeFileSync(this.dataPath, JSON.stringify(defaultData, null, 4));
			} catch (err) {
				console.error("MMM-FaceWatcher: Failed to write initial face_data.json: ", err);
			}
			this.sendSocketNotification("USER_UPDATED", defaultData);
			return;
		}

		fs.readFile(this.dataPath, "utf8", (err, data) => {
			if (err) {
				console.error("MMM-FaceWatcher: Error reading face_data.json: ", err);
				return;
			}

			// Do not send updates if content is identical (reduces socket noise)
			if (data === this.lastData) {
				return;
			}

			try {
				const parsed = JSON.parse(data);
				this.lastData = data;

				// Broadcast updated user state to front-end module
				this.sendSocketNotification("USER_UPDATED", parsed);
			} catch {
				// Occurs occasionally if Python is actively writing when read occurs
				// Ignore parsing errors and retry during the next interval
			}
		});
	},

	stop () {
		if (this.intervalId) {
			clearInterval(this.intervalId);
		}
	}
});

