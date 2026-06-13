const NodeHelper = require("node_helper");
const ical = require("node-ical");

module.exports = NodeHelper.create({
    start: function () {
        console.log("SOMA Schedule Sync Backend Helper initialized.");
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "GET_SOMA_DATA") {
            this.fetchGoogleCalendar(payload.scheduleApiUrl);
        }
    },

    async fetchGoogleCalendar(url) {
        try {
            const data = await ical.fromURL(url);
            let schedule = [];
            let announcements = [];

            const startRange = new Date();
            startRange.setHours(0, 0, 0, 0);
            const endRange = new Date();
            endRange.setDate(startRange.getDate() + 7); // Pull a rolling 7-day calendar window

            for (let k in data) {
                if (data.hasOwnProperty(k)) {
                    const ev = data[k];
                    if (ev.type === "VEVENT" && ev.start) {
                        const eventDate = new Date(ev.start);

                        if (eventDate >= startRange && eventDate <= endRange) {
                            const isAllDay = !ev.start.getHours() && !ev.start.getMinutes() && !ev.start.getSeconds();
                            const dateLabel = eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

                            if (isAllDay) {
                                announcements.push({ title: `${dateLabel} - ${ev.summary}` });
                            } else {
                                const timeFormatted = eventDate.toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                });
                                schedule.push({ time: `${dateLabel} ${timeFormatted}`, title: ev.summary });
                            }
                        }
                    }
                }
            }

            // Sort chronically
            schedule.sort((a, b) => new Date(a.time.split(" ")[0]) - new Date(b.time.split(" ")[0]));

            this.sendSocketNotification("SOMA_DATA_RECEIVED", {
                schedule: schedule,
                announcements: announcements
            });
        } catch (error) {
            console.error("SOMA Calendar Sync Error: ", error);
            this.sendSocketNotification("SOMA_DATA_RECEIVED", { schedule: [], announcements: [] });
        }
    }
});