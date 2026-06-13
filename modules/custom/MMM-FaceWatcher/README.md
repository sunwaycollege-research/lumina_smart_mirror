# MMM-FaceWatcher

A custom MagicMirror² module that dynamically displays personalized greetings, roles, themes, and customized welcome messages based on active face recognition profile data.

---

## Installation and Configuration

### 1. Position files
Ensure that the module folder resides exactly in your MagicMirror² custom modules folder:
`modules/custom/MMM-FaceWatcher/`

### 2. Configure MagicMirror²
Open your main MagicMirror configuration file (`config/config.js`) and register the module in your modules array:

```javascript
let config = {
    // ... other settings ...
    modules: [
        // ... other modules ...
        {
            module: "modules/custom/MMM-FaceWatcher",
            position: "top_right", // Recommended position
            config: {
                updateInterval: 2000 // File poll speed in milliseconds (default: 2000)
            }
        }
    ]
};
```

---

## Output Integration Data Flow

The module polls a file named `face_data.json` inside its folder.
This file is generated dynamically by the backend face recognition service (`services/face-recognition/face_service.py`).

### Data Schema Example (Recognized User)
```json
{
    "recognized": true,
    "user": "Utkrista",
    "theme": "dark",
    "role": "Student",
    "welcomeMessage": "Welcome back Utkrista",
    "lastSeen": "2026-06-13T12:00:00.123456"
}
```

### Data Schema Example (Guest/Unknown User)
```json
{
    "recognized": false,
    "user": "Unknown",
    "theme": "dark",
    "role": "Guest",
    "welcomeMessage": "Hello! Register to personalize.",
    "lastSeen": "2026-06-13T12:00:02.987654"
}
```

---

## Internal Notifications Broadcasted

When a new user profile is loaded or the status changes (e.g. from `Guest` to a registered user), this module broadcasts a core MagicMirror² notification:

- **Notification Name**: `USER_PROFILE_CHANGED`
- **Payload**: The updated profile JSON object (as shown above).

Other custom modules can listen to `USER_PROFILE_CHANGED` inside their `notificationReceived` hook to adjust their layouts, color themes, calendar configurations, or options reactively!
