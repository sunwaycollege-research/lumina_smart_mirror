// Exquisite Thin-Line Premium SVG Icon Database
const ICONS = {
    HOME: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:4px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
    CALENDAR: `<svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    SCHEDULE: `<svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    HEALTH: `<svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>`,
    NEWS: `<svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><line x1="16" y1="8" x2="18" y2="8"></line><line x1="16" y1="12" x2="18" y2="12"></line><line x1="16" y1="16" x2="18" y2="16"></line><line x1="6" y1="8" x2="12" y2="8"></line><line x1="6" y1="12" x2="12" y2="12"></line><line x1="6" y1="16" x2="12" y2="16"></line></svg>`,
    PROFILE: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    HEART: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    LOCATION: `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:4px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    TRENDS: `<svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
    SHIELD: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
    FINGERPRINT: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9"></path></svg>`,
    WIFI: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"></path></svg>`,
    SETTINGS: `<svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`
};

const LOGO_SVG = `<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" class="topbar-logo-icon"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg>`;
const SUN_ICON_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

Module.register("MMM-LuminaDashboard", {
    // Default system connection properties
    defaults: {
        websocketUrl: "ws://127.0.0.1:8000/ws/dashboard/stream",
        summaryApiUrl: "http://127.0.0.1:8000/api/dashboard/summary/Dawgy"
    },

    // Inject our premium graphite styling sheets
    getStyles: function() {
        return [
            "dashboard.css"
        ];
    },

    // Inject third-party library JS CDNs if any
    getScripts: function() {
        return [];
    },

    // Initialize state components safely on boot
    start: function() {
        this.biometricState = { 
            detected: false, 
            bpm: 72, 
            mood: "NEUTRAL", 
            anxiety: "LOW" 
        };
        this.gestureState = { 
            activeGesture: "NONE", 
            power_state: "WAKE" 
        };
        this.lastReceivedGesture = "NONE";
        this.identityState = { 
            currentUser: "Dawgy", 
            confidence: 98 
        };
        this.agendaState = [];
        this.newsState = [];
        this.systemStats = {
            cpu: 24.5,
            ram: 68.2
        };
        this.historicalSummary = null;
        this.summaryCache = {};
        this.lastSummaryFetch = {};
        
        // Navigation states:
        // -1: Landing Page Overview, 0: Calendar, 1: Schedule, 2: Health, 3: News, 4: Analytics, 5: Settings
        this.activeSection = -1; 
        this.landingSelectedIndex = 0; // Current selection index on landing page (0 - 5)
        this.lastActiveSection = -1;
        this.lastUser = null;
        this.lastAgendaStr = "";
        this.lastNewsStr = "";
        this.lastGestureTime = 0; // Time of last processed gesture to prevent double-triggering
        
        // Initialize rolling history of the last 12 heart rate values for the 5-second live graph
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

        // Boot connection daemons
        this.connectToCoreOSDaemon();
        this.fetchHistoricalSummary();
        this.fetchLiveNews();

        // Refresh news every 5 minutes
        const self = this;
        setInterval(() => { self.fetchLiveNews(); }, 300000);

        // Update landing page time dynamically every 1 second without full redrawing
        setInterval(() => { self.updateLandingPageClock(); }, 1000);

        // Capture a live biometric data point every 5 seconds for real-time graph
        setInterval(() => {
            if (self.biometricState) {
                const now = new Date();
                const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                
                let currentBpm = self.biometricState.bpm;
                if (currentBpm === "Calibrating..." || typeof currentBpm !== "number") {
                    currentBpm = 72.4;
                }
                
                self.liveHeartrateHistory.push({
                    time: timeStr,
                    bpm: currentBpm,
                    mood: self.biometricState.mood || "NEUTRAL",
                    anxiety: self.biometricState.anxiety || "LOW"
                });
                
                if (self.liveHeartrateHistory.length > 12) {
                    self.liveHeartrateHistory.shift();
                }
                
                // Force redraw if user is looking at the Health screen
                if (self.activeSection === 2) {
                    self.updateDom();
                }
            }
        }, 5000);

        // Global Keyboard Event Controller for 2x3 grid selection navigation
        this.keyboardBound = false;
        if (!this.keyboardBound) {
            this.keyboardBound = true;
            window.addEventListener("keydown", (e) => {
                let shouldUpdate = false;
                
                // If on Landing Page, navigate card selection 2x3 grid
                if (self.activeSection === -1) {
                    if (e.key === "ArrowLeft") {
                        self.landingSelectedIndex = (self.landingSelectedIndex - 1 + 6) % 6;
                        shouldUpdate = true;
                    } else if (e.key === "ArrowRight") {
                        self.landingSelectedIndex = (self.landingSelectedIndex + 1) % 6;
                        shouldUpdate = true;
                    } else if (e.key === "ArrowUp") {
                        self.landingSelectedIndex = (self.landingSelectedIndex - 3 + 6) % 6;
                        shouldUpdate = true;
                    } else if (e.key === "ArrowDown") {
                        self.landingSelectedIndex = (self.landingSelectedIndex + 3) % 6;
                        shouldUpdate = true;
                    } else if (e.key === "Enter") {
                        self.activeSection = self.landingSelectedIndex;
                        shouldUpdate = true;
                    }
                } else {
                    // Inside full-screen views, go back or cycle
                    if (e.key === "Escape" || e.key === "Backspace") {
                        self.activeSection = -1;
                        shouldUpdate = true;
                    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                        self.activeSection = (self.activeSection - 1 + 6) % 6;
                        shouldUpdate = true;
                    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                        self.activeSection = (self.activeSection + 1) % 6;
                        shouldUpdate = true;
                    }
                }

                // Numbers 1-6 map directly to sections 0-5
                if (e.key >= "1" && e.key <= "6") {
                    const targetIdx = parseInt(e.key) - 1;
                    self.activeSection = targetIdx;
                    self.landingSelectedIndex = targetIdx;
                    shouldUpdate = true;
                }

                if (shouldUpdate) {
                    self.updateDom();
                }
            });
        }
    },

    // Establishes WebSocket channel to python core
    connectToCoreOSDaemon: function() {
        const self = this;
        this.socket = new WebSocket(this.config.websocketUrl);

        this.socket.onmessage = function(event) {
            const payload = JSON.parse(event.data);
            let shouldUpdateDom = false;
            
            // Map live high-frequency biometrics
            if (payload.biometrics) {
                self.biometricState = payload.biometrics;
            }
            
            // Map active gesture inputs
            if (payload.gestures) {
                self.gestureState = payload.gestures;
                self.handleIncomingGesture(payload.gestures.activeGesture);
            }

            // Map CPU and Memory stats from system load
            if (payload.system_stats) {
                self.systemStats = payload.system_stats;
            }
            
            // Map live user identity
            if (payload.identity) {
                const prevUser = self.identityState.currentUser;
                self.identityState = payload.identity;
                
                // Greeting popup on change
                if (payload.identity.currentUser !== prevUser) {
                    if (payload.identity.currentUser !== "Searching..." && payload.identity.currentUser !== "Guest" && payload.identity.currentUser !== "") {
                        self.showGreetingPopup(payload.identity.currentUser);
                    }
                    self.fetchHistoricalSummary();
                    shouldUpdateDom = true;
                }
            }
            
            // Map calendar events
            if (payload.agenda && payload.agenda !== "CACHED_NOMINAL") {
                const agendaStr = JSON.stringify(payload.agenda);
                if (self.lastAgendaStr !== agendaStr) {
                    self.lastAgendaStr = agendaStr;
                    self.agendaState = payload.agenda;
                    if (self.activeSection === 0 || self.activeSection === 1 || self.activeSection === -1) {
                        shouldUpdateDom = true;
                    }
                }
            }

            // Map registration status dynamically to the DOM
            if (payload.registration) {
                const statusText = document.getElementById("reg-status-text");
                if (payload.registration.active) {
                    if (statusText) {
                        statusText.innerText = payload.registration.status_message;
                    }
                } else if (payload.registration.status_message !== "idle") {
                    if (statusText) {
                        statusText.innerText = payload.registration.status_message;
                        if (payload.registration.status_message.includes("successful")) {
                            self.summaryCache = {}; // clear cache
                        }
                    }
                }
            }
            
            // Update real-time DOM elements directly without triggering updateDom() to avoid flicker
            self.updateRealtimeFields(payload);

            // Rebuild container structure only when structural changes occur
            if (shouldUpdateDom || self.activeSection !== self.lastActiveSection) {
                self.lastActiveSection = self.activeSection;
                self.updateDom();
            }
        };

        this.socket.onclose = function() {
            setTimeout(() => { self.connectToCoreOSDaemon(); }, 5000);
        };
    },

    // Show verification greeting popup overlay with CSS transition
    showGreetingPopup: function(username) {
        let popup = document.querySelector(".lumina-greeting-popup");
        if (!popup) {
            popup = document.createElement("div");
            popup.className = "lumina-greeting-popup";
            document.body.appendChild(popup);
        }
        popup.innerHTML = `
            <div class="greeting-popup-content">
                <div class="greeting-popup-header">
                    <span class="greeting-pulse-dot"></span>
                    BIOMETRIC ACCESS GRANTED
                </div>
                <div class="greeting-popup-body">
                    HELLO, <span class="font-bold" style="color: var(--gold-accent);">${username.toUpperCase()}</span>
                </div>
                <div class="greeting-popup-footer">
                    Welcome back. Loading your personalized Lumina workspace environment.
                </div>
            </div>
        `;
        void popup.offsetWidth;
        popup.classList.add("active");
        setTimeout(() => {
            popup.classList.remove("active");
        }, 4500);
    },

    // Updates high-frequency elements in-place on the DOM to prevent screen flickering
    updateRealtimeFields: function(payload) {
        const wrapper = document.querySelector(".lumina-dashboard-wrapper");
        if (!wrapper) return;

        // 1. Update Left Column Status table
        if (this.activeSection === -1) {
            const userNameVal = wrapper.querySelector(".status-username-val");
            if (userNameVal && payload.identity) {
                userNameVal.innerText = payload.identity.currentUser;
            }

            const heartVal = wrapper.querySelector(".status-heart-val");
            if (heartVal && payload.biometrics) {
                let heartDisplay = payload.biometrics.bpm;
                if (typeof heartDisplay === "number") {
                    heartDisplay = `${Math.round(heartDisplay)} BPM`;
                }
                heartVal.innerText = heartDisplay;
            }
            
            const gestureVal = wrapper.querySelector(".status-gesture-val");
            if (gestureVal && payload.gestures) {
                gestureVal.innerText = payload.gestures.activeGesture === "NONE" ? "READY" : payload.gestures.activeGesture;
            }
        }

        // 2. Update Health tab if active
        if (this.activeSection === 2) {
            let heartDisplay = payload.biometrics ? payload.biometrics.bpm : 72;
            if (typeof heartDisplay === "number") {
                heartDisplay = `${Math.round(heartDisplay)} BPM`;
            }
            const pulseVal = wrapper.querySelector(".pulse-bpm-val");
            if (pulseVal) pulseVal.innerText = heartDisplay;

            const subMetricVals = wrapper.querySelectorAll(".health-sub-metric .sub-metric-val");
            if (subMetricVals.length >= 2 && payload.biometrics) {
                subMetricVals[0].innerText = payload.biometrics.mood;
                subMetricVals[1].innerText = payload.biometrics.anxiety;
                if (payload.biometrics.anxiety === "HIGH") {
                    subMetricVals[1].className = "sub-metric-val";
                    subMetricVals[1].style.color = "#ef4444";
                } else {
                    subMetricVals[1].className = "sub-metric-val";
                    subMetricVals[1].style.color = "#3b82f6";
                }
            }
        }

        // 3. Update Status Bar system performance stats
        if (payload.system_stats) {
            const cpuVal = wrapper.querySelector(".val-cpu");
            if (cpuVal) cpuVal.innerText = `${payload.system_stats.cpu}%`;
            const ramVal = wrapper.querySelector(".val-ram");
            if (ramVal) ramVal.innerText = `${payload.system_stats.ram}%`;
        }

        // 4. Update Status Bar Heart rate
        if (payload.biometrics) {
            const barHeart = wrapper.querySelector(".val-heart-bar");
            if (barHeart) {
                let heartDisplay = payload.biometrics.bpm;
                if (typeof heartDisplay === "number") {
                    heartDisplay = `${Math.round(heartDisplay)} BPM`;
                }
                barHeart.innerText = heartDisplay;
            }
        }
    },

    // Clock and Date live updates
    updateLandingPageClock: function() {
        const timeEl = document.querySelector(".digital-clock");
        const dateEl = document.querySelector(".current-date");
        const greetingEl = document.querySelector(".greeting-text");
        
        if (timeEl || dateEl || greetingEl) {
            const now = new Date();
            if (timeEl) {
                let hours = now.getHours();
                const minutes = String(now.getMinutes()).padStart(2, "0");
                const ampm = hours >= 12 ? "PM" : "AM";
                hours = hours % 12;
                hours = hours ? hours : 12;
                timeEl.innerHTML = `${String(hours).padStart(2, "0")}:${minutes} <span class="ampm">${ampm}</span>`;
            }
            if (dateEl) {
                const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
                dateEl.innerHTML = now.toLocaleDateString('en-US', options);
            }
            if (greetingEl) {
                const hour = now.getHours();
                let greeting = "Good Morning";
                if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
                else if (hour >= 17) greeting = "Good Evening";
                
                const username = this.identityState.currentUser && this.identityState.currentUser !== "Searching..." && this.identityState.currentUser !== "Guest" ? this.identityState.currentUser : "Dawgy";
                greetingEl.innerText = `${greeting}, ${username}`;
            }
        }
    },

    // Fetches user profile analytics
    fetchHistoricalSummary: function() {
        const username = this.identityState.currentUser && this.identityState.currentUser !== "Searching..." && this.identityState.currentUser !== "Guest" ? this.identityState.currentUser : "Dawgy";
        
        const now = Date.now();
        if (!this.summaryCache) this.summaryCache = {};
        if (!this.lastSummaryFetch) this.lastSummaryFetch = {};
        
        if (this.summaryCache[username] && (now - (this.lastSummaryFetch[username] || 0) < 30000)) {
            this.historicalSummary = this.summaryCache[username];
            if (this.activeSection === 4 || this.activeSection === 2) {
                this.updateDom();
            }
            return;
        }

        const url = `http://127.0.0.1:8000/api/dashboard/summary/${username}`;
        const self = this;
        fetch(url)
            .then(res => res.json())
            .then(data => {
                self.summaryCache[username] = data;
                self.lastSummaryFetch[username] = Date.now();
                self.historicalSummary = data;
                if (self.activeSection === 4 || self.activeSection === 2) {
                    self.updateDom();
                }
            })
            .catch(err => console.error("[LUMINA FRONTEND ERROR] Summary syncing dropped:", err));
    },

    // Fetches live news feed
    fetchLiveNews: function() {
        fetch("http://127.0.0.1:8000/api/dashboard/news")
            .then(res => res.json())
            .then(data => {
                const newsStr = JSON.stringify(data);
                if (this.lastNewsStr !== newsStr) {
                    this.lastNewsStr = newsStr;
                    this.newsState = data;
                    if (this.activeSection === 3 || this.activeSection === -1) {
                        this.updateDom();
                    }
                }
            })
            .catch(err => console.error("[LUMINA FRONTEND ERROR] News fetching failed:", err));
    },

    handleIncomingGesture: function(gesture) {
        if (!gesture || gesture === "NONE") {
            this.lastReceivedGesture = "NONE";
            return;
        }

        // Avoid triggering the exact same gesture multiple times in a row
        if (gesture === this.lastReceivedGesture) {
            return;
        }

        const now = Date.now();
        // Cooldown of 600ms between any two active gesture actions to prevent flickering and double triggers
        if (now - this.lastGestureTime < 600) {
            return;
        }

        this.lastReceivedGesture = gesture;
        this.lastGestureTime = now;

        console.log(`[LUMINA HUD ACTION] Gesture received: ${gesture}`);
        
        // Log to terminal stdout through the MagicMirror node helper
        this.sendSocketNotification("LOG_GESTURE", gesture);

        let shouldUpdate = false;
        
        // Closed Fist or Thumbs Up maps to "Go Back" / Home
        if (gesture === "CLOSED_FIST" || gesture === "THUMBS_UP") {
            this.activeSection = -1;
            shouldUpdate = true;
        } else if (this.activeSection === -1) {
            // Swipe Left / Right / Up / Down moves selection between cards
            if (gesture === "SWIPE_LEFT") {
                this.landingSelectedIndex = (this.landingSelectedIndex - 1 + 6) % 6;
                shouldUpdate = true;
            } else if (gesture === "SWIPE_RIGHT") {
                this.landingSelectedIndex = (this.landingSelectedIndex + 1) % 6;
                shouldUpdate = true;
            } else if (gesture === "SWIPE_UP") {
                this.landingSelectedIndex = (this.landingSelectedIndex - 3 + 6) % 6;
                shouldUpdate = true;
            } else if (gesture === "SWIPE_DOWN") {
                this.landingSelectedIndex = (this.landingSelectedIndex + 3) % 6;
                shouldUpdate = true;
            } else if (gesture === "OPEN_PALM" || gesture === "FIVE_FINGERS") {
                this.activeSection = this.landingSelectedIndex;
                shouldUpdate = true;
            } else if (gesture === "ONE_FINGER" || gesture === "POINT") {
                console.log("[LUMINA HUD ACTION] Point Gesture: Scroll action activated");
            }
        } else {
            // Fullscreen scrolling or cycling gestures
            if (gesture === "SWIPE_LEFT" || gesture === "SWIPE_UP") {
                this.activeSection = (this.activeSection - 1 + 6) % 6;
                shouldUpdate = true;
            } else if (gesture === "SWIPE_RIGHT" || gesture === "SWIPE_DOWN") {
                this.activeSection = (this.activeSection + 1) % 6;
                shouldUpdate = true;
            }
        }
        
        if (shouldUpdate) {
            this.updateDom();
        }
    },

    // Dynamic rendering generator
    getDom: function() {
        const self = this;

        // Eco Sleep shroud cover
        if (this.gestureState.power_state === "SLEEP") {
            const sleepScreen = document.createElement("div");
            sleepScreen.className = "lumina-sleep-shroud-cover";
            sleepScreen.innerHTML = `<div class="sleep-eco-msg">SYSTEM DEEP POWER CONSERVATION STATE ACTIVE</div>`;
            return sleepScreen;
        }

        // Main Wrapper
        const rootContainer = document.createElement("div");
        rootContainer.className = "lumina-dashboard-wrapper";

        const menuItems = [
            { id: 0, label: "CALENDAR", icon: ICONS.CALENDAR },
            { id: 1, label: "SCHEDULE", icon: ICONS.SCHEDULE },
            { id: 2, label: "HEALTH MONITOR", icon: ICONS.HEALTH },
            { id: 3, label: "LIVE NEWS", icon: ICONS.NEWS },
            { id: 4, label: "ANALYTICS", icon: ICONS.TRENDS },
            { id: 5, label: "SETTINGS", icon: ICONS.SETTINGS }
        ];

        // Header bar rendering (Fullscreen zoom mode vs Overview)
        if (this.activeSection !== -1) {
            const topBar = document.createElement("div");
            topBar.className = "lumina-fullscreen-topbar";
            
            const currentItem = menuItems.find(i => i.id === this.activeSection);
            
            topBar.innerHTML = `
                <button class="topbar-back-btn">${ICONS.HOME} HOME</button>
                <span class="topbar-title">${currentItem ? currentItem.label : "VIEW"}</span>
                <span class="topbar-gesture-hint">CLOSED FIST to exit | Swipe to cycle</span>
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
                        <span class="topbar-logo-subtitle">SMART MIRROR OS</span>
                    </div>
                </div>
                <div class="topbar-settings-side">
                    <button class="topbar-brightness-toggle">${SUN_ICON_SVG}</button>
                </div>
            `;
            rootContainer.appendChild(topBar);
        }

        // Main body content
        const workspaceBody = document.createElement("div");
        workspaceBody.className = "lumina-workspace-body";

        switch(this.activeSection) {
            case -1: // Overview main columns
                workspaceBody.appendChild(this.buildLandingPageSection());
                break;
            case 0:
                workspaceBody.appendChild(this.buildCalendarSection());
                break;
            case 1:
                workspaceBody.appendChild(this.buildScheduleSection());
                break;
            case 2:
                workspaceBody.appendChild(this.buildHealthSection());
                break;
            case 3:
                workspaceBody.appendChild(this.buildNewsSection());
                break;
            case 4:
                workspaceBody.appendChild(this.buildAnalyticsSection());
                break;
            case 5:
                workspaceBody.appendChild(this.buildSettingsSection());
                break;
        }
        rootContainer.appendChild(workspaceBody);

        // Persistent bottom status bar
        const statusBar = document.createElement("div");
        statusBar.className = "lumina-status-bar";
        
        const currentBreakingNews = this.newsState.length > 0 ? this.newsState[0].title : "System nominal. Biometric modules verified.";

        statusBar.innerHTML = `
            <div class="status-bar-left">
                <span class="status-stat"><span class="icon">☀️</span> 26°C, Mostly Cloudy</span>
                <span class="status-stat"><span class="icon">📶</span> Connected (192.168.1.25)</span>
                <span class="status-stat"><span class="icon">💻</span> CPU <span class="val-cpu">${this.systemStats.cpu}%</span></span>
                <span class="status-stat"><span class="icon">💾</span> RAM <span class="val-ram">${this.systemStats.ram}%</span></span>
                <span class="status-stat"><span class="icon">🌐</span> Asia/Kathmandu (UTC +05:45)</span>
                <span class="status-stat"><span class="icon">❤️</span> <span class="val-heart-bar">${typeof this.biometricState.bpm === 'number' ? Math.round(this.biometricState.bpm) : 72} BPM</span></span>
                <span class="status-stat"><span class="icon">🔔</span> <span class="val-notifs">0</span></span>
            </div>
            <div class="bottom-breaking-news">
                <span class="breaking-badge">Breaking</span>
                <div class="breaking-marquee-container">
                    <span class="breaking-headline">${currentBreakingNews}  •  Lumina Dashboard System Core v2.36 Nominal.</span>
                </div>
            </div>
        `;
        rootContainer.appendChild(statusBar);

        return rootContainer;
    },

    // Builder for LANDING PAGE Tab (Sleek 3-column layout)
    buildLandingPageSection: function() {
        const container = document.createElement("div");
        container.className = "workspace-section-container animated-fade-in";

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

        const username = this.identityState.currentUser && this.identityState.currentUser !== "Searching..." && this.identityState.currentUser !== "Guest" ? this.identityState.currentUser : "Dawgy";
        let heartDisplay = this.biometricState.bpm;
        if (typeof heartDisplay === "number") {
            heartDisplay = `${Math.round(heartDisplay)} BPM`;
        } else {
            heartDisplay = "72.6 BPM";
        }

        const menuItems = [
            { id: 0, label: "CALENDAR", icon: ICONS.CALENDAR, desc: "Monthly overview and important dates" },
            { id: 1, label: "SCHEDULE", icon: ICONS.SCHEDULE, desc: "Sync timelines and meeting board" },
            { id: 2, label: "HEALTH MONITOR", icon: ICONS.HEALTH, desc: "Live physiological rPPG sensors" },
            { id: 3, label: "LIVE NEWS", icon: ICONS.NEWS, desc: "Top global headlines and RSS feeds" },
            { id: 4, label: "ANALYTICS", icon: ICONS.TRENDS, desc: "Insights and performance trends" },
            { id: 5, label: "SETTINGS", icon: ICONS.SETTINGS, desc: "Configure system options and face scans" }
        ];

        let menuGridHTML = "";
        menuItems.forEach((item, index) => {
            const isSelected = index === this.landingSelectedIndex ? "selected" : "";
            menuGridHTML += `
                <div class="grid-card ${isSelected}" data-index="${index}">
                    <div class="grid-card-icon-wrap">
                        ${item.icon}
                    </div>
                    <div class="grid-card-title">${item.label}</div>
                    <div class="grid-card-desc">${item.desc}</div>
                    <button class="grid-card-arrow">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>
            `;
        });

        // News item for left column
        const newsTitle = this.newsState.length > 0 ? this.newsState[0].title : "Global Markets Rally as Tech Stocks Lead";
        const newsSnippet = this.newsState.length > 0 ? this.newsState[0].description : "Markets rise on strong earnings and AI optimism.";
        const newsPub = this.newsState.length > 0 ? this.newsState[0].pubDate : "2h ago";

        // Vertical schedule items for left column
        const defaultEvents = [
            { time: "09:00 AM", title: "Team Stand-up", desc: "Daily sync meeting", duration: "30m", dot: "blue" },
            { time: "10:30 AM", title: "Project Review", desc: "Q3 progress review", duration: "60m", dot: "green" },
            { time: "01:00 PM", title: "Lunch Break", desc: "Take a break", duration: "60m", dot: "orange" },
            { time: "02:30 PM", title: "Client Presentation", desc: "Lumina Project Update", duration: "45m", dot: "purple" },
            { time: "04:00 PM", title: "Strategy Planning", desc: "Roadmap discussion", duration: "60m", dot: "blue" }
        ];

        let timelineHTML = `<div class="timeline-container"><div class="timeline-line"></div>`;
        const events = (this.agendaState && this.agendaState.length > 0) ? this.agendaState.map((evt, idx) => ({
            time: evt.start,
            title: evt.title,
            desc: evt.location,
            duration: evt.priority === "HIGH" ? "60m" : "30m",
            dot: ["blue", "green", "orange", "purple"][idx % 4]
        })) : defaultEvents;

        events.slice(0, 3).forEach(evt => {
            timelineHTML += `
                <div class="timeline-item">
                    <div class="timeline-dot ${evt.dot}"></div>
                    <div class="timeline-time">${evt.time}</div>
                    <div class="timeline-content">
                        <span class="timeline-title">${evt.title}</span>
                    </div>
                    <div class="timeline-duration">${evt.duration}</div>
                </div>
            `;
        });
        timelineHTML += `</div>`;

        const quotes = [
            { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { text: "Act as if what you do makes a difference. It does.", author: "William James" },
            { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
            { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
            { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
            { text: "Simplify, then add lightness.", author: "Colin Chapman" },
            { text: "The best way to predict the future is to invent it.", author: "Alan Kay" }
        ];
        const dailyQuote = quotes[now.getDay() % quotes.length];

        container.innerHTML = `
            <div class="landing-page-layout">
                <!-- Left Column: Clock, Upcoming Schedule, and System Status -->
                <div class="landing-left-column">
                    <div class="clock-greeting-container">
                        <div class="digital-clock">${timeString}</div>
                        <div class="current-date">${dateString}</div>
                        <div class="greeting-text">${greetText}, ${username}</div>
                    </div>

                    <div class="glass-card clickable-sidebar-card" id="upcoming-schedule-card">
                        <div class="card-header-row">
                            <span class="card-title-gold">${ICONS.CALENDAR} Upcoming Schedule</span>
                        </div>
                        ${timelineHTML}
                    </div>
                    
                    <div class="glass-card">
                        <div class="card-header-row">
                            <span class="card-title-gold">System Status</span>
                        </div>
                        <table class="status-table">
                            <tr>
                                <td class="lbl-side">${ICONS.PROFILE} Biometric Scanner</td>
                                <td class="val-side status-username-val">${this.identityState.currentUser} <span class="status-dot green"></span></td>
                            </tr>
                            <tr>
                                <td class="lbl-side">${ICONS.HEALTH} Heart Rate</td>
                                <td class="val-side status-heart-val">${heartDisplay} <span class="status-dot red"></span></td>
                            </tr>
                            <tr>
                                <td class="lbl-side">${ICONS.HOME} Gesture Engine</td>
                                <td class="val-side status-gesture-val">READY <span class="status-dot blue"></span></td>
                            </tr>
                            <tr>
                                <td class="lbl-side">${ICONS.PROFILE} Face Recognition</td>
                                <td class="val-side val-user">${this.identityState.currentUser} <span class="status-dot green"></span></td>
                            </tr>
                            <tr>
                                <td class="lbl-side">${ICONS.SHIELD} Security Status</td>
                                <td class="val-side" style="color: #10b981;">SECURE <span class="status-dot green"></span></td>
                            </tr>
                        </table>
                    </div>

                    <div class="glass-card news-card-body" id="latest-news-card">
                        <div class="news-thumbnail">
                            <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="1.5" fill="none" style="margin: 19px; color: var(--text-muted);"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path></svg>
                        </div>
                        <div class="news-text-box">
                            <div class="news-headline">${newsTitle}</div>
                            <div class="news-time">${newsPub}</div>
                        </div>
                    </div>
                </div>

                <!-- Middle Column: Card Selection Grid -->
                <div class="landing-center-column">
                    <div class="middle-grid">
                        ${menuGridHTML}
                    </div>
                </div>

                <!-- Right Column: Daily Overview & Quotes -->
                <div class="landing-right-column">
                    <div class="daily-overview-container glass-card">
                        <div class="overview-header">Daily Overview</div>
                        
                        <!-- Weather Section -->
                        <div class="overview-section">
                            <div class="section-subtitle">Weather</div>
                            <div class="weather-grid">
                                <div class="weather-temp">26°C</div>
                                <div class="weather-details">
                                    <div>Humidity: 65%</div>
                                    <div>Air Quality: Good</div>
                                </div>
                            </div>
                        </div>

                        <!-- Today's Focus Section -->
                        <div class="overview-section">
                            <div class="section-subtitle">Today's Focus</div>
                            <div class="focus-task">Product Strategy Review</div>
                            <div class="countdown-timer">Starts in 42 mins</div>
                        </div>

                        <!-- Productivity Stats Section -->
                        <div class="overview-section">
                            <div class="section-subtitle">Productivity Stats</div>
                            <div class="stats-grid">
                                <div class="stat-box"><span class="stat-val">8</span><span class="stat-lbl">Completed</span></div>
                                <div class="stat-box"><span class="stat-val">4</span><span class="stat-lbl">Meetings</span></div>
                                <div class="stat-box"><span class="stat-val">3.5h</span><span class="stat-lbl">Focus Time</span></div>
                            </div>
                        </div>

                        <!-- Motivational Quote Section -->
                        <div class="overview-section quote-section">
                            <p class="quote-text">"${dailyQuote.text}"</p>
                            <span class="quote-author">— ${dailyQuote.author}</span>
                        </div>
                    </div>
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

        const scheduleCard = container.querySelector("#upcoming-schedule-card");
        if (scheduleCard) {
            scheduleCard.addEventListener("click", () => {
                self.activeSection = 1;
                self.updateDom();
            });
        }

        const newsCard = container.querySelector("#latest-news-card");
        if (newsCard) {
            newsCard.addEventListener("click", () => {
                self.activeSection = 3;
                self.updateDom();
            });
        }

        return container;
    },

    // Builder for CALENDAR Tab (Sleek CSS monthly grid calendar + agenda split view)
    buildCalendarSection: function() {
        const container = document.createElement("div");
        container.className = "workspace-section-container animated-fade-in";
        container.style.display = "flex";
        container.style.flexDirection = "row";
        container.style.gap = "30px";
        container.style.height = "100%";
        container.style.width = "100%";

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const todayDate = now.getDate();

        const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
        const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

        const firstDayOfWeek = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // 1. Generate Left side: Monthly Grid
        let leftHTML = `
            <div class="calendar-left-pane" style="flex: 1.3; display: flex; flex-direction: column; min-height: 0;">
                <div class="calendar-header-box" style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                    <span class="calendar-month-title" style="font-size: 1.8rem; font-weight: 600; letter-spacing: 1px; color: var(--gold-accent);">${monthNames[month]} ${year}</span>
                    <span class="calendar-system-time" style="font-size: 1rem; opacity: 0.8; font-family: 'Outfit';">${now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div class="calendar-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; padding: 20px; background: rgba(0, 0, 0, 0.2); border: 1px solid var(--card-glass-border); border-radius: 20px; flex: 1; align-content: center;">
        `;

        weekdays.forEach(day => {
            leftHTML += `<div class="calendar-day-label" style="text-align: center; font-size: 0.9rem; font-weight: 600; color: var(--gold-accent); letter-spacing: 1px; padding-bottom: 8px;">${day}</div>`;
        });

        for (let i = 0; i < firstDayOfWeek; i++) {
            leftHTML += `<div class="calendar-day-cell empty" style="opacity: 0.1;"></div>`;
        }

        // Gather all event dates for this month
        const eventDatesMap = {};
        if (this.agendaState && Array.isArray(this.agendaState)) {
            this.agendaState.forEach(evt => {
                if (evt.start) {
                    const parts = evt.start.split("-");
                    if (parts.length === 3) {
                        const evYear = parseInt(parts[0], 10);
                        const evMonth = parseInt(parts[1], 10) - 1; // 0-indexed
                        const evDay = parseInt(parts[2], 10);
                        if (evYear === year && evMonth === month) {
                            if (!eventDatesMap[evDay]) {
                                eventDatesMap[evDay] = [];
                            }
                            eventDatesMap[evDay].push(evt);
                        }
                    }
                }
            });
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === todayDate ? "today-cell" : "";
            const hasEvents = eventDatesMap[day] ? "has-events" : "";
            
            leftHTML += `
                <div class="calendar-day-cell ${isToday} ${hasEvents}" style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 58px; border-radius: 12px; font-size: 1.1rem; color: #fff; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.04);">
                    <span class="day-number" style="font-weight: ${day === todayDate ? '700' : '400'};">${day}</span>
            `;
            
            if (eventDatesMap[day]) {
                leftHTML += `<span class="calendar-event-dot" style="display: block; width: 6px; height: 6px; background: var(--gold-accent); border-radius: 50%; margin-top: 4px; position: absolute; bottom: 6px;"></span>`;
            }
            
            leftHTML += `</div>`;
        }

        leftHTML += `
                </div>
            </div>
        `;

        // 2. Generate Right side: Detailed event preview pane
        let rightHTML = `
            <div class="calendar-right-pane" style="flex: 1; display: flex; flex-direction: column; background: var(--card-glass-bg); border: 1px solid var(--card-glass-border); border-radius: 24px; padding: 24px; min-height: 0;">
                <div style="border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 12px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                    <span style="color: var(--gold-accent); display: flex;">${ICONS.SCHEDULE}</span>
                    <span style="font-family: 'Outfit'; font-size: 18px; font-weight: 500; letter-spacing: 1px; color: #fff; text-transform: uppercase;">Month Agenda</span>
                </div>
                <div class="calendar-events-list" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding-right: 4px;">
        `;

        let monthlyEventsCount = 0;
        if (this.agendaState && this.agendaState.length > 0) {
            this.agendaState.forEach(evt => {
                let showEv = true;
                if (evt.start) {
                    const parts = evt.start.split("-");
                    if (parts.length === 3) {
                        const evYear = parseInt(parts[0], 10);
                        const evMonth = parseInt(parts[1], 10) - 1;
                        if (evYear !== year || evMonth !== month) {
                            showEv = false;
                        }
                    }
                }
                if (showEv) {
                    monthlyEventsCount++;
                    const badgeClass = evt.priority === "HIGH" ? "priority-tag-high" : "priority-tag-low";
                    rightHTML += `
                        <div class="calendar-event-row interactive-row" style="padding: 14px 18px; display: flex; flex-direction: column; gap: 8px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 14px; font-weight: 500; color: var(--gold-accent); background: rgba(212,175,55,0.08); padding: 3px 8px; border-radius: 6px; font-family: 'Outfit';">${evt.start}</span>
                                <span class="${badgeClass}" style="font-size: 12px; padding: 2px 8px;">${evt.priority}</span>
                            </div>
                            <span style="font-size: 17px; font-weight: 500; color: #fff; line-height: 1.3;">${evt.title}</span>
                            <span style="font-size: 15px; color: var(--text-muted); display: flex; align-items: center; gap: 4px;">${ICONS.LOCATION} ${evt.location}</span>
                        </div>
                    `;
                }
            });
        }

        if (monthlyEventsCount === 0) {
            rightHTML += `
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; opacity: 0.5; padding: 20px; text-align: center;">
                    <span style="font-size: 2rem; margin-bottom: 12px;">📅</span>
                    <span style="font-size: 16px; font-family: 'Inter';">No events scheduled for this month.</span>
                </div>
            `;
        }

        rightHTML += `
                </div>
            </div>
        `;

        container.innerHTML = leftHTML + rightHTML;
        return container;
    },

    // Builder for SCHEDULE Tab (Detailed timeline of agenda tasks)
    buildScheduleSection: function() {
        const container = document.createElement("div");
        container.className = "workspace-section-container animated-fade-in";

        let agendaListHTML = "";
        if (this.agendaState && this.agendaState.length > 0) {
            this.agendaState.forEach(evt => {
                const badgeClass = evt.priority === "HIGH" ? "priority-tag-high" : "priority-tag-low";
                agendaListHTML += `
                    <div class="agenda-item-row interactive-row" style="padding: 20px 24px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
                        <div style="display: flex; align-items: center;">
                            <span style="font-size: 15px; padding: 6px 12px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--card-glass-border); border-radius: 8px; color: var(--gold-accent);">${evt.start}</span>
                            <div style="margin-left: 24px; display: flex; flex-direction: column; gap: 4px;">
                                <span style="font-size: 18px; font-weight: 500; color: #fff;">${evt.title}</span>
                                <span style="font-size: 15px; color: var(--text-muted); display: flex; align-items: center; gap: 4px;">${ICONS.LOCATION} ${evt.location}</span>
                            </div>
                        </div>
                        <div>
                            <span class="${badgeClass}" style="font-size: 13px; padding: 4px 12px;">${evt.priority}</span>
                        </div>
                    </div>
                `;
            });
        } else {
            agendaListHTML = `
                <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 200px; opacity: 0.5;">
                    <span style="font-size: 2rem; margin-bottom: 12px;">⏳</span>
                    <span style="font-size: 16px;">Syncing active meeting board...</span>
                </div>`;
        }

        container.innerHTML = `
            <div class="section-title" style="font-size: 1.5rem; margin-bottom: 24px; letter-spacing: 1px; font-family: 'Outfit'; color: var(--gold-accent);">${ICONS.CALENDAR} SYSTEM SMART MEETING BOARD</div>
            <div class="agenda-list-wrapper scrollable-container">${agendaListHTML}</div>
        `;
        return container;
    },

    // Builder for HEALTH Tab
    buildHealthSection: function() {
        const container = document.createElement("div");
        container.className = "workspace-section-container animated-fade-in";

        let heartDisplay = this.biometricState.bpm;
        if (typeof heartDisplay === "number") {
            heartDisplay = `${Math.round(heartDisplay)} BPM`;
        } else {
            heartDisplay = "72 BPM";
        }

        let historyRowsHTML = "";
        if (this.historicalSummary && this.historicalSummary.timeline) {
            this.historicalSummary.timeline.slice(0, 5).forEach(row => {
                let formattedTime = "System Time";
                try {
                    formattedTime = new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } catch(e) {}
                
                historyRowsHTML += `
                    <tr class="history-table-row">
                        <td style="font-size: 15px; padding: 12px 8px; color:#ffffff;">${formattedTime}</td>
                        <td style="font-size: 15px; padding: 12px 8px; color: var(--gold-accent); font-weight: 500;">${row.heart_rate} BPM</td>
                        <td style="font-size: 15px; padding: 12px 8px; color: #fff;">${row.mood}</td>
                        <td style="font-size: 15px; padding: 12px 8px; color: ${row.anxiety === 'HIGH' || row.anxiety_level === 'HIGH' ? '#ef4444' : '#10b981'};">${row.anxiety || row.anxiety_level || 'LOW'}</td>
                    </tr>
                `;
            });
        } else {
            historyRowsHTML = `<tr><td colspan="4" style="font-size: 15px; padding: 20px; text-align:center; color: var(--text-muted);">No historical points logged.</td></tr>`;
        }

        let svgGraph = "";
        if (this.liveHeartrateHistory && this.liveHeartrateHistory.length > 0) {
            const timeline = this.liveHeartrateHistory;
            const width = 450;
            const height = 180;
            const paddingLeft = 40;
            const paddingRight = 20;
            const paddingTop = 25;
            const paddingBottom = 30;

            const chartWidth = width - paddingLeft - paddingRight;
            const chartHeight = height - paddingTop - paddingBottom;

            const hrPoints = [];
            const moodPoints = [];
            const anxietyPoints = [];

            timeline.forEach((pt, idx) => {
                const x = paddingLeft + (idx / Math.max(1, timeline.length - 1)) * chartWidth;
                const hr = Math.max(50, Math.min(100, pt.bpm || 72));
                const y_hr = height - paddingBottom - ((hr - 50) / 50) * chartHeight;
                hrPoints.push(`${x},${y_hr}`);

                let moodVal = 1;
                if (pt.mood === "HAPPY") moodVal = 2;
                else if (pt.mood === "SAD" || pt.mood === "ANGRY" || pt.mood === "STRESSED") moodVal = 0;
                const y_mood = height - paddingBottom - (moodVal / 2) * chartHeight;
                moodPoints.push(`${x},${y_mood}`);

                let anxVal = 0;
                const anxStr = (pt.anxiety || "LOW").toUpperCase();
                if (anxStr === "HIGH") anxVal = 2;
                else if (anxStr === "MEDIUM") anxVal = 1;
                const y_anxiety = height - paddingBottom - (anxVal / 2) * chartHeight;
                anxietyPoints.push(`${x},${y_anxiety}`);
            });

            const hrPath = hrPoints.length > 1 ? `M ${hrPoints.join(" L ")}` : `M ${paddingLeft},${height - paddingBottom} L ${width - paddingRight},${height - paddingBottom}`;
            const moodPath = moodPoints.length > 1 ? `M ${moodPoints.join(" L ")}` : `M ${paddingLeft},${height - paddingBottom} L ${width - paddingRight},${height - paddingBottom}`;
            const anxietyPath = anxietyPoints.length > 1 ? `M ${anxietyPoints.join(" L ")}` : `M ${paddingLeft},${height - paddingBottom} L ${width - paddingRight},${height - paddingBottom}`;

            const gridLines = [];
            for (let i = 0; i <= 4; i++) {
                const y = paddingTop + (i / 4) * chartHeight;
                gridLines.push(`<line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="rgba(255, 255, 255, 0.04)" stroke-width="1" />`);
            }

            svgGraph = `
                <div class="biometric-trend-chart-container" style="background: rgba(255,255,255,0.01); border: 1px solid var(--card-glass-border); border-radius: 20px; padding: 20px; display: flex; flex-direction: column;">
                    <span style="font-size: 15px; letter-spacing: 1px; margin-bottom: 16px; color: var(--gold-accent); font-family: 'Outfit';">${ICONS.TRENDS} RPPG BIOMETRIC MONITOR (5S INTERVALS)</span>
                    <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 160px; overflow: visible;">
                        ${gridLines.join("")}
                        <text x="${paddingLeft - 8}" y="${paddingTop + 4}" fill="rgba(255,255,255,0.3)" font-size="9" text-anchor="end">100 BPM</text>
                        <text x="${paddingLeft - 8}" y="${height - paddingBottom + 4}" fill="rgba(255,255,255,0.3)" font-size="9" text-anchor="end">50 BPM</text>
                        <path d="${hrPath}" fill="none" stroke="var(--gold-accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="${moodPath}" fill="none" stroke="#f59e0b" stroke-width="2.0" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="4 4" />
                        <path d="${anxietyPath}" fill="none" stroke="#ea580c" stroke-width="2.0" stroke-linecap="round" stroke-linejoin="round" />
                        ${timeline.map((pt, idx) => {
                            const x = paddingLeft + (idx / Math.max(1, timeline.length - 1)) * chartWidth;
                            const hr = Math.max(50, Math.min(100, pt.bpm || 72));
                            const y_hr = height - paddingBottom - ((hr - 50) / 50) * chartHeight;
                            return `<circle cx="${x}" cy="${y_hr}" r="4" fill="#0C0E12" stroke="var(--gold-accent)" stroke-width="2" />`;
                        }).join("")}
                    </svg>
                    <div style="display: flex; justify-content: space-around; font-size: 13px; margin-top: 14px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 10px;">
                        <span style="color: var(--gold-accent);"><span style="display:inline-block; width:8px; height:8px; background:var(--gold-accent); border-radius:50%; margin-right:6px;"></span>HEART RATE</span>
                        <span style="color: #f59e0b;"><span style="display:inline-block; width:8px; height:8px; background:#f59e0b; border-radius:50%; margin-right:6px;"></span>MOOD Matrix</span>
                        <span style="color: #ea580c;"><span style="display:inline-block; width:8px; height:8px; background:#ea580c; border-radius:50%; margin-right:6px;"></span>ANXIETY Level</span>
                    </div>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="health-grid-layout" style="display:grid; grid-template-columns: 1fr 1.1fr; gap: 30px; height: 100%;">
                <div class="health-live-card glass-card" style="padding: 24px; display:flex; flex-direction:column; gap: 20px;">
                    <div class="live-pulse-container" style="display:flex; align-items:center;">
                        <span style="display:inline-block; width:48px; height:48px; color:var(--gold-accent);">${ICONS.HEART}</span>
                        <div style="margin-left: 16px;">
                            <span class="pulse-bpm-val" style="font-size: 3rem; font-weight: 300; font-family:'Outfit'; color: #fff;">${heartDisplay}</span>
                            <span style="font-size: 14px; letter-spacing: 1.5px; display:block; color:var(--text-muted); font-family:'Outfit';">LIVE PULSE</span>
                        </div>
                    </div>
                    
                    <svg class="ecg-wave-svg" viewBox="0 0 300 60" style="height: 100px; margin: 10px 0;">
                        <path d="M0,30 L50,30 L60,10 L70,50 L80,30 L120,30 L130,5 L140,55 L150,30 L200,30 L210,15 L220,45 L230,30 L300,30" fill="none" stroke="var(--gold-accent)" stroke-width="1.8"/>
                    </svg>

                    <div style="display:flex; flex-direction:column; gap: 14px; margin-top: 10px;">
                        <div style="font-size: 16px; padding-bottom: 8px; border-bottom:1px solid rgba(255,255,255,0.04); display:flex; justify-content:space-between;">
                            <span style="color:var(--text-muted);">MOOD MATRIX:</span>
                            <span class="sub-metric-val" style="color: #fff; font-weight: 500;">${this.biometricState.mood}</span>
                        </div>
                        <div style="font-size: 16px; padding-bottom: 8px; display:flex; justify-content:space-between;">
                            <span style="color:var(--text-muted);">ANXIETY DIST:</span>
                            <span class="sub-metric-val" style="color: ${this.biometricState.anxiety === 'HIGH' ? '#ef4444' : '#10b981'}; font-weight: 500;">${this.biometricState.anxiety}</span>
                        </div>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 24px; height: 100%;">
                    ${svgGraph}

                    <div class="health-history-card glass-card" style="padding: 20px; flex: 1; display:flex; flex-direction:column; min-height: 0;">
                        <div style="font-size: 15px; letter-spacing: 1px; margin-bottom: 12px; color: var(--gold-accent); font-family: 'Outfit';">${ICONS.TRENDS} BIOMETRIC DATABASE LOGS</div>
                        <div class="history-table-wrapper scrollable-container">
                            <table style="font-size: 15px; width:100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="text-align:left; color:var(--text-muted); border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                                        <th style="padding: 10px 8px;">TIME</th>
                                        <th style="padding: 10px 8px;">PULSE</th>
                                        <th style="padding: 10px 8px;">MOOD</th>
                                        <th style="padding: 10px 8px;">ANXIETY</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${historyRowsHTML}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return container;
    },

    // Builder for NEWS Tab
    buildNewsSection: function() {
        const container = document.createElement("div");
        container.className = "workspace-section-container animated-fade-in";

        let newsHTML = "";
        if (this.newsState && this.newsState.length > 0) {
            this.newsState.forEach((item, index) => {
                newsHTML += `
                    <div class="news-feed-card interactive-row" style="padding: 20px 24px; margin-bottom: 12px;">
                        <div style="display:flex; gap: 12px; align-items:center;">
                            <span class="news-item-index" style="font-size: 16px; color: var(--gold-accent); font-weight: 500;">[${index + 1}]</span>
                            <span style="font-size: 18px; font-weight: 500; color: #fff;">${item.title}</span>
                        </div>
                        <div style="font-size: 16px; margin-top: 10px; line-height: 1.5; color:var(--text-muted);">${item.description}</div>
                        <div style="font-size: 14px; margin-top: 14px; display:flex; justify-content:space-between; color:var(--text-muted);">
                            <span>BBC NEWS</span>
                            <span>${item.pubDate}</span>
                        </div>
                    </div>
                `;
            });
        } else {
            newsHTML = `
                <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 200px; opacity: 0.5;">
                    <span style="font-size: 2rem; margin-bottom: 12px;">📰</span>
                    <span style="font-size: 16px;">Indexing live news feeds...</span>
                </div>`;
        }

        container.innerHTML = `
            <div class="section-title" style="font-size: 1.5rem; margin-bottom: 24px; letter-spacing: 1px; font-family: 'Outfit'; color: var(--gold-accent);">${ICONS.NEWS} LIVE NEWS HEADLINES</div>
            <div class="news-list-wrapper scrollable-container">${newsHTML}</div>
        `;
        return container;
    },

    // Builder for ANALYTICS Tab
    buildAnalyticsSection: function() {
        const container = document.createElement("div");
        container.className = "workspace-section-container animated-fade-in";

        const username = this.identityState.currentUser && this.identityState.currentUser !== "Searching..." && this.identityState.currentUser !== "Guest" ? this.identityState.currentUser : "Dawgy";
        let avgHeart = "72.0 BPM";
        let pointsLogged = "N/A";
        if (this.historicalSummary) {
            if (this.historicalSummary.average_heart_rate) {
                avgHeart = `${this.historicalSummary.average_heart_rate} BPM`;
            }
            if (this.historicalSummary.historical_records_count) {
                pointsLogged = this.historicalSummary.historical_records_count;
            }
        }

        container.innerHTML = `
            <div style="display:grid; grid-template-columns: 1.2fr 0.8fr; gap: 30px; height: 100%;">
                <div class="glass-card" style="padding: 28px; display:flex; flex-direction:column; justify-content:center;">
                    <span style="font-size: 15px; letter-spacing: 2px; color: var(--gold-accent); font-family: 'Outfit';">ANALYTICS ENGINE,</span>
                    <span style="font-size: 3rem; line-height: 1.1; margin: 12px 0 20px 0; font-family:'Outfit'; font-weight: 500; color: #fff;">${username.toUpperCase()}</span>
                    <div style="font-size: 16px; line-height: 1.5; color:var(--text-muted);">
                        Physiological tracking parameters indicating stable baseline values. Diagnostics active.
                    </div>
                    
                    <div style="margin-top: 30px; display:flex; flex-direction:column; gap: 16px;">
                        <div style="font-size: 16px; padding: 10px 0; border-bottom:1px solid rgba(255,255,255,0.04); display:flex; justify-content:space-between;">
                            <span style="color:var(--text-muted);">SECURITY ACCESS LEVEL:</span>
                            <span style="font-weight: 500; color: var(--gold-accent);">EXECUTIVE</span>
                        </div>
                        <div style="font-size: 16px; padding: 10px 0; border-bottom:1px solid rgba(255,255,255,0.04); display:flex; justify-content:space-between;">
                            <span style="color:var(--text-muted);">RECOGNITION INDEX:</span>
                            <span style="font-weight: 500; color: var(--gold-accent);">${this.identityState.confidence}%</span>
                        </div>
                        <div style="font-size: 16px; padding: 10px 0; border-bottom:1px solid rgba(255,255,255,0.04); display:flex; justify-content:space-between;">
                            <span style="color:var(--text-muted);">PHYSIOLOGICAL BASELINE:</span>
                            <span style="font-weight: 500; color: #fff;">${avgHeart}</span>
                        </div>
                        <div style="font-size: 16px; padding: 10px 0; display:flex; justify-content:space-between;">
                            <span style="color:var(--text-muted);">TELEMETRY DATA RECORDS:</span>
                            <span style="font-weight: 500; color: #fff;">${pointsLogged} points</span>
                        </div>
                    </div>
                </div>

                <div class="glass-card" style="padding: 24px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap: 16px;">
                    <span style="font-size: 15px; letter-spacing: 2px; color:var(--text-muted); font-weight:600; text-transform: uppercase;">Biometric Index</span>
                    <div style="position: relative; width: 130px; height: 130px; border-radius:50%; display:flex; align-items:center; justify-content:center; background: rgba(255,255,255,0.01); border: 1px solid var(--card-glass-border);">
                        <svg viewBox="0 0 100 100" style="width: 80px; height: 80px;">
                            <circle cx="50" cy="50" r="42" stroke="rgba(212, 175, 55, 0.15)" stroke-width="1.2" fill="none"/>
                            <circle cx="50" cy="50" r="28" stroke="var(--gold-accent)" stroke-width="1.5" fill="none" stroke-dasharray="4 4"/>
                            <circle cx="50" cy="50" r="20" stroke="rgba(255, 255, 255, 0.2)" stroke-width="1" fill="none"/>
                            <path d="M42,50 C42,42 58,42 58,50 C58,58 42,58 42,66" stroke="var(--gold-accent)" stroke-width="1.8" fill="none" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <span style="font-size: 13px; letter-spacing: 1.5px; font-weight: 600; color: var(--gold-accent);">ACTIVE EXEC OS</span>
                </div>
            </div>
        `;
        return container;
    },

    // Builder for SETTINGS Tab (Dynamic view matching graphite style)
    buildSettingsSection: function() {
        const container = document.createElement("div");
        container.className = "workspace-section-container animated-fade-in";
        container.style.width = "100%";
        container.style.height = "100%";
        
        container.innerHTML = `
            <div class="section-title" style="font-size: 1.5rem; margin-bottom: 24px; letter-spacing: 1px; font-family: 'Outfit'; color: var(--gold-accent);">${ICONS.SETTINGS} SYSTEM CONFIGURE & USER PROFILE MANAGEMENT</div>
            
            <div class="settings-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; height: calc(100% - 60px);">
                <div class="glass-card" style="padding: 28px; display: flex; flex-direction: column; gap: 20px;">
                    <div style="font-size: 1.25rem; font-weight: 500; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px; color: #fff;">User Registration</div>
                    <div style="font-size: 16px; color: var(--text-muted); line-height: 1.6;">
                        To register a new user profile with biometric face recognition, visit the Lumina User Registration portal from your mobile phone or PC on the same network:
                        <div style="background: rgba(0,0,0,0.25); border: 1px solid var(--card-glass-border); border-radius: 12px; padding: 16px; margin-top: 14px; font-family: monospace; color: var(--gold-accent); font-size: 17px; text-align: center;">
                            http://[Smart-Mirror-IP]:8000/register
                        </div>
                    </div>
                    <div style="font-size: 16px; color: var(--text-muted); line-height: 1.6; margin-top: 10px;">
                        Active Workspace profile: <span style="color: #fff; font-weight: 500;">${this.identityState.currentUser}</span><br>
                        Recognition confidence index: <span style="color: var(--gold-accent); font-weight: 500;">${this.identityState.confidence}%</span>
                    </div>
                </div>
                
                <div class="glass-card" style="padding: 28px; display: flex; flex-direction: column; gap: 20px;">
                    <div style="font-size: 1.25rem; font-weight: 500; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px; color: #fff;">Gesture Mappings</div>
                    <div style="font-size: 16px; color: var(--text-muted); line-height: 1.6;">
                        Current system gesture engine mappings:
                        <ul style="padding-left: 20px; margin-top: 12px; color: #fff; display: flex; flex-direction: column; gap: 10px;">
                            <li><span style="color: var(--gold-accent); font-weight: 500;">Swipe Left / Right / Up / Down:</span> Cycle and navigate between feature cards</li>
                            <li><span style="color: var(--gold-accent); font-weight: 500;">Open Palm:</span> Select highlighted feature card</li>
                            <li><span style="color: var(--gold-accent); font-weight: 500;">Closed Fist:</span> Go back to home page from any screen</li>
                            <li><span style="color: var(--gold-accent); font-weight: 500;">Point Gesture:</span> Scroll active lists or content</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        return container;
    }
});