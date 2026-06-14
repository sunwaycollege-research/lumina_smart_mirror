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
		// --- LEFT COLUMN: TIME & WEATHER METRICS ---
		{
			module: "clock",
			position: "top_left",
			config: {
				displaySeconds: false,
				showPeriod: true,
				showDate: true
			}
		},
		{
			module: "custom/MMM-GestureStatus",
			position: "top_left",
			config: {
				gestureFile: require("path").join(__dirname, "..", "temp", "gesture.json"),
				pollInterval: 1000,
				staleThresholdSeconds: 5,
				displayDuration: 2000
			}
		},
		{
			module: "weather",
			position: "bottom_left",
			config: {
				weatherProvider: "openmeteo",
				type: "current",
				lat: 27.7172,
				lon: 85.3240,
				showWindDirection: false,
				showSun: false
			}
		},
		{
			module: "weather",
			position: "bottom_left",
			header: "FORECAST", // Cleaned to match minimalist uppercase styles
			config: {
				weatherProvider: "openmeteo",
				type: "forecast",
				lat: 27.7172,
				lon: 85.3240,
				maxNumberOfItems: 5
			}
		},
		// --- RIGHT COLUMN: SOMA SYSTEMS OPERATIONS ---
		{
			module: "soma-schedule-sync",
			position: "top_right",
			header: "SOMA INTEGRATED SYSTEM",
			config: {
				scheduleApiUrl: "https://ics.calendarlabs.com/76/mm3137/US_Holidays.ics",
				noticeApiUrl: "https://ics.calendarlabs.com/76/mm3137/US_Holidays.ics",
				updateInterval: 300000
			}
		},
		// --- BOTTOM HORIZONTAL TICKER: LOCAL INTELLIGENCE ---
		{
			module: "mmm-kchakhabar",
			position: "bottom_bar"
		},
		// --- RIGHT-CENTER: rPPG Health Monitor ---
		{
			module: "healthdashboard",
			position: "bottom_bar",
			config: {
				updateInterval: 100,
				cameraWidth: 320,
				cameraHeight: 240,
				// Wait 30s before opening camera so the gesture service (gesture.py)
				// grabs the webcam first. Without this delay, getUserMedia locks the
				// camera and OpenCV in gesture.py gets empty frames.
				startDelay: 30000
			}
		},
		// --- USER INTELLIGENCE: FACE WATCHER PROFILE INTEGRATION ---
		{
			module: "custom/MMM-FaceWatcher",
			position: "top_left",
			config: {
				updateInterval: 2000
			}
		},
		// --- GESTURE CONTROL ---
		{
			module: "custom/MMM-GestureController",
			config: {
				gestureFile: require("path").join(__dirname, "..", "temp", "gesture.json"),
				pollInterval: 1000,
				staleThresholdSeconds: 5,
			}
		},
		// --- VOICE RECOGNITION ---
		{
			module: "custom/MMM-VoiceBridge",
			config: {
				voiceFile: require("path").join(__dirname, "..", "temp", "voice.json"),
				pollInterval: 1000,
				staleThresholdSeconds: 5,
			}
		}
	]
};

if (typeof module !== "undefined") { module.exports = config; }