/* ============================================================
   MODULE : LuminaSmartHome
   FILE   : MagicMirror/modules/LuminaSmartHome/LuminaSmartHome.js
   PURPOSE: Smart home control — lights, thermostat, locks,
            scenes.  REST calls to Home Assistant via node_helper.
   AUTO-TRIGGER: on LUMINA_USER_IDENTIFIED → load user's home scene
   ============================================================ */

Module.register("LuminaSmartHome", {

  defaults: {
    haUrl:        "http://homeassistant.local:8123",
    haToken:      "YOUR_HA_LONG_LIVED_TOKEN",
    pollIntervalSec: 30,
    rooms: [
      { id: "office",  label: "Office",   lightEntity: "light.office",    tempSensor: "sensor.office_temp"  },
      { id: "meeting", label: "Meeting",  lightEntity: "light.board_room", tempSensor: "sensor.meeting_temp" },
      { id: "lobby",   label: "Lobby",    lightEntity: "light.lobby",      tempSensor: null                  },
    ],
    scenes: {
      morning  : "scene.executive_morning",
      focus    : "scene.executive_focus",
      meeting  : "scene.executive_meeting",
      evening  : "scene.executive_evening",
    },
    climateEntity: "climate.office_hvac",
  },

  state: {
    rooms       : {},
    thermostat  : null,
    activeScene : null,
  },

  pollTimer: null,

  /* ── lifecycle ───────────────────────────────────────────── */

  start () {
    Log.info("LuminaSmartHome: starting");
    this.sendSocketNotification("SMARTHOME_INIT", this.config);
    this.poll();
    this.pollTimer = setInterval(
      () => this.poll(),
      this.config.pollIntervalSec * 1000
    );
  },

  getStyles () { return ["LuminaSmartHome.css"]; },

  /* ── DOM ─────────────────────────────────────────────────── */

  getDom () {
    const wrap = document.createElement("div");
    wrap.className = "lumina-smarthome";

    wrap.innerHTML = `
      <div class="sh-header">
        <span class="sh-title">Environment</span>
        ${this.state.thermostat ? `<span class="sh-temp">${this.state.thermostat.current_temperature}°C</span>` : ""}
      </div>

      <div class="sh-scenes">
        ${Object.entries(this.config.scenes).map(([key, entity]) => `
          <button class="scene-btn ${this.state.activeScene===entity?"active":""}"
                  data-entity="${entity}"
                  onclick="this.MM.sendNotification('SMARTHOME_ACTIVATE_SCENE',{entity:'${entity}',key:'${key}'})">
            ${this.sceneIcon(key)} ${key.charAt(0).toUpperCase()+key.slice(1)}
          </button>`).join("")}
      </div>

      <div class="sh-rooms">
        ${this.config.rooms.map(room => this.buildRoomRow(room)).join("")}
      </div>

      ${this.state.thermostat ? this.buildThermostat() : ""}
    `;

    // Wire onclick properly after render
    wrap.querySelectorAll(".scene-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const entity = btn.dataset.entity;
        const key    = btn.dataset.key;
        this.sendSocketNotification("SMARTHOME_SCENE", { entity });
        this.state.activeScene = entity;
        this.updateDom(200);
      });
      btn.removeAttribute("onclick");
    });

    wrap.querySelectorAll(".light-toggle").forEach(btn => {
      btn.addEventListener("click", () => {
        const entity = btn.dataset.entity;
        const on     = btn.dataset.on === "true";
        this.sendSocketNotification("SMARTHOME_TOGGLE_LIGHT", { entity, on: !on });
      });
    });

    wrap.querySelectorAll(".temp-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const delta = parseInt(btn.dataset.delta, 10);
        const cur   = this.state.thermostat?.target_temperature || 22;
        this.sendSocketNotification("SMARTHOME_SET_TEMP", {
          entity: this.config.climateEntity,
          temp:   cur + delta,
        });
      });
    });

    return wrap;
  },

  buildRoomRow (room) {
    const rs  = this.state.rooms[room.id] || {};
    const on  = rs.lightOn ?? false;
    const bri = rs.brightness ?? 0;
    const tmp = rs.temp ? `${rs.temp}°` : "";

    return `
      <div class="sh-room">
        <span class="room-label">${room.label}</span>
        ${tmp ? `<span class="room-temp">${tmp}</span>` : ""}
        <span class="room-bri">${on ? Math.round(bri/2.55)+"%" : "Off"}</span>
        <button class="light-toggle ${on?"on":"off"}"
                data-entity="${room.lightEntity}"
                data-on="${on}">
          ${on ? "●" : "○"}
        </button>
      </div>`;
  },

  buildThermostat () {
    const t = this.state.thermostat;
    return `
      <div class="sh-thermo">
        <button class="temp-btn" data-delta="-1">−</button>
        <div class="thermo-display">
          <span class="thermo-target">${t.target_temperature}°</span>
          <span class="thermo-mode">${t.hvac_mode || ""}</span>
        </div>
        <button class="temp-btn" data-delta="1">+</button>
      </div>`;
  },

  sceneIcon (key) {
    return { morning:"☀️", focus:"🎯", meeting:"📊", evening:"🌙" }[key] || "✦";
  },

  /* ── socket ──────────────────────────────────────────────── */

  socketNotificationReceived (note, payload) {
    if (note === "SMARTHOME_STATE_UPDATE") {
      this.state = { ...this.state, ...payload };
      this.updateDom(400);
    }
  },

  /* ── MM notifications ────────────────────────────────────── */

  notificationReceived (note, payload) {
    if (note === "LUMINA_USER_IDENTIFIED") {
      // Auto-activate morning/evening scene based on time
      const h    = new Date().getHours();
      const key  = h < 9 ? "morning" : h < 18 ? "focus" : "evening";
      const ent  = this.config.scenes[key];
      if (ent) this.sendSocketNotification("SMARTHOME_SCENE", { entity: ent });
    }
    if (note === "VOICE_CMD_LIGHTS_ON")
      this.sendSocketNotification("SMARTHOME_TOGGLE_LIGHT",
        { entity: this.config.rooms[0]?.lightEntity, on: true });
    if (note === "VOICE_CMD_LIGHTS_OFF")
      this.sendSocketNotification("SMARTHOME_TOGGLE_LIGHT",
        { entity: this.config.rooms[0]?.lightEntity, on: false });
  },

  poll () {
    this.sendSocketNotification("SMARTHOME_POLL", {});
  },
});
