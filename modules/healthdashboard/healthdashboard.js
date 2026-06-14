Module.register("healthdashboard", {
	defaults: {
		updateInterval: 100,
		cameraWidth: 320,
		cameraHeight: 240,
		maxSignalLength: 50
	},

	heartRate: null,
	stressLevel: null,
	mood: null,
	hrv: null,
	ppgSignal: [],
	filteredSignal: [],
	peaks: [],
	isProcessing: false,
	cameraActive: false,
	cameraStream: null,
	restartTimeout: null,

	getStyles: function () {
		return ["/css/healthdashboard.css", "/css/font-awesome.css"];
	},

	start: function () {
		Log.info("Starting module: " + this.name);
		this.startCamera();
	},

	getDom: function () {
		var wrapper = document.createElement("div");
		wrapper.id = "health-dashboard";
		wrapper.className = "health-dashboard";

		wrapper.innerHTML =
			'<div class="hd-header">' +
				'<span class="hd-live"><span class="hd-live-dot"></span>LIVE</span>' +
				'<span class="hd-title">Health Monitor</span>' +
			"</div>" +
			'<div class="hd-waveform">' +
				'<canvas id="hd-ppg-canvas" width="220" height="50"></canvas>' +
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
			var constraints = {
				video: {
					width: this.config.cameraWidth,
					height: this.config.cameraHeight,
					frameRate: { ideal: 30 },
					facingMode: "user"
				}
			};
			this.cameraStream = await navigator.mediaDevices.getUserMedia(constraints);

			this.videoElement = document.createElement("video");
			this.videoElement.srcObject = this.cameraStream;
			this.videoElement.width = this.config.cameraWidth;
			this.videoElement.height = this.config.cameraHeight;
			this.videoElement.setAttribute("playsinline", "");
			this.videoElement.muted = true;
			await this.videoElement.play();

			this.canvasElement = document.createElement("canvas");
			this.canvasElement.width = this.config.cameraWidth;
			this.canvasElement.height = this.config.cameraHeight;
			this.ctx = this.canvasElement.getContext("2d");

			this.cameraActive = true;
			this.updateStatus("Analyzing...");
			this.isProcessing = true;
			this.ppgSignal = [];
			this.filteredSignal = [];
			this.peaks = [];
			this.processingLoop();
		} catch (err) {
			Log.error("Camera error:", err);
			this.updateStatus("Camera unavailable - " + err.message);
			if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
				this.updateStatus("Camera permission denied");
			}
		}
	},

	stopCamera: function () {
		this.isProcessing = false;
		this.cameraActive = false;
		if (this.restartTimeout) {
			clearTimeout(this.restartTimeout);
			this.restartTimeout = null;
		}
		if (this.cameraStream) {
			this.cameraStream.getTracks().forEach(function (t) { t.stop(); });
			this.cameraStream = null;
		}
	},

	processingLoop: function () {
		var self = this;
		if (!this.isProcessing) return;

		try {
			this.ctx.drawImage(this.videoElement, 0, 0);
			var frameData = this.ctx.getImageData(0, 0, this.config.cameraWidth, this.config.cameraHeight);

			var signal = this.extractPPGSignal(frameData);
			this.ppgSignal.push(signal);

			if (this.ppgSignal.length > this.config.maxSignalLength) {
				this.ppgSignal.shift();
			}

			if (this.ppgSignal.length >= this.config.maxSignalLength) {
				var result = this.processHeartRate(this.ppgSignal);
				this.drawWaveform();
				if (result && result.hr > 40 && result.hr < 220) {
					this.heartRate = Math.round(result.hr);
					this.hrv = Math.round(result.hrv);
					this.stressLevel = this.estimateStress(this.heartRate, this.hrv);
					this.mood = this.estimateMood(this.heartRate, this.hrv);
					this.updateDisplay();
				}
			} else {
				this.drawWaveform();
			}
		} catch (e) {
			Log.error("Processing error:", e);
		}

		this.restartTimeout = setTimeout(function () {
			self.processingLoop();
		}, this.config.updateInterval);
	},

	drawWaveform: function () {
		var canvas = document.getElementById("hd-ppg-canvas");
		if (!canvas) return;
		var ctx = canvas.getContext("2d");
		var w = canvas.width, h = canvas.height;
		var data = this.filteredSignal.length > 10 ? this.filteredSignal : this.ppgSignal;
		var len = data.length;
		if (len < 2) {
			ctx.clearRect(0, 0, w, h);
			return;
		}

		var min = Infinity, max = -Infinity;
		for (var i = 0; i < len; i++) {
			if (data[i] < min) min = data[i];
			if (data[i] > max) max = data[i];
		}
		var range = max - min || 1;

		ctx.clearRect(0, 0, w, h);

		ctx.beginPath();
		ctx.strokeStyle = "#51cf66";
		ctx.lineWidth = 1.5;

		for (var i = 0; i < len; i++) {
			var x = (i / len) * w;
			var y = ((data[i] - min) / range) * (h - 4) + 2;
			if (i === 0) ctx.moveTo(x, h - y);
			else ctx.lineTo(x, h - y);
		}
		ctx.stroke();

		if (this.peaks.length > 0) {
			ctx.fillStyle = "rgba(255, 107, 107, 0.6)";
			for (var i = 0; i < this.peaks.length; i++) {
				var peakIdx = this.peaks[i];
				if (peakIdx >= 0 && peakIdx < len) {
					var px = (peakIdx / len) * w;
					var py = ((data[peakIdx] - min) / range) * (h - 4) + 2;
					ctx.beginPath();
					ctx.arc(px, h - py, 3, 0, Math.PI * 2);
					ctx.fill();
				}
			}
		}
	},

	extractPPGSignal: function (imageData) {
		var w = this.config.cameraWidth;
		var h = this.config.cameraHeight;
		var roiX = Math.round(w * 0.3);
		var roiY = Math.round(h * 0.25);
		var roiW = Math.round(w * 0.4);
		var roiH = Math.round(h * 0.5);

		var g = 0, count = 0;
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
		this.filteredSignal = filtered;

		var maxVal = 0;
		for (var i = 0; i < n; i++) {
			if (Math.abs(filtered[i]) > maxVal) maxVal = Math.abs(filtered[i]);
		}
		var threshold = maxVal * 0.3;
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
		this.peaks = peaks;

		if (peaks.length < 2) return null;

		var ibis = [];
		for (var i = 1; i < peaks.length; i++) {
			var ibi = (peaks[i] - peaks[i - 1]) * dt;
			if (ibi > 0.3 && ibi < 2.0) ibis.push(ibi);
		}
		if (ibis.length < 1) return null;

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
		this.stopCamera();
	},

	resume: function () {
		if (!this.cameraActive) {
			this.startCamera();
		}
	}
});
