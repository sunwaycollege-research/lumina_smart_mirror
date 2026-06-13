/* ============================================================
   MODULE : LuminaUI
   FILE   : MagicMirror/modules/LuminaUI/LuminaUI.js
   PURPOSE: Injects global premium dark theme, ambient particles,
            alert overlay, layout transitions. No visible widget —
            pure presentation layer. Must be FIRST in config.js.
   ============================================================ */

Module.register("LuminaUI", {

  defaults: {
    theme:          "obsidian",    // "obsidian" | "navy" | "charcoal"
    accentColor:    "#4FC3F7",
    particleCount:  40,
    showClock:      true,
    alertDurationMs: 5000,
  },

  alertQueue : [],
  alertTimer : null,

  /* ── lifecycle ───────────────────────────────────────────── */

  start () {
    Log.info("LuminaUI: starting");
    document.documentElement.setAttribute("data-lumina-theme", this.config.theme);
    document.documentElement.style.setProperty("--lumina-accent", this.config.accentColor);
  },

  getStyles () { return ["LuminaUI.css"]; },

  getDom () {
    const wrap = document.createElement("div");
    wrap.id    = "lumina-ui-layer";

    // Particle canvas
    wrap.innerHTML = `<canvas id="lumina-particles"></canvas>
                      <div id="lumina-alert-overlay"></div>`;
    return wrap;
  },

  /* ── after DOM ready — boot particles ────────────────────── */

  notificationReceived (note, payload) {
    switch (note) {
      case "DOM_OBJECTS_CREATED":
        this.initParticles();
        break;

      case "LUMINA_ALERT":
        this.queueAlert(payload);
        break;

      case "LUMINA_SLEEP":
        document.body.classList.add("lumina-asleep");
        break;

      case "LUMINA_WAKE":
        document.body.classList.remove("lumina-asleep");
        break;

      case "LUMINA_USER_IDENTIFIED":
        document.body.setAttribute("data-user", payload.id);
        break;
    }
  },

  /* ── alert overlay ───────────────────────────────────────── */

  queueAlert (alert) {
    this.alertQueue.push(alert);
    if (!this.alertTimer) this.showNextAlert();
  },

  showNextAlert () {
    if (!this.alertQueue.length) { this.alertTimer = null; return; }
    const a   = this.alertQueue.shift();
    const el  = document.getElementById("lumina-alert-overlay");
    if (!el) return;

    const icons = { meeting_soon:"📅", hr_high:"❤️", hr_low:"💙",
                    stress:"🧘", lights:"💡", default:"✦" };
    const icon  = icons[a.type] || icons.default;
    const msg   = this.alertMessage(a);

    el.innerHTML = `
      <div class="lumina-alert-card">
        <span class="alert-icon">${icon}</span>
        <div class="alert-body">
          <p class="alert-msg">${msg}</p>
        </div>
      </div>`;
    el.classList.add("visible");

    this.alertTimer = setTimeout(() => {
      el.classList.remove("visible");
      setTimeout(() => this.showNextAlert(), 400);
    }, this.config.alertDurationMs);
  },

  alertMessage (a) {
    switch (a.type) {
      case "meeting_soon": return `${a.title} starts in ${a.minsOut} min`;
      case "hr_high":      return `Heart rate elevated: ${a.value} BPM`;
      case "hr_low":       return `Low heart rate: ${a.value} BPM`;
      case "stress":       return `High stress detected: ${a.value}%`;
      default:             return a.message || "Notification";
    }
  },

  /* ── ambient particles ───────────────────────────────────── */

  initParticles () {
    const canvas = document.getElementById("lumina-particles");
    if (!canvas) return;
    const ctx  = canvas.getContext("2d");
    const W    = canvas.width  = window.innerWidth;
    const H    = canvas.height = window.innerHeight;
    const N    = this.config.particleCount;
    const accent = this.config.accentColor;

    const particles = Array.from({ length: N }, () => ({
      x  : Math.random() * W,
      y  : Math.random() * H,
      r  : Math.random() * 1.2 + 0.3,
      vx : (Math.random() - 0.5) * 0.15,
      vy : (Math.random() - 0.5) * 0.15,
      a  : Math.random() * 0.25 + 0.05,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = accent + Math.round(p.a * 255).toString(16).padStart(2,"0");
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }
      requestAnimationFrame(draw);
    };
    draw();
  },
});
