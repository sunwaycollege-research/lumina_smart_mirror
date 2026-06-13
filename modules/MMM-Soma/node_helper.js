const NodeHelper = require("node_helper");
const ical = require("node-ical");

module.exports = NodeHelper.create({
    start: function () {
        console.log("SOMA Google Sync Core online.");
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
            const todayStr = new Date().toDateString();

            for (let k in data) {
                if (data.hasOwnProperty(k)) {
                    const ev = data[k];
                    if (ev.type === "VEVENT" && ev.start) {
                        const eventDateStr = new Date(ev.start).toDateString();

                        if (eventDateStr === todayStr) {
                            const isAllDay = !ev.start.getHours() && !ev.start.getMinutes() && !ev.start.getSeconds();

                            if (isAllDay) {
                                announcements.push({ title: ev.summary });
                            } else {
                                const timeFormatted = ev.start.toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                });
                                schedule.push({ time: timeFormatted, title: ev.summary });
                            }
                        }
                    }
                }
            }

            schedule.sort((a, b) => new Date("1970/01/01 " + a.time) - new Date("1970/01/01 " + b.time));

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