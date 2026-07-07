let config = {
    address: "0.0.0.0",
    port: 8082,
    basePath: "/",
    ipWhitelist: ["127.0.0.1", "::ffff:127.0.0.1", "::1"],
    useHttps: false,
    httpsPrivateKey: "",
    httpsCertificate: "",
    language: "en",
    locale: "en-US",
    logLevel: ["INFO", "LOG", "WARN", "ERROR"],
    timeFormat: 12,
    units: "metric",

    modules: [
        {
            module: "alert"
        },
        // --- LUMINA MULTI-MODAL CENTRAL AI OS DASHBOARD ---
        {
            module: "MMM-LuminaDashboard",
            position: "fullscreen_above",
            config: {
                websocketUrl: "ws://127.0.0.1:8000/ws/dashboard/stream",
                summaryApiUrl: "http://127.0.0.1:8000/api/dashboard/summary/Commander"
            }
        }
    ]
};

if (typeof module !== "undefined") { module.exports = config; }