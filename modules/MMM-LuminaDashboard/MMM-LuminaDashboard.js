// Exquisite Thin-Line Premium SVG Icon Database - 2030 Academic OS Edition
const ICONS = {
    HOME: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:4px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
    CALENDAR: `<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    SCHEDULE: `<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    HEALTH: `<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>`,
    NEWS: `<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><line x1="16" y1="8" x2="18" y2="8"></line><line x1="16" y1="12" x2="18" y2="12"></line><line x1="16" y1="16" x2="18" y2="16"></line><line x1="6" y1="8" x2="12" y2="8"></line><line x1="6" y1="12" x2="12" y2="12"></line><line x1="6" y1="16" x2="12" y2="16"></line></svg>`,
    PROFILE: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    HEART: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    LOCATION: `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:4px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    TRENDS: `<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
    SHIELD: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
    FINGERPRINT: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9"></path></svg>`,
    WIFI: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"></path></svg>`,
    SETTINGS: `<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
    
    // Vector Mood SVGs
    MOOD_HAPPY: `<svg viewBox="0 0 24 24" width="48" height="48" stroke="#10b981" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>`,
    MOOD_SURPRISED: `<svg viewBox="0 0 24 24" width="48" height="48" stroke="#3b82f6" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="15" r="2"></circle><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>`,
    MOOD_CALM: `<svg viewBox="0 0 24 24" width="48" height="48" stroke="#06b6d4" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="15" x2="16" y2="15"></line><path d="M9 9a1 1 0 0 1 2 0"></path><path d="M13 9a1 1 0 0 1 2 0"></path></svg>`,
    MOOD_SAD: `<svg viewBox="0 0 24 24" width="48" height="48" stroke="#6b7280" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>`,
    MOOD_ANGRY: `<svg viewBox="0 0 24 24" width="48" height="48" stroke="#ef4444" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><path d="M7.5 8.5l3 1.5"></path><path d="M16.5 8.5l-3 1.5"></path></svg>`,
    MOOD_NEUTRAL: `<svg viewBox="0 0 24 24" width="48" height="48" stroke="#3b82f6" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="15" x2="16" y2="15"></line><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>`,
    WEATHER_CLOUDY: `<svg viewBox="0 0 24 24" width="36" height="36" stroke="#3b82f6" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 3 20h15a5 5 0 0 0 0-10z"></path></svg>`
};

const LOGO_SVG = `<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" class="topbar-logo-icon"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg>`;
const SUN_ICON_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

