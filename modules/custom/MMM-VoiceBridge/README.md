# MMM-VoiceBridge

A MagicMirror module that converts recognized voice commands from `/tmp/voice.json` into MagicMirror notifications.

## Features

- Polls `/tmp/voice.json` every second
- Ignores commands older than 5 seconds
- Prevents duplicate processing of the same command
- Maps voice commands to MagicMirror notifications

## Supported commands

- `NEXT` → `PAGE_INCREMENT`
- `PREVIOUS` → `PAGE_DECREMENT`
- `SHOW_SCHEDULE` → `SHOW_SCHEDULE`
- `SHOW_HEALTH` → `SHOW_HEALTH`

## Installation

1. Copy the `MMM-VoiceBridge` folder to `modules/custom/`.
2. Add the module to your `config/config.js`:

```js
{
    module: "MMM-VoiceBridge",
    position: "top_right",
    config: {
        voiceFile: "/tmp/voice.json",
        pollInterval: 1000,
        staleThresholdSeconds: 5,
    }
}
```

3. Restart MagicMirror.

## Notes

- This module only reads the voice command file and sends notifications.
- It does not handle voice capture or transcription itself.
