/* ============================================================
   MODULE : LuminaHealth
   FILE   : MagicMirror/modules/LuminaHealth/LuminaHealth.js
   PURPOSE: Real-time biometric dashboard — BPM, HRV, stress,
            mood via rPPG from facial video.
            node_helper.js spawns rppg_worker.py (Python/OpenCV)
   ============================================================ */

Module.register("LuminaHealth", {

  defaults: {
    rppgWindowSec: 15,
    showBPM:       true,
    showHRV:       true,
    showStress:    true,
    showMood:      true,
    showBreathing: true,
    alertBPMHigh:  110,
    alertBPMLow:   50,
    alertStress:   75,
    mobileSync:    true,
  },

  metrics: { bpm: null, hrv: null, stress: null, mood: null, confidence: 0 },
  breathe : false,

  /* ── lifecycle ───────────────────────────────────────────── */

  start () {
    Log.info("LuminaHealth: starting");
    this.sendSocketNotification("HEALTH_INIT", this.config);
    setInterval(() => this.sendSocketNotification("HEALTH_TICK", {}),
                this.config.rppgWindowSec * 1000);
  },

  getStyles () { return ["LuminaHealth.css"]; },

  /* ── DOM ─────────────────────────────────────────────────── */

  getDom () {
    const wrap     = document.createElement("div");
    wrap.className = "lumina-health";

    if (!this.metrics.bpm) {
      wrap.innerHTML = `<div class="health-init"><div class="pulse-anim"></div><span>Measuring…</span></div>`;
      return wrap;
    }

    const { bpm, hrv, stress, mood, confidence } = this.metrics;
    const bpmClass    = bpm > this.config.alertBPMHigh || bpm < this.config.alertBPMLow
                        ? "danger" : bpm > 95 ? "elevated" : "ok";
    const stressCls   = stress > 74 ? "critical" : stress > 49 ? "high" : stress > 24 ? "moderate" : "low";
    const moodIcons   = { calm:"🟢", focused:"🔵", stressed:"🟡", fatigued:"🟠", unknown:"⚪" };

    wrap.innerHTML = `
      <div class="health-header">
        <span class="health-title">Health</span>
        <span class="health-conf">${confidence}% confidence</span>
      </div>

      ${this.config.showBPM ? `
      <div class="metric-row">
        <div class="metric-card ${bpmClass}">
          <div class="metric-icon">♥</div>
          <div class="metric-val">${bpm}</div>
          <div class="metric-unit">BPM</div>
        </div>
        ${this.config.showHRV ? `
        <div class="metric-card neutral">
          <div class="metric-icon">〰</div>
          <div class="metric-val">${hrv ?? "—"}</div>
          <div class="metric-unit">HRV ms</div>
        </div>` : ""}
      </div>` : ""}

      ${this.config.showStress ? `
      <div class="stress-section">
        <div class="stress-row">
          <span class="stress-lbl">Stress</span>
          <span class="stress-tag ${stressCls}">${stressCls.charAt(0).toUpperCase()+stressCls.slice(1)}</span>
          <span class="stress-pct">${stress}%</span>
        </div>
        <div class="stress-track"><div class="stress-fill ${stressCls}" style="width:${stress}%"></div></div>
      </div>` : ""}

      ${this.config.showMood ? `
      <div class="mood-badge">
        <span>${moodIcons[mood] || "⚪"}</span>
        <span class="mood-txt">${(mood || "unknown").charAt(0).toUpperCase()+(mood||"unknown").slice(1)}</span>
      </div>` : ""}

      ${this.breathe && this.config.showBreathing ? `
      <div class="breathing-guide">
        <div class="breath-ring"></div>
        <p class="breath-txt">Breathe in 4s · Hold 4s · Out 6s</p>
      </div>` : ""}
    `;

    return wrap;
  },

  /* ── socket ──────────────────────────────────────────────── */

  socketNotificationReceived (note, payload) {
    if (note !== "HEALTH_UPDATE") return;
    this.metrics = { ...this.metrics, ...payload };
    this.breathe = this.metrics.stress >= this.config.alertStress;
    this.updateDom(500);
    if (this.config.mobileSync)
      this.sendNotification("MOBILE_PUSH_HEALTH", this.metrics);
    this.sendNotification("HEALTH_CONTEXT_UPDATE", this.metrics);
    this.checkAlerts();
  },

  checkAlerts () {
    const { bpm, stress } = this.metrics;
    if (bpm > this.config.alertBPMHigh)
      this.sendNotification("LUMINA_ALERT", { type:"hr_high", value:bpm });
    if (bpm < this.config.alertBPMLow)
      this.sendNotification("LUMINA_ALERT", { type:"hr_low",  value:bpm });
    if (stress > this.config.alertStress)
      this.sendNotification("LUMINA_ALERT", { type:"stress",  value:stress });
  },
});
