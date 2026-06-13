/* ============================================================
   MODULE : LuminaVoice
   FILE   : MagicMirror/modules/LuminaVoice/LuminaVoice.js
   PURPOSE: "Hey Lumina" wake-word → speech → text → dispatch
            node_helper spawns voice_worker.py (Vosk/Whisper).
            Parsed intents → MM notifications.

   INTENT MAP:
     "schedule / meetings / calendar" → AI_QUERY (schedule brief)
     "lights on / off"                → VOICE_CMD_LIGHTS_ON/OFF
     "sleep / go to sleep"            → VOICE_CMD_SLEEP
     "assistant / help"               → GESTURE_THUMBS_UP (opens AI)
     fallback                         → VOICE_TRANSCRIPT (raw text to AI)
   ============================================================ */

Module.register("LuminaVoice", {

  defaults: {
    wakeWord       : "hey lumina",
    language       : "en-us",
    sampleRate     : 16000,
    vadSilenceMs   : 1800,   // pause before processing
    showTranscript : true,
    transcriptMs   : 3000,
  },

  listening  : false,
  transcript : "",
  fadeTimer  : null,

  /* ── lifecycle ───────────────────────────────────────────── */

  start () {
    Log.info("LuminaVoice: starting");
    this.sendSocketNotification("VOICE_INIT", this.config);
  },

  getStyles () { return ["LuminaVoice.css"]; },

  getDom () {
    const wrap = document.createElement("div");
    wrap.id    = "lumina-voice";
    if (!this.listening && !this.transcript) return wrap;

    if (this.listening) {
      wrap.innerHTML = `
        <div class="voice-indicator">
          <div class="mic-dot"></div>
          <span class="voice-label">Listening…</span>
        </div>`;
    } else if (this.transcript) {
      wrap.innerHTML = `
        <div class="voice-transcript">
          <span class="voice-icon">❝</span>
          <span class="voice-text">${this.transcript}</span>
        </div>`;
    }
    return wrap;
  },

  /* ── socket ──────────────────────────────────────────────── */

  socketNotificationReceived (note, payload) {
    switch (note) {
      case "VOICE_WAKE":
        this.listening  = true;
        this.transcript = "";
        this.updateDom(200);
        break;

      case "VOICE_PARTIAL":
        if (this.config.showTranscript) {
          this.transcript = payload.text;
          this.updateDom(100);
        }
        break;

      case "VOICE_FINAL":
        this.listening  = false;
        this.transcript = payload.text;
        this.updateDom(200);
        this.dispatchIntent(payload.text);
        this.fadeTimer = setTimeout(() => {
          this.transcript = "";
          this.updateDom(300);
        }, this.config.transcriptMs);
        break;

      case "VOICE_ERROR":
        this.listening = false;
        this.updateDom(300);
        break;
    }
  },

  /* ── intent dispatch ─────────────────────────────────────── */

  dispatchIntent (text) {
    const t = text.toLowerCase();

    if (/\b(schedule|meeting|calendar|appointments?)\b/.test(t)) {
      this.sendNotification("VOICE_TRANSCRIPT", { text: `Give me my schedule briefing: ${text}` });
      return;
    }
    if (/\b(lights?\s+on|turn\s+on\s+lights?)\b/.test(t)) {
      this.sendNotification("VOICE_CMD_LIGHTS_ON", {});
      return;
    }
    if (/\b(lights?\s+off|turn\s+off\s+lights?)\b/.test(t)) {
      this.sendNotification("VOICE_CMD_LIGHTS_OFF", {});
      return;
    }
    if (/\b(sleep|go\s+to\s+sleep|turn\s+off\s+mirror)\b/.test(t)) {
      this.sendNotification("VOICE_CMD_SLEEP", {});
      return;
    }
    if (/\b(health|heart\s+rate|stress|how\s+am\s+i\s+doing)\b/.test(t)) {
      this.sendNotification("VOICE_TRANSCRIPT", { text: `Give me my health summary: ${text}` });
      return;
    }
    if (/\b(weather|temperature\s+outside)\b/.test(t)) {
      this.sendNotification("VOICE_TRANSCRIPT", { text });
      return;
    }
    // Default: send raw transcript to AI
    this.sendNotification("VOICE_TRANSCRIPT", { text });
  },
});
