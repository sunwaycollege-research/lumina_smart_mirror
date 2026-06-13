/* ============================================================
   MODULE : LuminaGesture
   FILE   : MagicMirror/modules/LuminaGesture/LuminaGesture.js
   PURPOSE: Zero-touch gesture navigation via MediaPipe Hands.
            node_helper spawns gesture_worker.py which classifies
            6 gestures and emits them as MM notifications.
   GESTURES:
     open_palm   → LUMINA_SLEEP / dismiss
     pinch       → DETAIL_VIEW toggle
     two_fingers → SCROLL_DOWN
     thumbs_up   → CONFIRM / activate AI
     swipe_left  → next widget
     swipe_right → prev widget
   ============================================================ */

Module.register("LuminaGesture", {

  defaults: {
    cameraIndex  : 0,
    sensitivityMs: 500,
    showFeedback : true,
    feedbackMs   : 1400,
    minConfidence: 75,
    gestures: {
      open_palm  : "LUMINA_SLEEP",
      pinch      : "GESTURE_PINCH",
      two_fingers: "GESTURE_TWO_FINGERS",
      thumbs_up  : "GESTURE_THUMBS_UP",
      swipe_left : "GESTURE_SWIPE_LEFT",
      swipe_right: "GESTURE_SWIPE_RIGHT",
    },
  },

  lastGestureMs: 0,
  feedbackTimer: null,
  lastGesture  : "",

  /* ── lifecycle ───────────────────────────────────────────── */

  start () {
    Log.info("LuminaGesture: starting");
    this.sendSocketNotification("GESTURE_INIT", this.config);
  },

  getStyles () { return ["LuminaGesture.css"]; },

  getDom () {
    const wrap = document.createElement("div");
    wrap.id    = "lumina-gesture-layer";
    wrap.innerHTML = `<div id="gesture-feedback" class="gesture-feedback"></div>`;
    return wrap;
  },

  /* ── socket ──────────────────────────────────────────────── */

  socketNotificationReceived (note, payload) {
    if (note !== "GESTURE_DETECTED") return;
    const now = Date.now();
    if (now - this.lastGestureMs < this.config.sensitivityMs) return;
    if (payload.confidence < this.config.minConfidence) return;

    this.lastGestureMs = now;
    const { gesture, confidence } = payload;
    const mmNote = this.config.gestures[gesture];
    if (!mmNote) return;

    Log.info(`LuminaGesture: ${gesture} (${confidence}%) → ${mmNote}`);
    this.sendNotification(mmNote, { gesture, confidence, source: "gesture" });
    if (this.config.showFeedback) this.showFeedback(gesture);
  },

  notificationReceived (note) {
    if (note === "DOM_OBJECTS_CREATED") this.sendSocketNotification("GESTURE_START", {});
  },

  /* ── feedback overlay ────────────────────────────────────── */

  showFeedback (gesture) {
    const el = document.getElementById("gesture-feedback");
    if (!el) return;
    const labels = {
      open_palm  : "✋  Sleep",
      pinch      : "🤏  Expand",
      two_fingers: "✌  Scroll",
      thumbs_up  : "👍  Confirm",
      swipe_left : "←  Next",
      swipe_right: "→  Previous",
    };
    el.textContent = labels[gesture] || gesture;
    el.classList.add("show");
    clearTimeout(this.feedbackTimer);
    this.feedbackTimer = setTimeout(() => el.classList.remove("show"), this.config.feedbackMs);
  },
});
