/* ============================================================
   FILE : MagicMirror/config/config.js   — LUMINA PREMIUM
   Load order: LuminaUI → LuminaAR → FaceID → Gesture → Voice
               → AI → Health → SmartHome → Schedule → Clock
   ============================================================ */
let config = {
  address:"localhost", port:8080, basePath:"/",
  ipWhitelist:["127.0.0.1","::ffff:127.0.0.1","::1"],
  language:"en", locale:"en-US", timeFormat:12, units:"metric",
  logLevel:["INFO","LOG","WARN","ERROR"],
  modules:[
    // 1 — PREMIUM UI (inject theme CSS + particles + alert overlay)
    { module:"LuminaUI", config:{ theme:"obsidian", accentColor:"#4FC3F7", particleCount:35, alertDurationMs:5000 }},
    // 2 — AR OVERLAY
    { module:"LuminaAR",  position:"fullscreen_below",
      config:{ cameraIndex:0, showFaceHalo:true, showNameBadge:true, showBPMPulse:true, showGestureFX:true }},
    // 3 — FACE RECOGNITION
    { module:"LuminaFaceID", position:"top_left",
      config:{ usersDbPath:"modules/LuminaFaceID/data/users.json", greetingStyle:"executive",
               sleepAfterSec:60, matchThreshold:0.45, showTitle:true, showBriefing:true }},
    // 4 — GESTURE CONTROL
    { module:"LuminaGesture", position:"fullscreen_above",
      config:{ cameraIndex:0, sensitivityMs:500, showFeedback:true, minConfidence:75,
               gestures:{ open_palm:"LUMINA_SLEEP", pinch:"GESTURE_PINCH", two_fingers:"GESTURE_TWO_FINGERS",
                          thumbs_up:"GESTURE_THUMBS_UP", swipe_left:"GESTURE_SWIPE_LEFT", swipe_right:"GESTURE_SWIPE_RIGHT" }}},
    // 5 — VOICE CONTROL
    { module:"LuminaVoice", position:"fullscreen_above",
      config:{ wakeWord:"hey lumina", sampleRate:16000, vadSilenceMs:1800, showTranscript:true }},
    // 6 — AI ASSISTANT
    { module:"LuminaAI", position:"middle_center",
      config:{ apiKeyEnv:"ANTHROPIC_API_KEY", model:"claude-opus-4-6", maxHistory:10, idleTimeoutSec:20 }},
    // 7 — HEALTH DASHBOARD
    { module:"LuminaHealth", position:"bottom_left",
      config:{ rppgWindowSec:15, showBPM:true, showHRV:true, showStress:true, showMood:true,
               showBreathing:true, alertBPMHigh:110, alertBPMLow:50, alertStress:75, mobileSync:true }},
    // 8 — SMART HOME
    { module:"LuminaSmartHome", position:"bottom_right",
      config:{ haUrl:"http://homeassistant.local:8123", haToken:"YOUR_HA_TOKEN", pollIntervalSec:30,
               rooms:[
                 { id:"office",  label:"Office",     lightEntity:"light.office",     tempSensor:"sensor.office_temp" },
                 { id:"meeting", label:"Board Room",  lightEntity:"light.board_room", tempSensor:"sensor.meeting_temp" },
                 { id:"lobby",   label:"Lobby",       lightEntity:"light.lobby",      tempSensor:null },
               ],
               scenes:{ morning:"scene.executive_morning", focus:"scene.executive_focus",
                        meeting:"scene.executive_meeting", evening:"scene.executive_evening" },
               climateEntity:"climate.office_hvac" }},
    // 9 — SCHEDULE
    { module:"LuminaSchedule", position:"top_right",
      config:{ calendarSources:[
                 { type:"google",  name:"Work Calendar", url:"YOUR_GOOGLE_ICAL_URL", color:"#4FC3F7" },
                 { type:"outlook", name:"Microsoft 365",  url:"YOUR_OUTLOOK_ICAL_URL", color:"#CE93D8" },
               ], showUpcomingCount:5, urgentAlertMins:15, meetingJoinLinks:true, updateIntervalMs:60000 }},
    // 10 — CLOCK (built-in)
    { module:"clock", position:"top_left", config:{ timeFormat:12, showDate:true, clockBold:false }},
    // 11 — WEATHER (built-in)
    { module:"weather", position:"top_left", header:"",
      config:{ weatherProvider:"openweathermap", type:"current", location:"Kathmandu",
               locationID:"1283240", apiKey:"YOUR_OPENWEATHER_API_KEY", units:"metric", roundTemp:true }},
  ]
};
if (typeof module!=="undefined"){ module.exports=config; }
