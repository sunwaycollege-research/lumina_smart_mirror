/* ============================================================
   MODULE : LuminaAI
   FILE   : MagicMirror/modules/LuminaAI/LuminaAI.js
   PURPOSE: AI assistant widget — voice/gesture activated,
            powered by Claude API via node_helper.js
   TRIGGERS: VOICE_CMD_ASSISTANT  |  GESTURE_THUMBS_UP
   ============================================================ */

Module.register("LuminaAI", {

  defaults: {
    apiKeyEnv:       "ANTHROPIC_API_KEY",   // read in node_helper
    model:           "claude-opus-4-6",
    maxHistory:      10,
    idleTimeoutSec:  20,
    systemPrompt: `You are Lumina, a premium executive AI assistant embedded in a
smart mirror. Respond concisely (2–3 sentences max). The user is a business
executive. Focus on: schedule briefings, meeting summaries, productivity tips,
weather, and business insights. Current time: {TIME}. User: {USER_NAME}.`,
  },

  active      : false,
  thinking    : false,
  messages    : [],    // conversation history
  lastResponse: "",
  idleTimer   : null,
  currentUser : null,

  /* ── lifecycle ───────────────────────────────────────────── */

  start () {
    Log.info("LuminaAI: starting");
    this.sendSocketNotification("AI_INIT", this.config);
  },

  getStyles  () { return ["LuminaAI.css"]; },

  /* ── DOM ─────────────────────────────────────────────────── */

  getDom () {
    const wrap     = document.createElement("div");
    wrap.className = "lumina-ai" + (this.active ? " active" : "");

    if (!this.active) {
      wrap.innerHTML = `<div class="ai-idle-hint">✦ Say "Hey Lumina" or 👍</div>`;
      return wrap;
    }

    if (this.thinking) {
      wrap.innerHTML = `
        <div class="ai-panel">
          <div class="ai-thinking">
            <span></span><span></span><span></span>
          </div>
        </div>`;
      return wrap;
    }

    wrap.innerHTML = `
      <div class="ai-panel">
        <div class="ai-label">LUMINA AI</div>
        <p class="ai-response">${this.lastResponse}</p>
      </div>`;
    return wrap;
  },

  /* ── socket ──────────────────────────────────────────────── */

  socketNotificationReceived (note, payload) {
    switch (note) {
      case "AI_RESPONSE":
        this.thinking     = false;
        this.lastResponse = payload.text;
        this.messages     = payload.history;
        this.resetIdle();
        this.updateDom(300);
        break;
      case "AI_ERROR":
        this.thinking     = false;
        this.lastResponse = "I'm having trouble reaching the server.";
        this.updateDom(300);
        break;
    }
  },

  /* ── MM notifications ────────────────────────────────────── */

  notificationReceived (note, payload) {
    switch (note) {
      case "LUMINA_USER_IDENTIFIED":
        this.currentUser = payload;
        break;

      /* voice module sends transcript */
      case "VOICE_TRANSCRIPT":
        this.query(payload.text);
        break;

      /* gesture thumbs-up activates assistant */
      case "GESTURE_THUMBS_UP":
        if (!this.active) this.activate();
        break;

      case "LUMINA_SLEEP":
        this.deactivate();
        break;

      /* schedule data fed into context */
      case "MOBILE_PUSH_SCHEDULE":
        this.scheduleContext = payload.events;
        break;

      case "HEALTH_CONTEXT_UPDATE":
        this.healthContext = payload;
        break;
    }
  },

  /* ── query helpers ───────────────────────────────────────── */

  query (text) {
    if (!text || !text.trim()) return;
    this.activate();
    this.thinking = true;
    this.updateDom(200);

    this.sendSocketNotification("AI_QUERY", {
      text,
      history    : this.messages,
      user       : this.currentUser,
      schedule   : this.scheduleContext   || [],
      health     : this.healthContext     || {},
    });
  },

  activate () {
    this.active = true;
    this.resetIdle();
    this.updateDom(300);
  },

  deactivate () {
    this.active       = false;
    this.thinking     = false;
    this.lastResponse = "";
    this.messages     = [];
    clearTimeout(this.idleTimer);
    this.updateDom(400);
  },

  resetIdle () {
    clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(
      () => this.deactivate(),
      this.config.idleTimeoutSec * 1000
    );
  },
});
