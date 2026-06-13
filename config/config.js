let config = {
	address: "localhost",
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
		// --- USER INTELLIGENCE: FACE WATCHER PROFILE INTEGRATION ---
		{
			module: "custom/MMM-FaceWatcher",
			position: "top_left",
			config: {
				updateInterval: 2000
			}
		}
	]
};

if (typeof module !== "undefined") { module.exports = config; }