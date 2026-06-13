# MMM-GestureController

A MagicMirror module that reads gesture outputs from `/tmp/gesture.json` and translates them into MagicMirror notifications.

## Features

- Polls `/tmp/gesture.json` every second.
- Ignores stale gestures older than 5 seconds.
- Triggers `PAGE_DECREMENT` when a `LEFT` gesture is detected.
- Triggers `PAGE_INCREMENT` when a `RIGHT` gesture is detected.
- Avoids processing the same gesture more than once.

## Installation

1. Copy the `MMM-GestureController` folder into `modules/custom/`.
2. Ensure `node_helper.js` is present.
3. The module requires a `gesture.json` file written at `/tmp/gesture.json`.

## Configuration

Add the module to your `config/config.js`:

```js
{
    module: "MMM-GestureController",
    config: {
        gestureFile: "/tmp/gesture.json",
        pollInterval: 1000,
        staleThresholdSeconds: 5,
    }
}
```

## Usage

1. Start the MagicMirror app.
2. Start the gesture service that writes `/tmp/gesture.json`.
3. The module will poll the file once per second and send notifications when new gestures are detected.

## Notes

- This module does not modify MagicMirror core files.
- It uses standard MagicMirror module conventions.
