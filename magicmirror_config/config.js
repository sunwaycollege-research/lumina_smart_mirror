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

				// Replaces the old "summaryApiUrl" key, which was never
				// actually read by the module (dead config - setting it did
				// nothing). apiBaseUrl is now used to build BOTH the
				// /api/dashboard/summary and /api/dashboard/news calls.
				// Only the host:port matters here, no path.
				apiBaseUrl: "http://127.0.0.1:8000",

				// Registry key from services/face-recognition/profiles/users.json
				// (NOT the display "name" field - e.g. use "Sulav", not
				// "Dawgybey") to show summary stats for before anyone's
				// face has actually been recognized yet. Leave "" to just
				// wait for a real recognition instead of guessing.
				fallbackUsername: "",

				// Cosmetic only: the name shown in "Good morning, ___"
				// before anyone's recognized. Has no effect on data lookups.
				fallbackDisplayName: "there"
			}
		}
	]
};

if (typeof module !== "undefined") { module.exports = config; }
