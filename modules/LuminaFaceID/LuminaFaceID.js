/* ============================================================
   MODULE : LuminaFaceID
   FILE   : MagicMirror/modules/LuminaFaceID/LuminaFaceID.js
   PURPOSE: Facial recognition + personalised executive greeting
   DEPS   : node_helper.js  ←→  face_worker.py (Python/OpenCV)
   ============================================================ */

Module.register("LuminaFaceID", {

  defaults: {
    modelsPath:     "modules/LuminaFaceID/models",
    usersDbPath:    "modules/LuminaFaceID/data/users.json",
    greetingStyle:  "executive",   // "executive" | "casual"
    sleepAfterSec:  60,
    matchThreshold: 0.45,
    showTitle:      true,
    showBriefing:   true,
  },

  currentUser : null,
  isAsleep    : false,
  sleepTimer  : null,

  /* ── lifecycle ───────────────────────────────────────────── */

  start () {
    Log.info("LuminaFaceID: starting");
    this.sendSocketNotification("FACEID_INIT", this.config);
  },

  getStyles  () { return ["LuminaFaceID.css"]; },
  getScripts () { return []; },

  /* ── DOM ─────────────────────────────────────────────────── */

  getDom () {
    const wrap      = document.createElement("div");
    wrap.className  = "lumina-faceid" + (this.isAsleep ? " asleep" : "");

    if (this.isAsleep) return wrap;

    if (!this.currentUser) {
      wrap.innerHTML = `
        <div class="scan-container">
          <div class="scan-ring"></div>
          <div class="scan-ring delay1"></div>
          <p class="scan-label">Identifying…</p>
        </div>`;
      return wrap;
    }

    const hour  = new Date().getHours();
    const greet = hour < 5  ? "Good Night"
                : hour < 12 ? "Good Morning"
                : hour < 17 ? "Good Afternoon"
                :              "Good Evening";

    wrap.innerHTML = `
      <div class="greeting-block">
        <span class="greeting-time">${greet}</span>
        <h1 class="greeting-name">${this.currentUser.displayName}</h1>
        ${this.config.showTitle && this.currentUser.title
            ? `<p class="greeting-title">${this.currentUser.title}</p>` : ""}
        ${this.config.showBriefing && this.currentUser.dailyBrief
            ? `<p class="greeting-brief">${this.currentUser.dailyBrief}</p>` : ""}
      </div>`;
    return wrap;
  },

  /* ── socket from node_helper ─────────────────────────────── */

  socketNotificationReceived (note, payload) {
    switch (note) {
      case "FACE_RECOGNIZED":
        this.currentUser = payload.user;
        this.isAsleep    = false;
        this.resetSleep();
        this.updateDom(350);
        /* tell ALL modules who logged in */
        this.sendNotification("LUMINA_USER_IDENTIFIED", payload.user);
        break;
      case "FACE_UNKNOWN":
        this.currentUser = null;
        this.updateDom(350);
        break;
      case "FACE_WORKER_ERROR":
        Log.error("LuminaFaceID:", payload.message);
        break;
    }
  },

  /* ── MM notifications from other modules ─────────────────── */

  notificationReceived (note, payload) {
    switch (note) {
      case "DOM_OBJECTS_CREATED": this.sendSocketNotification("FACEID_START", {}); break;
      case "GESTURE_OPEN_PALM":   this.sleep(); break;
      case "VOICE_CMD_SLEEP":     this.sleep(); break;
      case "LUMINA_WAKE":         this.wake();  break;
    }
  },

  /* ── sleep / wake ────────────────────────────────────────── */

  sleep () {
    this.isAsleep = true;
    clearTimeout(this.sleepTimer);
    this.updateDom(600);
    this.sendNotification("LUMINA_SLEEP");
  },

  wake () {
    this.isAsleep    = false;
    this.currentUser = null;
    this.resetSleep();
    this.updateDom(350);
  },

  resetSleep () {
    clearTimeout(this.sleepTimer);
    this.sleepTimer = setTimeout(
      () => this.sleep(),
      this.config.sleepAfterSec * 1000
    );
  },
});
