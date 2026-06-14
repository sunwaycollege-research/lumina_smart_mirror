Module.register("healthdashboard", {
	defaults: {
		updateInterval: 100,
		cameraWidth: 320,
		cameraHeight: 240
	},

	heartRate: null,
	stressLevel: null,
	mood: null,
	hrv: null,
	ppgSignal: [],
	isProcessing: false,
	cameraActive: false,
	cameraStream: null,

	getStyles: function () {
		return ["/css/healthdashboard.css", "/css/font-awesome.css"];
	},

	start: function () {
		Log.info("Starting module: " + this.name);
		this.startCamera();
	},

	getDom: function () {
		var self = this;
		var wrapper = document.createElement("div");
		wrapper.id = "health-dashboard";
		wrapper.className = "health-dashboard";

		wrapper.innerHTML =
			'<div class="hd-header">' +
				'<span class="hd-title">Health Monitor</span>' +
			"</div>" +
			'<div class="hd-metrics">' +
				'<div class="hd-card">' +
					'<div class="hd-card-icon"><i class="fa fa-heartbeat"></i></div>' +
					'<div class="hd-card-body">' +
						'<div class="hd-card-value" id="hd-hr">--</div>' +
						'<div class="hd-card-label">Heart Rate <span class="hd-unit">BPM</span></div>' +
					"</div>" +
				"</div>" +
				'<div class="hd-card">' +
					'<div class="hd-card-icon"><i class="fa fa-tachometer"></i></div>' +
					'<div class="hd-card-body">' +
						'<div class="hd-card-value" id="hd-stress">--</div>' +
						'<div class="hd-card-label">Stress Level</div>' +
					"</div>" +
				"</div>" +
				'<div class="hd-card">' +
					'<div class="hd-card-icon"><i class="fa fa-smile-o"></i></div>' +
					'<div class="hd-card-body">' +
						'<div class="hd-card-value" id="hd-mood">--</div>' +
						'<div class="hd-card-label">Mood</div>' +
					"</div>" +
				"</div>" +
				'<div class="hd-card">' +
					'<div class="hd-card-icon"><i class="fa fa-area-chart"></i></div>' +
					'<div class="hd-card-body">' +
						'<div class="hd-card-value" id="hd-hrv">--</div>' +
						'<div class="hd-card-label">HRV <span class="hd-unit">ms</span></div>' +
					"</div>" +
				"</div>" +
			"</div>" +
			'<div class="hd-status" id="hd-status">Starting camera...</div>';

		return wrapper;
	},

	startCamera: async function () {
		var self = this;
		try {
			this.canvasElement = document.createElement("canvas");
			this.canvasElement.width = this.config.cameraWidth;
			this.canvasElement.height = this.config.cameraHeight;
			this.ctx = this.canvasElement.getContext("2d");

			this.cameraActive = true;
			this.updateStatus("Connecting to camera...");
			this.isProcessing = true;
			this.ppgSignal = [];
			this.processingLoop();
		} catch (err) {
			Log.error("Camera setup error:", err);
			this.updateStatus("Camera unavailable - " + err.message);
		}
	},

	processingLoop: function () {
		var self = this;
		if (!this.isProcessing) return;

		fetch("http://127.0.0.1:5001/frame")
			.then(function (response) {
				if (!response.ok) throw new Error("Frame not ready");
				return response.blob();
			})
			.then(function (blob) {
				return createImageBitmap(blob);
			})
			.then(function (bitmap) {
				self.ctx.drawImage(bitmap, 0, 0, self.config.cameraWidth, self.config.cameraHeight);
				var frameData = self.ctx.getImageData(0, 0, self.config.cameraWidth, self.config.cameraHeight);

				var signal = self.extractPPGSignal(frameData);
				self.ppgSignal.push(signal);

				if (self.ppgSignal.length > 300) {
					self.ppgSignal.shift();
				}

				if (self.ppgSignal.length >= 50) {
					var result = self.processHeartRate(self.ppgSignal);
					if (result && result.hr > 40 && result.hr < 220) {
						self.heartRate = Math.round(result.hr);
						self.hrv = Math.round(result.hrv);
						self.stressLevel = self.estimateStress(self.heartRate, self.hrv);
						self.mood = self.estimateMood(self.heartRate, self.hrv);
						self.updateDisplay();
					}
				}

				self.updateStatus("Analyzing...");
			})
			.catch(function () {
				self.updateStatus("Waiting for camera feed...");
			})
			.finally(function () {
				setTimeout(function () {
					self.processingLoop();
				}, self.config.updateInterval);
			});
	},

	extractPPGSignal: function (imageData) {
		var w = this.config.cameraWidth;
		var h = this.config.cameraHeight;
		var roiX = Math.round(w * 0.3);
		var roiY = Math.round(h * 0.25);
		var roiW = Math.round(w * 0.4);
		var roiH = Math.round(h * 0.5);

		var g = 0;
		var count = 0;
		var data = imageData.data;

		for (var y = roiY; y < roiY + roiH; y++) {
			for (var x = roiX; x < roiX + roiW; x++) {
				g += data[(y * w + x) * 4 + 1];
				count++;
			}
		}

		return count === 0 ? 0 : g / count;
	},

	processHeartRate: function (signal) {
		var n = signal.length;
		if (n < 10) return null;

		var mean = 0;
		for (var i = 0; i < n; i++) mean += signal[i];
		mean /= n;

		var detrended = [];
		for (var i = 0; i < n; i++) detrended.push(signal[i] - mean);

		var filtered = [];
		for (var i = 0; i < n; i++) {
			var sum = 0, cnt = 0;
			var start = Math.max(0, i - 5);
			var end = Math.min(n - 1, i + 5);
			for (var j = start; j <= end; j++) { sum += detrended[j]; cnt++; }
			filtered.push(sum / cnt);
		}

		var maxVal = 0;
		for (var i = 0; i < n; i++) {
			if (Math.abs(filtered[i]) > maxVal) maxVal = Math.abs(filtered[i]);
		}
		var threshold = maxVal * 0.4;
		var dt = this.config.updateInterval / 1000;

		var peaks = [];
		for (var i = 2; i < n - 2; i++) {
			if (filtered[i] > threshold &&
				filtered[i] > filtered[i - 1] && filtered[i] > filtered[i - 2] &&
				filtered[i] > filtered[i + 1] && filtered[i] > filtered[i + 2]) {
				if (peaks.length > 0) {
					var gap = (i - peaks[peaks.length - 1]) * dt;
					if (gap < 0.3) continue;
				}
				peaks.push(i);
			}
		}

		if (peaks.length < 3) return null;

		var ibis = [];
		for (var i = 1; i < peaks.length; i++) {
			var ibi = (peaks[i] - peaks[i - 1]) * dt;
			if (ibi > 0.3 && ibi < 2.0) ibis.push(ibi);
		}
		if (ibis.length < 2) return null;

		var avgIBI = 0;
		for (var i = 0; i < ibis.length; i++) avgIBI += ibis[i];
		avgIBI /= ibis.length;
		var hr = 60 / avgIBI;

		var meanIBI = 0;
		for (var i = 0; i < ibis.length; i++) meanIBI += ibis[i];
		meanIBI /= ibis.length;

		var variance = 0;
		for (var i = 0; i < ibis.length; i++) variance += Math.pow(ibis[i] - meanIBI, 2);
		variance /= ibis.length;

		return { hr: hr, hrv: Math.sqrt(variance) * 1000 };
	},

	estimateStress: function (hr, hrv) {
		if (hrv < 30 && hr > 80) return "High";
		if (hrv < 50 || hr > 90) return "Moderate";
		if (hrv > 70 && hr < 75) return "Low";
		return "Moderate";
	},

	estimateMood: function (hr, hrv) {
		if (hrv > 70 && hr < 70) return "Calm";
		if (hrv > 70 && hr >= 70) return "Happy";
		if (hrv <= 70 && hrv > 40 && hr < 75) return "Focused";
		if (hrv <= 70 && hrv > 40 && hr >= 75) return "Anxious";
		if (hrv <= 40 && hr > 85) return "Stressed";
		if (hrv <= 40 && hr <= 85) return "Tired";
		return "Neutral";
	},

	updateDisplay: function () {
		var el = function (id) { return document.getElementById(id); };

		var hrEl = el("hd-hr");
		var stressEl = el("hd-stress");
		var moodEl = el("hd-mood");
		var hrvEl = el("hd-hrv");

		if (hrEl) hrEl.textContent = this.heartRate != null ? this.heartRate : "--";
		if (hrvEl) hrvEl.textContent = this.hrv != null ? this.hrv : "--";

		if (stressEl) {
			var level = this.stressLevel || "--";
			stressEl.textContent = level;
			stressEl.className = "hd-card-value";
			if (level === "Low") stressEl.classList.add("stress-low");
			else if (level === "Moderate") stressEl.classList.add("stress-moderate");
			else if (level === "High") stressEl.classList.add("stress-high");
		}

		if (moodEl) moodEl.textContent = this.mood || "--";
	},

	updateStatus: function (msg) {
		var el = document.getElementById("hd-status");
		if (el) el.textContent = msg;
	},

	suspend: function () {
		this.isProcessing = false;
	},

	resume: function () {
		if (!this.isProcessing) {
			this.startCamera();
		}
	}
});