Module.register("MMM-LuminaDashboard", {
    defaults: {
        websocketUrl: "ws://127.0.0.1:8000/ws/dashboard/stream",
        apiBaseUrl: "http://127.0.0.1:8000",
        fallbackDisplayName: "Student",
        fallbackUsername: ""
    },

    getStyles: function() {
        return ["dashboard.css"];
    },

    getScripts: function() {
        return ["https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js"];
    },

    start: function() {
        this.biometricState = { detected: false, bpm: 72, mood: "NEUTRAL", anxiety: "LOW" };
        this.gestureState = { activeGesture: "NONE", power_state: "WAKE" };
        this.lastReceivedGesture = "NONE";
        this.identityState = { currentUser: "Student", currentUserKey: "", confidence: 98 };
        this.agendaState = [];
        this.newsState = [
            {
                title: "Lumina Smart Mirror OS Operational",
                description: "AI-powered student assistant system active in Kathmandu campus environment.",
                link: "https://lumina.smartmirror",
                pubDate: "Just now",
                source: "Google News Nepal",
                category: "Academic"
            },
            {
                title: "Section L3 Timetable & Innovation Fest Active",
                description: "Interactive schedule manager synced with Section L3 lectures and MERN workshops.",
                link: "https://lumina.smartmirror",
                pubDate: "Just now",
                source: "Google News Nepal",
                category: "Academic"
            }
        ];
        this.systemStats = { cpu: 24.5, ram: 68.2 };
        this.historicalSummary = null;
        this.summaryCache = {};
        this.lastSummaryFetch = {};
        
        this.activeSection = -1; 
        this.landingSelectedIndex = 0;
        this.lastActiveSection = -1;
        this.lastRenderedSection = -2;
        this.activeSectionChanged = false;
        this.transitionDirection = "in";
        this.lastUser = null;
        this.lastAgendaStr = "";
        this.lastNewsStr = "";
        this.lastGestureTime = 0;
        this.lastHandledGesture = "NONE";
        this.weatherState = { city: "Kathmandu, Nepal", temperature: "24°C", humidity: "65%", wind: "8 km/h", condition: "Partly Cloudy", icon: "⛅", air_quality: "Good" };
        
        this.liveHeartrateHistory = [];
        const baseTime = Date.now();
        for (let i = 11; i >= 0; i--) {
            const t = new Date(baseTime - i * 5000);
            this.liveHeartrateHistory.push({
                time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                bpm: 72.0 + Math.sin(i) * 2.5 + Math.random(),
                mood: "NEUTRAL",
                anxiety: "LOW"
            });
        }

        this.connectToCoreOSDaemon();
        this.fetchHistoricalSummary();
        this.fetchLiveNews();
        this.fetchNepalWeather();
        this.fetchStudentSchedule();

        const self = this;
        setTimeout(() => { self.fetchLiveNews(); }, 3000);
        setInterval(() => { self.fetchLiveNews(); }, 300000);
        setInterval(() => { self.fetchNepalWeather(); }, 600000);

        setInterval(() => { self.updateLandingPageClock(); }, 1000);
    },

    fetchStudentSchedule: function() {
        const self = this;
        const user = this.identityState.currentUser && this.identityState.currentUser !== "Searching..." ? this.identityState.currentUser : "Sulav";
        fetch(`${this.config.apiBaseUrl}/api/schedules/${encodeURIComponent(user)}`)
            .then(res => res.json())
            .then(data => {
                self.studentScheduleState = data;
                self.updateDom();
            })
            .catch(err => console.error("[LUMINA SCHEDULE FETCH ERROR]", err));
    },

    connectToCoreOSDaemon: function() {
        const self = this;
        try {
            this.socket = new WebSocket(this.config.websocketUrl);
            this.socket.onopen = function() {
                console.log("[LUMINA WS ENGINE] Connected to FastAPI backend engine.");
            };
            this.socket.onmessage = function(event) {
                try {
                    const payload = JSON.parse(event.data);
                    self.handleWebSocketPayload(payload);
                } catch (e) {
                    console.error("[LUMINA WS ENGINE] JSON parse error:", e);
                }
            };
            this.socket.onclose = function() {
                setTimeout(() => { self.connectToCoreOSDaemon(); }, 3000);
            };
        } catch (err) {
            console.error("[LUMINA WS ENGINE] Connection failure:", err);
        }
    },

    handleWebSocketPayload: function(payload) {
        if (!payload) return;
        let domNeedsUpdate = false;

        if (payload.biometrics) {
            this.biometricState = payload.biometrics;
            domNeedsUpdate = true;
        }

        if (payload.identity) {
            const prevUser = this.identityState.currentUser;
            this.identityState = payload.identity;
            if (prevUser !== this.identityState.currentUser) {
                domNeedsUpdate = true;
                this.fetchStudentSchedule();
            }
        }

        if (payload.gestures) {
            this.gestureState = payload.gestures;
            this.handleIncomingGesture(payload.gestures.activeGesture);
        }

        if (payload.system_stats) {
            this.systemStats = payload.system_stats;
        }

        if (domNeedsUpdate) {
            this.updateDom();
        }
    },

    fetchLiveNews: function() {
        const self = this;
        fetch(`${this.config.apiBaseUrl}/api/dashboard/news`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    self.newsState = data;
                    self.lastNewsFetch = Date.now();
                    self.updateDom();
                }
            })
            .catch(err => console.error("[LUMINA NEWS ERROR]", err));
    },

    fetchNepalWeather: function() {
        const self = this;
        fetch(`${this.config.apiBaseUrl}/api/dashboard/weather`)
            .then(res => res.json())
            .then(data => {
                if (data && data.temperature) {
                    self.weatherState = data;
                    self.updateDom();
                }
            })
            .catch(err => console.error("[LUMINA WEATHER ERROR]", err));
    },

    fetchHistoricalSummary: function() {},

    logFeatureUsage: function(feature, details) {
        const user = this.identityState.currentUser || "Student";
        fetch(`${this.config.apiBaseUrl}/api/logs/record`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user: user,
                feature: feature,
                details: details,
                mood: this.biometricState.mood || "NEUTRAL",
                happiness_score: this.biometricState.happiness_score || 50.0
            })
        }).catch(err => console.error("[LOGGING ERROR]", err));
    },

    updateLandingPageClock: function() {
        const clockEl = document.querySelector(".digital-clock");
        const dateEl = document.querySelector(".current-date");
        if (!clockEl) return;

        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        clockEl.innerHTML = `${String(hours).padStart(2, "0")}:${minutes} <span class="ampm">${ampm}</span>`;

        if (dateEl) {
            const dateOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
            dateEl.innerText = now.toLocaleDateString('en-US', dateOptions);
        }
    },

    getUpcomingEvents: function() {
        return this.agendaState || [];
    },

    getUpcomingSchedulePreview: function() {
        const schedData = this.studentScheduleState || {};
        const schedule = schedData.schedule || (schedData.default_schedule ? schedData.default_schedule.schedule : []);
        if (!schedule || schedule.length === 0) {
            return "MERN Stack • 08:00 AM (Lab 1)";
        }
        const first = schedule[0];
        const timePart = first.time ? first.time.split('-')[0].trim() : "08:00 AM";
        return `${first.subject} (${timePart} • ${first.room || 'Lab 1'})`;
    },

    handleIncomingGesture: function(gesture) {
        if (!gesture || gesture === "NONE") {
            this.lastHandledGesture = "NONE";
            return;
        }
        if (gesture === this.lastHandledGesture) return;

        const now = Date.now();
        if (now - this.lastGestureTime < 300) return;
        this.lastGestureTime = now;
        this.lastHandledGesture = gesture;

        let shouldUpdate = false;
        const FINGER_COUNT_SECTION = {
            "ONE_FINGER": 0,
            "TWO_FINGERS": 1,
            "THREE_FINGERS": 2,
            "FOUR_FINGERS": 3
        };

        if (this.activeSection === 3) {
            if (gesture === "ONE_FINGER") {
                if (this.scheduleSubTab !== "student") { this.scheduleSubTab = "student"; shouldUpdate = true; }
            } else if (gesture === "TWO_FINGERS") {
                if (this.scheduleSubTab !== "general") { this.scheduleSubTab = "general"; shouldUpdate = true; }
            } else if (gesture === "THREE_FINGERS") {
                if (this.scheduleSubTab !== "notices") { this.scheduleSubTab = "notices"; shouldUpdate = true; }
            } else if (gesture === "OPEN_PALM" || gesture === "SWIPE_RIGHT" || gesture === "SWIPE_LEFT") {
                const subTabs = ["student", "general", "notices"];
                const currIdx = subTabs.indexOf(this.scheduleSubTab || "student");
                this.scheduleSubTab = subTabs[(currIdx + 1) % subTabs.length];
                shouldUpdate = true;
            } else if (gesture === "CLOSED_FIST") {
                this.activeSection = -1;
                shouldUpdate = true;
            }
        } else {
            if (gesture === "CLOSED_FIST") {
                if (this.activeSection !== -1) {
                    this.activeSection = -1;
                    shouldUpdate = true;
                }
            } else if (Object.prototype.hasOwnProperty.call(FINGER_COUNT_SECTION, gesture)) {
                const targetSection = FINGER_COUNT_SECTION[gesture];
                if (this.activeSection !== targetSection) {
                    this.landingSelectedIndex = targetSection;
                    this.activeSection = targetSection;
                    shouldUpdate = true;
                }
            }
        }

        if (shouldUpdate) {
            this.updateDom();
        }
    },

    getDom: function() {
        const self = this;

        if (this.activeSection !== this.lastRenderedSection) {
            this.activeSectionChanged = true;
            if (this.activeSection === -1) {
                this.transitionDirection = "out";
            } else if (this.lastRenderedSection === -1) {
                this.transitionDirection = "in";
            } else {
                const prev = this.lastRenderedSection;
                const next = this.activeSection;
                this.transitionDirection = next > prev ? "slide-left" : "slide-right";
            }
            this.lastRenderedSection = this.activeSection;
        } else {
            this.activeSectionChanged = false;
        }

        if (this.gestureState.power_state === "SLEEP") {
            const sleepScreen = document.createElement("div");
            sleepScreen.className = "lumina-sleep-shroud-cover";
            sleepScreen.innerHTML = `<div class="sleep-eco-msg">SYSTEM DEEP POWER CONSERVATION STATE ACTIVE</div>`;
            return sleepScreen;
        }

        const rootContainer = document.createElement("div");
        rootContainer.className = "lumina-dashboard-wrapper";

        const menuItems = [
            { id: 0, label: "REAL-TIME WEATHER", icon: SUN_ICON_SVG },
            { id: 1, label: "LIVE NEPALI NEWS", icon: ICONS.NEWS },
            { id: 2, label: "HAPPINESS & MOOD", icon: ICONS.HEALTH },
            { id: 3, label: "CLASS SCHEDULES", icon: ICONS.SCHEDULE }
        ];

        if (this.activeSection !== -1) {
            const topBar = document.createElement("div");
            topBar.className = "lumina-fullscreen-topbar";
            const currentItem = menuItems.find(i => i.id === this.activeSection);
            
            topBar.innerHTML = `
                <div class="topbar-logo-side">
                    <button class="topbar-back-btn">${ICONS.HOME} HOME</button>
                    <div class="topbar-logo-text-box">
                        <span class="topbar-logo-title" style="font-size: 20px;">LUMINA</span>
                        <span class="topbar-logo-subtitle" style="font-size: 10px;">ACADEMIC OS v2.4</span>
                    </div>
                </div>
                <span class="topbar-title">${currentItem ? currentItem.label : "VIEW"}</span>
                <span class="topbar-gesture-hint">
                    ${this.activeSection === 3 
                        ? '☝️ 1 Finger: Student Routine | ✌️ 2 Fingers: Section L3 Timetable | 🤟 3 Fingers: Notice Board | ✊ Closed Fist: Home' 
                        : 'CLOSED FIST (0 fingers) to return to Home Page'}
                </span>
            `;
            
            topBar.querySelector(".topbar-back-btn").addEventListener("click", () => {
                self.activeSection = -1;
                self.updateDom();
            });
            rootContainer.appendChild(topBar);
        } else {
            const topBar = document.createElement("div");
            topBar.className = "lumina-fullscreen-topbar";
            topBar.innerHTML = `
                <div class="topbar-logo-side">
                    ${LOGO_SVG}
                    <div class="topbar-logo-text-box">
                        <span class="topbar-logo-title">LUMINA</span>
                        <span class="topbar-logo-subtitle">SMART MIRROR OS • UNIVERSITY EDITION</span>
                    </div>
                </div>
                <div class="topbar-settings-side">
                    <button class="topbar-brightness-toggle">${SUN_ICON_SVG}</button>
                </div>
            `;
            rootContainer.appendChild(topBar);
        }

        const workspaceBody = document.createElement("div");
        workspaceBody.className = "lumina-workspace-body";

        switch(this.activeSection) {
            case -1:
                workspaceBody.appendChild(this.buildLandingPageSection());
                break;
            case 0:
                workspaceBody.appendChild(this.buildWeatherSection());
                break;
            case 1:
                workspaceBody.appendChild(this.buildNewsSection());
                break;
            case 2:
                workspaceBody.appendChild(this.buildMoodSection());
                break;
            case 3:
                workspaceBody.appendChild(this.buildScheduleSection());
                break;
        }
        rootContainer.appendChild(workspaceBody);

        const statusBar = document.createElement("div");
        statusBar.className = "lumina-status-bar";
        const currentBreakingNews = this.newsState.length > 0 ? this.newsState[0].title : "Section L3 Timetable Active • MERN Stack Workshop 08:30 AM";
        const username = this.identityState.currentUser && this.identityState.currentUser !== "Searching..." && this.identityState.currentUser !== "Guest" ? this.identityState.currentUser : this.config.fallbackDisplayName;

        statusBar.innerHTML = `
            <div class="status-bar-left">
                <span class="status-stat"><span class="icon">⛅</span> ${this.weatherState.city}: ${this.weatherState.temperature}, ${this.weatherState.condition}</span>
                <span class="status-stat"><span class="icon">${ICONS.WIFI}</span> WiFi: Connected</span>
                <span class="status-stat"><span class="icon">${ICONS.SETTINGS}</span> CPU: ${this.systemStats.cpu}%</span>
                <span class="status-stat"><span class="icon">${ICONS.TRENDS}</span> RAM: ${this.systemStats.ram}%</span>
                <span class="status-stat"><span class="icon">${ICONS.LOCATION}</span> Asia/Kathmandu (+05:45)</span>
                <span class="status-stat"><span class="icon">${ICONS.HEART}</span> ${typeof this.biometricState.bpm === 'number' ? Math.round(this.biometricState.bpm) : 72} BPM</span>
                <span class="status-stat"><span class="icon">${ICONS.SHIELD}</span> Status: SECURE</span>
                <span class="status-stat" style="color: var(--primary-accent); font-weight: 700;"><span class="icon">${ICONS.PROFILE}</span> ${username}</span>
            </div>
            <div class="bottom-breaking-news">
                <span class="breaking-badge">LIVE NEWS</span>
                <div class="breaking-marquee-container">
                    <span class="breaking-headline">${currentBreakingNews}  •  Lumina University AI Assistant Online.</span>
                </div>
            </div>
        `;
        rootContainer.appendChild(statusBar);

        return rootContainer;
    },

    buildLandingPageSection: function() {
        const container = document.createElement("div");
        container.className = "workspace-section-container" + (this.activeSectionChanged ? " morph-" + this.transitionDirection : "");

        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        const timeString = `${String(hours).padStart(2, "0")}:${minutes} <span class="ampm">${ampm}</span>`;
        
        const dateOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        const dateString = now.toLocaleDateString('en-US', dateOptions);

        const hour = now.getHours();
        let greetText = "Good Morning";
        if (hour >= 12 && hour < 17) greetText = "Good Afternoon";
        else if (hour >= 17) greetText = "Good Evening";

        const username = this.identityState.currentUser && this.identityState.currentUser !== "Searching..." && this.identityState.currentUser !== "Guest" ? this.identityState.currentUser : this.config.fallbackDisplayName;
        
        const happyScore = typeof this.biometricState.happiness_score === "number" ? Math.round(this.biometricState.happiness_score) : 50;
        const mood = this.biometricState.mood || "NEUTRAL";
        const newsTitle = this.newsState.length > 0 ? this.newsState[0].title : "Campus Innovation Fest Abstract Submissions Open";
        const upcomingSchedPreview = this.getUpcomingSchedulePreview();

        const menuItems = [
            { 
                id: 0, 
                label: "WEATHER", 
                icon: ICONS.WEATHER_CLOUDY, 
                desc: "Live Kathmandu & campus climate forecast", 
                fingerHint: "☝️ 1 FINGER",
                previewLabel: "CURRENT FORECAST",
                previewVal: `${this.weatherState.temperature} • ${this.weatherState.condition}`
            },
            { 
                id: 1, 
                label: "LIVE NEWS", 
                icon: ICONS.NEWS, 
                desc: "Top academic bulletins & Google News Nepal feeds", 
                fingerHint: "✌️ 2 FINGERS",
                previewLabel: "HEADLINE TICKER",
                previewVal: newsTitle
            },
            { 
                id: 2, 
                label: "MOOD & HEALTH", 
                icon: ICONS.HEALTH, 
                desc: "Facial affect tracking & biometrics", 
                fingerHint: "🤟 3 FINGERS",
                previewLabel: "HAPPINESS SCORE",
                previewVal: `${happyScore}% (${mood})`
            },
            { 
                id: 3, 
                label: "CLASS SCHEDULE", 
                icon: ICONS.SCHEDULE, 
                desc: "Section L3 timetable & lecture reminders", 
                fingerHint: "🖐️ 4 FINGERS",
                previewLabel: "NEXT LECTURE",
                previewVal: upcomingSchedPreview
            }
        ];

        let menuGridHTML = "";
        menuItems.forEach((item, index) => {
            const isSelected = index === this.landingSelectedIndex ? "selected" : "";
            menuGridHTML += `
                <div class="grid-card ${isSelected}" data-index="${index}">
                    <div class="grid-card-finger-badge">${item.fingerHint}</div>
                    <div class="grid-card-top-icon">${item.icon}</div>
                    <div>
                        <div class="grid-card-title">${item.label}</div>
                        <div class="grid-card-desc">${item.desc}</div>
                    </div>
                    <div class="grid-card-preview-box">
                        <div class="grid-card-preview-lbl">${item.previewLabel}</div>
                        <div class="grid-card-preview-val">${item.previewVal}</div>
                    </div>
                    <button class="grid-card-arrow">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>
            `;
        });

        container.innerHTML = `
            <div class="landing-page-layout-v2">
                <!-- Top Section: Large Clock & Personalized Greeting -->
                <div class="landing-top-hero">
                    <div class="hero-left-box">
                        <div class="digital-clock">${timeString}</div>
                        <div class="current-date">${dateString}</div>
                    </div>
                    <div class="hero-right-box">
                        <div class="ai-assistant-badge">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"></path></svg>
                            LUMINA ACADEMIC AI v2.4
                        </div>
                        <div class="greeting-text">${greetText}, <span class="greeting-name-gradient">${username}</span></div>
                    </div>
                </div>
                
                <!-- Middle Telemetry Section -->
                <div class="landing-middle-status glass-card">
                    <div class="status-strip-header">
                        <span class="card-title-gold">${ICONS.SHIELD} SMART MIRROR BIOMETRIC & ENGINE TELEMETRY</span>
                        <span class="status-online-badge">SYSTEM NOMINAL</span>
                    </div>
                    <div class="status-strip-grid">
                        <div class="status-strip-item">
                            <span class="lbl-side">${ICONS.PROFILE} Student Identity</span>
                            <span class="val-side">${username} <span class="status-dot green"></span></span>
                        </div>
                        <div class="status-strip-item">
                            <span class="lbl-side">${ICONS.HEALTH} Happiness Index</span>
                            <span class="val-side" style="color: var(--secondary-accent);">${happyScore}% (${mood}) <span class="status-dot cyan"></span></span>
                        </div>
                        <div class="status-strip-item">
                            <span class="lbl-side">${ICONS.FINGERPRINT} Activity Log</span>
                            <span class="val-side" style="color: var(--success);">RECORDING <span class="status-dot green"></span></span>
                        </div>
                        <div class="status-strip-item">
                            <span class="lbl-side">${ICONS.SHIELD} Finger Engine</span>
                            <span class="val-side" style="color: var(--primary-accent);">ACTIVE <span class="status-dot blue"></span></span>
                        </div>
                    </div>
                </div>

                <!-- AI Gesture Finger Guide Legend Strip -->
                <div class="gesture-guide-bar glass-card" style="padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; border-radius: 14px;">
                    <span style="font-size: 0.78rem; font-weight: 700; color: var(--secondary-accent); letter-spacing: 1.2px; text-transform: uppercase; display: flex; align-items: center; gap: 8px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6"></path><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path><path d="M18 8a2 2 0 0 1 2 2v4a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6v-1.5"></path></svg>
                        AI FINGER GESTURE NAVIGATION GUIDE:
                    </span>
                    <div style="display: flex; gap: 24px; font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">
                        <span style="display: inline-flex; align-items: center; gap: 6px;"><strong style="color: var(--primary-accent);">☝️ 1 Finger:</strong> Weather</span>
                        <span style="display: inline-flex; align-items: center; gap: 6px;"><strong style="color: var(--secondary-accent);">✌️ 2 Fingers:</strong> Live News</span>
                        <span style="display: inline-flex; align-items: center; gap: 6px;"><strong style="color: var(--purple-accent);">🤟 3 Fingers:</strong> Mood & Health</span>
                        <span style="display: inline-flex; align-items: center; gap: 6px;"><strong style="color: var(--success);">🖐️ 4 Fingers:</strong> Class Schedule</span>
                        <span style="display: inline-flex; align-items: center; gap: 6px;"><strong style="color: #EF4444;">✊ Fist:</strong> Home</span>
                    </div>
                </div>

                <!-- Bottom Section: 4 Core Feature Cards Grid -->
                <div class="landing-bottom-grid">
                    ${menuGridHTML}
                </div>
            </div>
        `;

        const self = this;
        container.querySelectorAll(".grid-card").forEach(item => {
            item.addEventListener("click", () => {
                const idx = parseInt(item.getAttribute("data-index"));
                self.landingSelectedIndex = idx;
                self.activeSection = idx;
                self.updateDom();
            });
        });

        return container;
    },

    buildWeatherSection: function() {
        this.logFeatureUsage("WEATHER_VIEW", "Viewing Real-time Weather module");
        const container = document.createElement("div");
        container.className = "workspace-section-container" + (this.activeSectionChanged ? " morph-" + this.transitionDirection : "");

        const w = this.weatherState || {
            city: "Kathmandu, Nepal",
            temperature: "24°C",
            humidity: "65%",
            wind: "8 km/h",
            condition: "Partly Cloudy",
            icon: "⛅",
            air_quality: "Good"
        };

        container.innerHTML = `
            <div class="weather-dashboard-view" style="display: flex; flex-direction: column; gap: 20px; height: 100%;">
                <div class="weather-hero-card glass-card" style="padding: 28px 32px; display: grid; grid-template-columns: 1.2fr 1fr; gap: 30px; border-radius: 20px;">
                    <div class="weather-main-side" style="display: flex; flex-direction: column; justify-content: center; gap: 10px;">
                        <div style="font-size: 4.5rem; line-height: 1;">${w.icon}</div>
                        <div style="font-size: 3.5rem; font-weight: 300; font-family: 'Outfit'; color: #fff;">${w.temperature}</div>
                        <div style="font-size: 1.4rem; font-weight: 600; color: var(--primary-accent); letter-spacing: 1px;">${w.condition}</div>
                        <div style="font-size: 1rem; color: var(--text-secondary);">${w.city}</div>
                    </div>
                    <div class="weather-stats-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-content: center;">
                        <div class="w-stat-card" style="background: rgba(17,24,39,0.6); border: 1px solid var(--card-glass-border); padding: 16px; border-radius: 14px;">
                            <div style="font-size: 0.72rem; color: var(--text-secondary); letter-spacing: 1px; font-weight: 700;">HUMIDITY</div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: #fff; margin-top: 4px;">${w.humidity}</div>
                        </div>
                        <div class="w-stat-card" style="background: rgba(17,24,39,0.6); border: 1px solid var(--card-glass-border); padding: 16px; border-radius: 14px;">
                            <div style="font-size: 0.72rem; color: var(--text-secondary); letter-spacing: 1px; font-weight: 700;">WIND SPEED</div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: #fff; margin-top: 4px;">${w.wind}</div>
                        </div>
                        <div class="w-stat-card" style="background: rgba(17,24,39,0.6); border: 1px solid var(--card-glass-border); padding: 16px; border-radius: 14px;">
                            <div style="font-size: 0.72rem; color: var(--text-secondary); letter-spacing: 1px; font-weight: 700;">AIR QUALITY</div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--success); margin-top: 4px;">${w.air_quality}</div>
                        </div>
                        <div class="w-stat-card" style="background: rgba(17,24,39,0.6); border: 1px solid var(--card-glass-border); padding: 16px; border-radius: 14px;">
                            <div style="font-size: 0.72rem; color: var(--text-secondary); letter-spacing: 1px; font-weight: 700;">TIMEZONE</div>
                            <div style="font-size: 1.3rem; font-weight: 700; color: var(--secondary-accent); margin-top: 4px;">Nepal (+5:45)</div>
                        </div>
                    </div>
                </div>

                <div class="glass-card" style="padding: 24px; border-radius: 20px; flex: 1;">
                    <div style="font-size: 1.1rem; font-family: 'Outfit'; font-weight: 700; color: var(--primary-accent); margin-bottom: 12px; letter-spacing: 1px;">
                        KATHMANDU CAMPUS METEOROLOGICAL TELEMETRY
                    </div>
                    <div style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6;">
                        Real-time ambient weather parameters fetched from Open-Meteo API. High-contrast display tuned for 2-3 meter visibility on university smart mirror hardware.
                    </div>
                </div>
            </div>
        `;
        return container;
    },

    buildNewsSection: function() {
        this.logFeatureUsage("NEWS_VIEW", "Viewing Live Nepali News module");
        if (!this.lastNewsFetch || (Date.now() - this.lastNewsFetch > 10000)) {
            this.fetchLiveNews();
        }
        const container = document.createElement("div");
        container.className = "workspace-section-container" + (this.activeSectionChanged ? " morph-" + this.transitionDirection : "");

        let newsHTML = "";
        if (this.newsState && this.newsState.length > 0) {
            this.newsState.forEach((item, index) => {
                const sourceBadge = item.source ? item.source : "Nepali News";
                const categoryBadge = item.category ? item.category : "Nepal";

                newsHTML += `
                    <div class="news-feed-card interactive-row" style="padding: 18px 22px; margin-bottom: 12px; background: rgba(17,24,39,0.5); border: 1px solid var(--card-glass-border); border-radius: 16px;">
                        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <div style="display:flex; gap: 8px; align-items:center;">
                                <span style="font-size: 13px; color: var(--secondary-accent); font-weight: 700; font-family: 'Outfit';">[${index + 1}]</span>
                                <span style="font-size: 11px; background: rgba(34,211,238,0.1); border: 1px solid rgba(34,211,238,0.25); color: var(--secondary-accent); padding: 2px 8px; border-radius: 10px; font-weight: 700; text-transform: uppercase;">${sourceBadge}</span>
                                <span style="font-size: 11px; background: rgba(255,255,255,0.04); color: var(--text-secondary); padding: 2px 8px; border-radius: 8px;">${categoryBadge}</span>
                            </div>
                            <span style="font-size: 12px; color: var(--text-secondary);">${item.pubDate || 'Recently'}</span>
                        </div>
                        <div style="font-size: 17px; font-weight: 600; color: #fff; line-height: 1.4; margin-bottom: 6px;">${item.title}</div>
                        <div style="font-size: 14px; line-height: 1.5; color: var(--text-secondary);">${item.description}</div>
                    </div>
                `;
            });
        } else {
            newsHTML = `
                <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 200px; opacity: 0.5;">
                    <span style="display: inline-block; margin-bottom: 12px; color: var(--secondary-accent);">${ICONS.NEWS}</span>
                    <span style="font-size: 15px;">Indexing live academic feeds...</span>
                </div>`;
        }

        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <div class="section-title" style="font-size: 1.4rem; letter-spacing: 1px; font-family: 'Outfit'; color: var(--secondary-accent); font-weight: 700; display: flex; align-items: center; gap: 10px;">
                    ${ICONS.NEWS} LIVE ACADEMIC & NEPALI HEADLINES
                </div>
                <span style="font-size: 0.8rem; padding: 4px 12px; background: rgba(34,211,238,0.08); border: 1px solid rgba(34,211,238,0.25); border-radius: 12px; color: var(--secondary-accent); font-weight: 600;">Google News Nepal & Campus Feeds</span>
            </div>
            <div class="news-list-wrapper scrollable-container" style="max-height: calc(100vh - 210px); overflow-y: auto;">${newsHTML}</div>
        `;
        return container;
    },

    buildMoodSection: function() {
        this.logFeatureUsage("MOOD_ANALYSIS_VIEW", "Viewing Happiness Index & Mood Analysis module");
        const container = document.createElement("div");
        container.className = "workspace-section-container" + (this.activeSectionChanged ? " morph-" + this.transitionDirection : "");

        const mood = this.biometricState.mood || "NEUTRAL";
        const happyScore = typeof this.biometricState.happiness_score === "number" ? Math.round(this.biometricState.happiness_score) : 50;
        
        let moodColor = "#3B82F6";
        let moodSvg = ICONS.MOOD_NEUTRAL;
        let moodDesc = "Balanced Baseline Affect";
        if (mood === "HAPPY") { moodColor = "#10B981"; moodSvg = ICONS.MOOD_HAPPY; moodDesc = "Elevated Positive Affect"; }
        else if (mood === "SURPRISED") { moodColor = "#22D3EE"; moodSvg = ICONS.MOOD_SURPRISED; moodDesc = "High Attentional Arousal"; }
        else if (mood === "CALM") { moodColor = "#06B6D4"; moodSvg = ICONS.MOOD_CALM; moodDesc = "Relaxed Physiological State"; }
        else if (mood === "SAD") { moodColor = "#64748B"; moodSvg = ICONS.MOOD_SAD; moodDesc = "Low Emotional Energy"; }
        else if (mood === "ANGRY") { moodColor = "#EF4444"; moodSvg = ICONS.MOOD_ANGRY; moodDesc = "High Tension / Valence Shift"; }

        container.innerHTML = `
            <div class="mood-dashboard-view" style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 20px; height: 100%;">
                <div class="mood-hero-card glass-card" style="padding: 28px; border-radius: 20px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; text-align: center;">
                    <div style="font-family: 'Outfit'; font-size: 1.2rem; font-weight: 700; color: var(--text-primary); letter-spacing: 1px; width: 100%; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 12px;">
                        <span>REAL-TIME HAPPINESS & AFFECT METER</span>
                        <span style="font-size: 0.72rem; padding: 3px 10px; border-radius: 10px; background: rgba(16,185,129,0.12); color: var(--success); border: 1px solid rgba(16,185,129,0.3); font-weight: 700;">LIVE TELEMETRY</span>
                    </div>

                    <div class="happiness-score-circle" style="position: relative; width: 200px; height: 200px; border-radius: 50%; border: 4px solid ${moodColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle, rgba(17,24,39,0.9) 0%, rgba(11,17,32,0.95) 100%); box-shadow: 0 0 35px ${moodColor}30, inset 0 0 20px ${moodColor}15; transition: all 0.5s ease; margin: 16px 0;">
                        <span style="line-height: 1; display: flex; align-items: center; justify-content: center;">${moodSvg}</span>
                        <span style="font-size: 2.8rem; font-weight: 800; font-family: 'Outfit'; color: ${moodColor}; margin-top: 4px; letter-spacing: -1px;">${happyScore}%</span>
                        <span style="font-size: 0.65rem; letter-spacing: 1.5px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">HAPPINESS INDEX</span>
                    </div>

                    <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; width: 100%;">
                        <span style="font-size: 0.72rem; letter-spacing: 1.5px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">EVALUATED EMOTIONAL STATE</span>
                        <div style="font-size: 1.4rem; font-weight: 700; padding: 6px 24px; border-radius: 14px; background: ${moodColor}20; color: ${moodColor}; border: 1px solid ${moodColor}50; font-family: 'Outfit'; letter-spacing: 1px;">
                            ${mood}
                        </div>
                        <span style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">${moodDesc}</span>
                    </div>

                    <div style="width: 100%; max-width: 400px; margin-top: 12px;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 6px; font-weight: 600;">
                            <span>0% (Low)</span>
                            <span style="color: var(--primary-accent);">Continuous Affective Level</span>
                            <span>100% (High)</span>
                        </div>
                        <div style="width: 100%; height: 10px; background: rgba(255,255,255,0.06); border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); padding: 1px;">
                            <div style="width: ${happyScore}%; height: 100%; background: linear-gradient(90deg, ${moodColor}aa, ${moodColor}); border-radius: 4px; transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);"></div>
                        </div>
                    </div>
                </div>

                <div class="glass-card" style="padding: 28px; border-radius: 20px; display: flex; flex-direction: column; justify-content: space-between; gap: 16px;">
                    <div style="font-size: 1.1rem; font-family: 'Outfit'; font-weight: 700; color: var(--purple-accent); border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 12px; letter-spacing: 1px;">
                        STUDENT EMOTION TELEMETRY AUDIT
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <div style="display: flex; justify-content: space-between; padding: 10px 14px; background: rgba(17,24,39,0.5); border-radius: 12px; border: 1px solid var(--card-glass-border); font-size: 0.9rem;">
                            <span style="color: var(--text-secondary);">Subject Identity</span>
                            <span style="color: #fff; font-weight: 600;">${this.identityState.currentUser || "Student"}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 10px 14px; background: rgba(17,24,39,0.5); border-radius: 12px; border: 1px solid var(--card-glass-border); font-size: 0.9rem;">
                            <span style="color: var(--text-secondary);">Stabilized Happiness Score</span>
                            <span style="color: ${moodColor}; font-weight: 700;">${happyScore}%</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 10px 14px; background: rgba(17,24,39,0.5); border-radius: 12px; border: 1px solid var(--card-glass-border); font-size: 0.9rem;">
                            <span style="color: var(--text-secondary);">Current Facial Emotion</span>
                            <span style="color: #fff; font-weight: 600;">${mood}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 10px 14px; background: rgba(17,24,39,0.5); border-radius: 12px; border: 1px solid var(--card-glass-border); font-size: 0.9rem;">
                            <span style="color: var(--text-secondary);">Plain Text Audit Log</span>
                            <span style="color: var(--success); font-weight: 600;">logs/activity_logs.txt</span>
                        </div>
                    </div>

                    <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(139,92,246,0.2); padding: 14px; border-radius: 14px; font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5;">
                        <span style="color: var(--purple-accent); font-weight: 700;">Biometric Neural Model:</span> Mediapipe 468-point mesh vectors evaluate smile elevation and temporal affect stability in real time.
                    </div>
                </div>
            </div>
        `;

        return container;
    },

    buildScheduleSection: function() {
        this.logFeatureUsage("SCHEDULE_VIEW", "Viewing Class Schedules & School Notice Board module");
        const container = document.createElement("div");
        container.className = "workspace-section-container" + (this.activeSectionChanged ? " morph-" + this.transitionDirection : "");

        if (typeof this.scheduleSubTab === "undefined") {
            this.scheduleSubTab = "student";
        }

        const schedData = this.studentScheduleState || {
            student_name: this.identityState.currentUser || "Student",
            student_id: "HS-2024-012",
            program: "BSc (Hons) Computer Science",
            section: "L3",
            schedule: []
        };

        const defaultSched = schedData.default_schedule || {
            student_name: "General Master Schedule (Section L3)",
            program: "BSc (Hons) Computer Science",
            section: "L3",
            schedule: []
        };

        const notices = schedData.school_notices || [];
        const activeTab = this.scheduleSubTab;

        let tableRowsHTML = "";
        const targetList = activeTab === "general" ? (defaultSched.schedule || []) : (schedData.schedule || []);
        
        if (targetList.length > 0) {
            targetList.forEach((item) => {
                const statusColor = item.status === "UPCOMING" ? "#3B82F6" : (item.status === "ACTIVE" ? "#10B981" : "#22D3EE");
                tableRowsHTML += `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.92rem;">
                        <td style="padding: 12px 10px; color: var(--primary-accent); font-weight: 700;">${item.day}</td>
                        <td style="padding: 12px 10px; color: #fff;"><span style="background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.25); padding: 3px 8px; border-radius: 6px; font-size: 0.82rem; font-weight: 600;">${item.time}</span></td>
                        <td style="padding: 12px 10px; color: #fff; font-weight: 600;">${item.subject}</td>
                        <td style="padding: 12px 10px; color: var(--text-secondary);"><span style="background: rgba(255,255,255,0.04); padding: 3px 8px; border-radius: 6px; font-size: 0.82rem;">${item.room}</span></td>
                        <td style="padding: 12px 10px; color: var(--text-secondary);">${item.instructor}</td>
                        <td style="padding: 12px 10px;"><span style="padding: 3px 8px; border-radius: 6px; font-size: 0.78rem; font-weight: 700; background: ${statusColor}20; color: ${statusColor}; border: 1px solid ${statusColor}40;">${item.status}</span></td>
                    </tr>
                `;
            });
        } else {
            tableRowsHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-secondary);">No schedule entries found.</td></tr>`;
        }

        let noticeGridHTML = "";
        notices.forEach((n) => {
            const badgeBg = n.priority === "HIGH" ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.15)";
            const badgeBorder = n.priority === "HIGH" ? "rgba(239,68,68,0.3)" : "rgba(59,130,246,0.3)";
            const badgeColor = n.priority === "HIGH" ? "#EF4444" : "#3B82F6";

            noticeGridHTML += `
                <div class="glass-card" style="padding: 18px; border-radius: 14px; border: 1px solid var(--card-glass-border); display: flex; flex-direction: column; justify-content: space-between; gap: 10px; background: rgba(17,24,39,0.5);">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="font-size: 0.7rem; padding: 2px 8px; border-radius: 6px; background: ${badgeBg}; border: 1px solid ${badgeBorder}; color: ${badgeColor}; font-weight: 700;">${n.tag}</span>
                            <span style="font-size: 0.75rem; color: var(--text-secondary);">${n.date}</span>
                        </div>
                        <div style="font-size: 1rem; font-weight: 600; color: #fff; line-height: 1.35; margin-bottom: 6px;">${n.title}</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.45;">${n.content}</div>
                    </div>
                </div>
            `;
        });

        const activeStudentStyle = activeTab === "student" ? "background: var(--primary-accent); color: #fff; font-weight: 700;" : "background: rgba(255,255,255,0.04); color: var(--text-secondary);";
        const activeGeneralStyle = activeTab === "general" ? "background: var(--primary-accent); color: #fff; font-weight: 700;" : "background: rgba(255,255,255,0.04); color: var(--text-secondary);";
        const activeNoticesStyle = activeTab === "notices" ? "background: var(--primary-accent); color: #fff; font-weight: 700;" : "background: rgba(255,255,255,0.04); color: var(--text-secondary);";

        const currentHeaderTitle = activeTab === "student" 
            ? `${schedData.student_name || "Student"} • ${schedData.section || "Section L3"}`
            : (activeTab === "general" ? "Section L3 Master Timetable" : "Campus Digital Notice Board");

        container.innerHTML = `
            <div class="schedule-dashboard-view" style="display: flex; flex-direction: column; gap: 16px; height: 100%;">
                <div class="schedule-header-card glass-card" style="padding: 16px 20px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                    <div>
                        <div style="font-size: 1.2rem; font-weight: 700; font-family: 'Outfit'; color: #fff;">${currentHeaderTitle}</div>
                        <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 2px;">University Section L3 Academic Timetable</div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="sched-tab-btn" data-tab="student" style="padding: 7px 14px; border-radius: 10px; border: none; font-size: 0.82rem; cursor: pointer; transition: all 0.2s ease; ${activeStudentStyle}">
                            Student Routine (☝️ 1 Finger)
                        </button>
                        <button class="sched-tab-btn" data-tab="general" style="padding: 7px 14px; border-radius: 10px; border: none; font-size: 0.82rem; cursor: pointer; transition: all 0.2s ease; ${activeGeneralStyle}">
                            Section L3 Timetable (✌️ 2 Fingers)
                        </button>
                        <button class="sched-tab-btn" data-tab="notices" style="padding: 7px 14px; border-radius: 10px; border: none; font-size: 0.82rem; cursor: pointer; transition: all 0.2s ease; ${activeNoticesStyle}">
                            Notices (${notices.length}) (🤟 3 Fingers)
                        </button>
                    </div>
                </div>

                <div class="schedule-table-card glass-card" style="padding: 20px; border-radius: 16px; flex: 1; display: flex; flex-direction: column; min-height: 0;">
                    ${activeTab !== "notices" ? `
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 12px; margin-bottom: 14px;">
                            <span style="font-size: 1rem; font-family: 'Outfit'; font-weight: 700; color: var(--success); display: flex; align-items: center; gap: 8px;">
                                ${ICONS.SCHEDULE} ${activeTab === "student" ? "Personalized Student Routine" : "Section L3 Timetable"}
                            </span>
                            <span style="font-size: 0.78rem; color: var(--text-secondary);">${targetList.length} Lectures Scheduled</span>
                        </div>
                        <div style="flex: 1; overflow-y: auto;">
                            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                                <thead>
                                    <tr style="color: var(--text-secondary); font-size: 0.75rem; letter-spacing: 1px; border-bottom: 1px solid rgba(255,255,255,0.08);">
                                        <th style="padding: 8px 10px;">DAY</th>
                                        <th style="padding: 8px 10px;">TIME SLOT</th>
                                        <th style="padding: 8px 10px;">SUBJECT / EVENT</th>
                                        <th style="padding: 8px 10px;">ROOM / LOCATION</th>
                                        <th style="padding: 8px 10px;">FACULTY / INSTRUCTOR</th>
                                        <th style="padding: 8px 10px;">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${tableRowsHTML}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 12px; margin-bottom: 14px;">
                            <span style="font-size: 1rem; font-family: 'Outfit'; font-weight: 700; color: var(--primary-accent); display: flex; align-items: center; gap: 8px;">
                                ${ICONS.NEWS} Campus Announcements
                            </span>
                            <span style="font-size: 0.78rem; color: var(--text-secondary);">${notices.length} Notices Active</span>
                        </div>
                        <div style="flex: 1; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; align-content: start;">
                            ${noticeGridHTML}
                        </div>
                    `}
                </div>
            </div>
        `;

        const self = this;
        container.querySelectorAll(".sched-tab-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                self.scheduleSubTab = btn.getAttribute("data-tab");
                self.updateDom();
            });
        });

        return container;
    }
});