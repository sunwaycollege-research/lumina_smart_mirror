/* ============================================================
   MODULE : LuminaAR
   FILE   : MagicMirror/modules/LuminaAR/LuminaAR.js
   PURPOSE: AR overlays on the live camera feed:
            • Facial landmark annotation (eyes, jawline)
            • Heart rate glow pulse around face
            • Stress halo (colour-coded)
            • Name badge floating above head
            • Gesture recognition visual trail
   node_helper spawns ar_worker.py which:
     - Gets face bounding box from FaceID
     - Returns normalised face position (x,y,w,h as % of frame)
   JS draws overlays on a canvas aligned over the camera preview
   ============================================================ */

Module.register("LuminaAR", {

  defaults: {
    cameraIndex   : 0,
    showFaceHalo  : true,
    showNameBadge : true,
    showBPMPulse  : true,
    showGestureFX : true,
    canvasOpacity : 0.85,
  },

  canvas    : null,
  ctx       : null,
  animFrame : null,
  faceBox   : null,
  user      : null,
  metrics   : {},
  gesture   : null,

  /* ── lifecycle ───────────────────────────────────────────── */

  start () {
    Log.info("LuminaAR: starting");
    this.sendSocketNotification("AR_INIT", this.config);
  },

  getStyles () { return ["LuminaAR.css"]; },

  getDom () {
    const wrap    = document.createElement("div");
    wrap.id       = "lumina-ar-wrap";

    // Video element shows raw camera
    const vid     = document.createElement("video");
    vid.id        = "ar-video";
    vid.autoplay  = true;
    vid.muted     = true;
    vid.playsInline = true;

    // Canvas overlaid exactly on top
    const cnv     = document.createElement("canvas");
    cnv.id        = "ar-canvas";

    wrap.appendChild(vid);
    wrap.appendChild(cnv);
    return wrap;
  },

  /* ── after DOM ready ─────────────────────────────────────── */

  notificationReceived (note, payload) {
    switch (note) {
      case "DOM_OBJECTS_CREATED":
        this.initCanvas();
        this.sendSocketNotification("AR_START", {});
        break;
      case "LUMINA_USER_IDENTIFIED":
        this.user = payload;
        break;
      case "HEALTH_CONTEXT_UPDATE":
        this.metrics = payload;
        break;
      case "GESTURE_DETECTED":
      case "GESTURE_SWIPE_LEFT":
      case "GESTURE_SWIPE_RIGHT":
        this.gesture = { type: note, ts: Date.now() };
        break;
      case "LUMINA_SLEEP":
        this.stopDraw();
        break;
      case "LUMINA_WAKE":
        this.startDraw();
        break;
    }
  },

  /* ── socket ──────────────────────────────────────────────── */

  socketNotificationReceived (note, payload) {
    if (note === "AR_FACE_BOX") this.faceBox = payload;
  },

  /* ── Canvas setup ────────────────────────────────────────── */

  initCanvas () {
    const vid = document.getElementById("ar-video");
    const cnv = document.getElementById("ar-canvas");
    if (!vid || !cnv) return;

    // Get camera stream
    navigator.mediaDevices.getUserMedia({
      video: { deviceId: this.config.cameraIndex, width:640, height:480 },
      audio: false,
    }).then(stream => {
      vid.srcObject = stream;
      vid.play();
    }).catch(e => Log.warn("LuminaAR: camera error", e));

    this.canvas = cnv;
    this.ctx    = cnv.getContext("2d");
    cnv.width   = 640;
    cnv.height  = 480;

    this.startDraw();
  },

  startDraw () {
    if (this.animFrame) return;
    const loop = () => {
      this.draw();
      this.animFrame = requestAnimationFrame(loop);
    };
    this.animFrame = requestAnimationFrame(loop);
  },

  stopDraw () {
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
    if (this.ctx) this.ctx.clearRect(0, 0, 640, 480);
  },

  /* ── Main draw loop ──────────────────────────────────────── */

  draw () {
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.clearRect(0, 0, 640, 480);

    if (!this.faceBox) return;

    const { x, y, w, h } = this.faceBox;
    const cx = x + w / 2;
    const cy = y + h / 2;

    // ── Face halo (stress-coloured) ─────────────────────────
    if (this.config.showFaceHalo && this.metrics) {
      const stress = this.metrics.stress || 0;
      const color  = stress > 74 ? "#EF5350"
                   : stress > 49 ? "#FFAB40"
                   :               "#4FC3F7";
      ctx.save();
      const grd = ctx.createRadialGradient(cx, cy, w*0.4, cx, cy, w*0.9);
      grd.addColorStop(0, color + "00");
      grd.addColorStop(0.6, color + "22");
      grd.addColorStop(1, color + "55");
      ctx.strokeStyle = color + "66";
      ctx.lineWidth   = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur  = 20;
      ctx.beginPath();
      ctx.ellipse(cx, cy, w*0.55, h*0.65, 0, 0, Math.PI*2);
      ctx.stroke();
      ctx.restore();
    }

    // ── BPM pulse ring ──────────────────────────────────────
    if (this.config.showBPMPulse && this.metrics.bpm) {
      const bpm    = this.metrics.bpm;
      const period = 60 / bpm;   // seconds per beat
      const phase  = (Date.now() / 1000 % period) / period;
      const scale  = 1 + Math.sin(phase * Math.PI * 2) * 0.08;

      ctx.save();
      ctx.strokeStyle = "rgba(239,83,80,0.4)";
      ctx.lineWidth   = 1.5;
      ctx.shadowColor = "#EF5350";
      ctx.shadowBlur  = 12 * scale;
      ctx.beginPath();
      ctx.ellipse(cx, cy, w*0.52*scale, h*0.62*scale, 0, 0, Math.PI*2);
      ctx.stroke();
      ctx.restore();
    }

    // ── Name badge above head ───────────────────────────────
    if (this.config.showNameBadge && this.user) {
      const label = this.user.displayName || "";
      ctx.save();
      ctx.font         = "400 14px 'Helvetica Neue', sans-serif";
      ctx.textAlign    = "center";
      const tw         = ctx.measureText(label).width;
      const bx = cx - tw/2 - 10;
      const by = y - 36;
      ctx.fillStyle    = "rgba(10,14,20,0.75)";
      ctx.beginPath();
      ctx.roundRect(bx, by, tw+20, 24, 6);
      ctx.fill();
      ctx.fillStyle    = "rgba(255,255,255,0.88)";
      ctx.fillText(label, cx, by + 16);
      ctx.restore();
    }

    // ── Gesture FX ─────────────────────────────────────────
    if (this.config.showGestureFX && this.gesture) {
      const age = Date.now() - this.gesture.ts;
      if (age < 800) {
        const alpha = 1 - age / 800;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = "#4FC3F7";
        ctx.lineWidth   = 2;
        ctx.shadowColor = "#4FC3F7";
        ctx.shadowBlur  = 20 * alpha;
        const r = 80 + age * 0.15;
        ctx.beginPath();
        ctx.arc(320, 240, r, 0, Math.PI*2);
        ctx.stroke();
        ctx.restore();
      } else {
        this.gesture = null;
      }
    }
  },
});
