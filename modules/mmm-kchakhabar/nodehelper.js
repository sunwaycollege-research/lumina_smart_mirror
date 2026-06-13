const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
    start: function () {
        console.log("KChakhabar Secure Network Node Engine Initialized.");
    },

    socketNotificationReceived: async function (notification, payload) {
        if (notification === "FETCH_KCHAKHABAR_JSON") {
            await this.pullStories();
        }
    },

    async pullStories() {
        try {
            console.log("Initiating network handshake with KChakhabar API...");

            // Configure explicit headers to simulate a clean browser request context
            const response = await fetch("https://kchakhabar.com/api/v1/today.json", {
                method: "GET",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 SmartMirror/2.0",
                    "Accept": "application/json",
                    "Cache-Control": "no-cache"
                },
                signal: AbortSignal.timeout(8000) // Don't let hanging sockets freeze the mirror framework
            });

            if (!response.ok) {
                throw new Error(`HTTP Endpoint Error! System status returned: ${response.status}`);
            }

            const data = await response.json();

            // Extensively look for the data payload array variants
            let storiesList = [];
            if (data) {
                if (Array.isArray(data.stories)) storiesList = data.stories;
                else if (Array.isArray(data.articles)) storiesList = data.articles;
                else if (Array.isArray(data)) storiesList = data;
            }

            console.log(`Successfully mapped ${storiesList.length} local stories from Kathmandu wire.`);

            // Ship payload array directly back up to screen module container
            this.sendSocketNotification("KCHAKHABAR_DATA_SHIPPED", storiesList);

        } catch (err) {
            console.error("⛔ [mmm-kchakhabar] Network fetch routine failed:", err.message);

            // Instead of sending an empty array that breaks layout loading states, 
            // inject a mock tracking record to inform the user visually of the network status
            this.sendSocketNotification("KCHAKHABAR_DATA_SHIPPED", [
                { title: `Local News Sync Temporarily Offline (Error: ${err.message})` }
            ]);
        }
    }
});