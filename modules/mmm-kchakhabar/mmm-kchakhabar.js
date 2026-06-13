/* =============================================================================
 * mmm-kchakhabar.js — MagicMirror² Frontend Module
 * Nepal News Intelligence Ticker (KChakhabar API v1)
 * File must be named exactly: mmm-kchakhabar.js  (module name = folder name)
 * ============================================================================= */

Module.register("mmm-kchakhabar", {

    defaults: {
        updateInterval: 10000,   // ms between headline rotations
        fetchInterval:  300000,  // ms between full API refreshes (5 min)
        language:       "en"     // "en" = topic_en  |  "ne" = topic_ne
    },

    // ─── Lifecycle ──────────────────────────────────────────────────────────────

    start: function () {
        Log.info("[mmm-kchakhabar] Module starting.");

        this.stories     = [];
        this.activeIdx   = 0;
        this.loaded      = false;
        this.errorState  = null;

        // Kick off first fetch immediately
        this.sendSocketNotification("FETCH_KCHAKHABAR_JSON");

        // Periodic API refresh — arrow function retains lexical `this` safely
        this._fetchTimer = setInterval(() => {
            this.sendSocketNotification("FETCH_KCHAKHABAR_JSON");
        }, this.config.fetchInterval);

        // Headline rotation — arrow function retains lexical `this` safely
        this._rotateTimer = setInterval(() => {
            this.rotateHeadline();
        }, this.config.updateInterval);
    },

    // ─── Socket Messages ────────────────────────────────────────────────────────

    socketNotificationReceived: function (notification, payload) {

        if (notification === "KCHAKHABAR_DATA_SHIPPED") {

            if (Array.isArray(payload) && payload.length > 0) {
                // Fresh valid dataset — reset index so we always start from the
                // latest story rather than an out-of-bounds index from the old set
                this.stories    = payload;
                this.activeIdx  = 0;
                this.errorState = null;
                Log.info("[mmm-kchakhabar] Received " + payload.length + " stories.");
            } else {
                // Backend sent an empty array; keep any previously cached stories
                // and do NOT treat this as a hard error — just warn
                Log.warn("[mmm-kchakhabar] Payload arrived empty. Keeping cached set (" +
                         this.stories.length + " items).");
            }

            this.loaded = true;
            this.updateDom(300);

        } else if (notification === "KCHAKHABAR_NETWORK_ERROR") {

            Log.error("[mmm-kchakhabar] Network error reported: " + payload);
            this.errorState = payload || "Unknown network error";
            // Still mark loaded so the DOM renders the error state instead of
            // the infinite "syncing…" spinner
            this.loaded = true;
            this.updateDom(300);
        }
    },

    // ─── Headline Rotation ──────────────────────────────────────────────────────

    rotateHeadline: function () {
        // Guard: only rotate when there is more than one story loaded
        if (!this.loaded || !this.stories || this.stories.length <= 1) {
            return;
        }
        this.activeIdx = (this.activeIdx + 1) % this.stories.length;
        this.updateDom(300);
    },

    // ─── DOM Builder ────────────────────────────────────────────────────────────

    getDom: function () {
        const wrapper = document.createElement("div");
        wrapper.className = "newsfeed";

        // ── State: still waiting for first API response ──────────────────────
        if (!this.loaded) {
            wrapper.innerHTML =
                "<div class='dimmed small' style='letter-spacing:0.15em;'>" +
                "SYNCING KCHAKHABAR INTELLIGENCE MATRIX…" +
                "</div>";
            return wrapper;
        }

        // ── State: a network / parse error occurred ──────────────────────────
        if (this.errorState) {
            wrapper.innerHTML =
                "<div class='dimmed small' style='color:#ff5555;letter-spacing:0.1em;'>" +
                "⛔ NETWORK ERROR: " + this.errorState +
                "</div>";
            return wrapper;
        }

        // ── State: loaded but empty stories array ────────────────────────────
        if (!this.stories || this.stories.length === 0) {
            wrapper.innerHTML =
                "<div class='dimmed small' style='letter-spacing:0.15em;'>" +
                "NO STORIES ACTIVE FOR TODAY" +
                "</div>";
            return wrapper;
        }

        // ── State: normal — render current story ─────────────────────────────
        const story = this.stories[this.activeIdx];

        // Bail safely if index is somehow out of bounds (shouldn't happen, but defensive)
        if (!story) {
            this.activeIdx = 0;
            return wrapper;
        }

        // Source label
        const sourceLabel = document.createElement("div");
        sourceLabel.className = "newsfeed-source";
        sourceLabel.innerText = "K CHAKHABAR • NEPAL NEWS INTELLIGENCE";

        // Headline text — deep field fallback chain matching actual API keys:
        // topic_en / topic_ne (real API) → title → story_title → headline → summary
        const langKey = this.config.language === "ne" ? "topic_ne" : "topic_en";
        const rawText =
            story[langKey]        ||
            story.topic_en        ||
            story.title           ||
            story.story_title     ||
            story.headline        ||
            story.summary         ||
            "";

        const headlineEl = document.createElement("div");
        headlineEl.className = "newsfeed-title";
        headlineEl.innerText = rawText.trim() || "Untitled Intelligence Update";

        // Story index counter (e.g. "3 / 24")
        const counterEl = document.createElement("div");
        counterEl.className = "newsfeed-counter dimmed xsmall";
        counterEl.innerText = (this.activeIdx + 1) + " / " + this.stories.length;

        wrapper.appendChild(sourceLabel);
        wrapper.appendChild(headlineEl);
        wrapper.appendChild(counterEl);

        return wrapper;
    }
});
