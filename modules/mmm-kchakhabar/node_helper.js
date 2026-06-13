/* =============================================================================
 * node_helper.js — MagicMirror² Backend Node Helper
 * Nepal News Intelligence Ticker (KChakhabar API v1)
 * File must be named exactly: node_helper.js
 * ============================================================================= */

"use strict";

const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({

    // ─── Lifecycle ──────────────────────────────────────────────────────────────

    start: function () {
        console.log("[mmm-kchakhabar] Node Helper initialized. Ready to fetch Nepal news.");
        this._isFetching = false; // Concurrency guard — prevents overlapping fetches
    },

    // ─── Socket Entry Point ─────────────────────────────────────────────────────

    socketNotificationReceived: function (notification, payload) {
        if (notification === "FETCH_KCHAKHABAR_JSON") {
            // Prevent concurrent fetches if rotation timer fires before the
            // previous network round-trip completes (can happen on slow connections)
            if (this._isFetching) {
                console.log("[mmm-kchakhabar] Fetch already in progress, skipping duplicate request.");
                return;
            }
            this.pullStories();
        }
    },

    // ─── Network Layer ──────────────────────────────────────────────────────────

    pullStories: async function () {
        this._isFetching = true;
        console.log("[mmm-kchakhabar] Initiating network handshake with KChakhabar API…");

        try {
            // AbortSignal.timeout() is available in Node 17.3+ / Node 22 ✓
            const controller = new AbortController();
            const timeoutId  = setTimeout(() => controller.abort(), 10000); // 10 s hard cap

            const response = await fetch("https://kchakhabar.com/api/v1/today.json", {
                method:  "GET",
                headers: {
                    // Mimic a standard browser context — some CDN/WAF edges reject
                    // bare Node fetch calls without a recognised User-Agent
                    "User-Agent":      "Mozilla/5.0 (Linux; Android 10; SmartMirror) " +
                                       "AppleWebKit/537.36 (KHTML, like Gecko) " +
                                       "Chrome/124.0.0.0 Mobile Safari/537.36",
                    // Explicit Accept chain: prefer JSON, accept plain text as fallback
                    "Accept":          "application/json, text/plain, */*",
                    "Accept-Language": "en-US,en;q=0.9",
                    // Disable caching at every layer so we always get fresh headlines
                    "Cache-Control":   "no-cache",
                    "Pragma":          "no-cache"
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // ── HTTP-level error gate ─────────────────────────────────────────
            if (!response.ok) {
                throw new Error(
                    "HTTP " + response.status + " " + response.statusText +
                    " from kchakhabar.com"
                );
            }

            // ── Parse response body ───────────────────────────────────────────
            // Attempt JSON first; gracefully fall back to raw text diagnosis
            let data;
            const contentType = response.headers.get("content-type") || "";

            if (contentType.includes("application/json") || contentType.includes("text/plain")) {
                const rawText = await response.text();
                if (!rawText || rawText.trim() === "") {
                    throw new Error("API returned an empty response body.");
                }
                try {
                    data = JSON.parse(rawText);
                } catch (parseErr) {
                    throw new Error("JSON parse failure: " + parseErr.message +
                                    " | First 120 chars: " + rawText.substring(0, 120));
                }
            } else {
                // Unexpected content-type — try JSON.parse anyway
                data = await response.json();
            }

            if (!data) {
                throw new Error("Null or undefined payload after parsing.");
            }

            // ── Deep payload extraction ───────────────────────────────────────
            // The KChakhabar API v1 returns: { generated_at, story_count, stories: [...] }
            // But we probe every plausible envelope key so this survives API evolution:
            let stories = [];

            if      (Array.isArray(data.stories))  { stories = data.stories;  }
            else if (Array.isArray(data.articles))  { stories = data.articles; }
            else if (Array.isArray(data.data))      { stories = data.data;     }
            else if (Array.isArray(data.items))     { stories = data.items;    }
            else if (Array.isArray(data.results))   { stories = data.results;  }
            else if (Array.isArray(data))           { stories = data;          }
            else if (typeof data === "object") {
                // Last-resort: scan every top-level key for the first array
                for (const key of Object.keys(data)) {
                    if (Array.isArray(data[key]) && data[key].length > 0) {
                        stories = data[key];
                        console.log("[mmm-kchakhabar] Found stories under dynamic key: '" + key + "'");
                        break;
                    }
                }
            }

            // ── Validate story items ──────────────────────────────────────────
            // Filter to objects that carry at least one usable text field
            const validStories = stories.filter(function (item) {
                return item && typeof item === "object" && (
                    item.topic_en    ||
                    item.topic_ne    ||
                    item.title       ||
                    item.story_title ||
                    item.headline    ||
                    item.summary
                );
            });

            console.log(
                "[mmm-kchakhabar] Parsed " + stories.length + " raw items, " +
                validStories.length + " valid stories extracted."
            );

            if (validStories.length === 0) {
                // Don't treat zero-item results as a fatal error — log and send empty.
                // The frontend will show the "NO STORIES" state, not an error banner.
                console.warn("[mmm-kchakhabar] Zero valid stories found in API payload.");
            }

            this.sendSocketNotification("KCHAKHABAR_DATA_SHIPPED", validStories);

        } catch (err) {
            // ── Error path: always send KCHAKHABAR_NETWORK_ERROR, never a fake story
            // A fake story in the success channel breaks the frontend's DOM state machine
            const message = err.name === "AbortError"
                ? "Request timed out after 10 seconds"
                : err.message;

            console.error("[mmm-kchakhabar] ⛔ Fetch failed:", message);
            this.sendSocketNotification("KCHAKHABAR_NETWORK_ERROR", message);

        } finally {
            this._isFetching = false;
        }
    }
});
