# Gesture Recognition Service

A real-time hand gesture recognition system using MediaPipe for hand tracking and a **Continuous Temporal Verification Algorithm** to detect finger count static poses (`CLOSED_FIST`, `ONE_FINGER` to `FIVE_FINGERS`) and directional swipes with zero false-trigger twitching.

## Supported Gestures & Mapping

The service detects extended finger counts and maps them to Lumina Smart Mirror OS navigation:

| Gesture           | Pose / Count       | UI Action / Target Section      | Output String     |
| ----------------- | ------------------ | ------------------------------- | ----------------- |
| **CLOSED_FIST**   | 0 Fingers          | Return to Home / Landing Page   | `"CLOSED_FIST"`   |
| **ONE_FINGER**    | 1 Extended Finger  | Calendar View                   | `"ONE_FINGER"`    |
| **TWO_FINGERS**   | 2 Extended Fingers | Schedule View                   | `"TWO_FINGERS"`   |
| **THREE_FINGERS** | 3 Extended Fingers | Health Monitor (rPPG Telemetry) | `"THREE_FINGERS"` |
| **FOUR_FINGERS**  | 4 Extended Fingers | Live News RSS Feed              | `"FOUR_FINGERS"`  |
| **FIVE_FINGERS**  | 5 Extended Fingers | System Analytics                | `"FIVE_FINGERS"`  |

---

## Continuous Temporal Verification Algorithm

Instead of triggering actions abruptly on single or 2-frame recognitions, `GestureDetector` implements continuous frame sampling and temporal stability verification:

1. **Candidate Hold Tracking**: Maintains candidate gesture count across continuous frame stream (`process_verification`).
2. **Progress Calculation**: Computes real-time hold progress percentage:
   $$\text{Progress} = \min\left(1.0, \frac{\text{Candidate Match Count}}{\text{verification\_frames}}\right)$$
3. **Verification States**:
   - `IDLE`: No hand detected or candidate cleared.
   - `VERIFYING`: Candidate hand pose detected, progress (0% → 99%) rendered on Lumina HUD progress bar.
   - `CONFIRMED`: Progress reaches 100% (1.0). Action fires ONCE and triggers frame cooldown guard.
4. **Interruption Recovery**: If the user drops or changes their hand pose before reaching 100%, verification decays/resets smoothly without triggering accidental actions.

---

## Detection Algorithm & Parameters

| Threshold / Parameter | Type | Default | Description                                                      |
| --------------------- | ---- | ------- | ---------------------------------------------------------------- |
| `verification_frames` | int  | 8       | Continuous matching frames (~0.6s–0.8s hold) required to confirm |
| `cooldown_frames`     | int  | 6       | Cooldown frames to wait after confirmation before next action    |
| `window_size`         | int  | 3       | Sliding history buffer for frame finger count stability          |
| `only_read_fingers`   | bool | true    | Restricts detection to finger count poses (0 to 5)               |

---

## Files

| File                       | Purpose                                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `gesture_detector.py`      | `GestureDetector` class. Implements `process_verification()` for continuous temporal verification and progress tracking. |
| `mediapipe_handler.py`     | `MediapipeHandler` class. Handles camera capture and MediaPipe HandLandmarker tasks processing.                          |
| `gesture.py`               | Standalone CLI entry point for testing gesture recognition pipeline.                                                     |
| `requirements.txt`         | Subsystem Python dependencies (MediaPipe 0.10+, OpenCV, NumPy).                                                          |
| `test_gesture_detector.py` | Unit test suite covering classification, temporal progress, and state transitions.                                       |

## Architecture

```
┌──────────────────┐
│   Camera Input   │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  MediapipeHandler                        │
│  • Captures frames (OpenCV)              │
│  • Detects hand landmarks (MediaPipe)    │
│  • Extracts normalized coordinates (x,y) │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  GestureDetector                         │
│  • Tracks wrist position history         │
│  • Computes movement deltas              │
│  • Classifies gesture by dominant axis   │
│  • Applies cooldown mechanism            │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  Output Formats                          │
│  • Console: "Detected gesture: UP"       │
│  • JSON file: /tmp/gesture.json          │
│  • OpenCV display: Overlay text          │
└──────────────────────────────────────────┘
```

## Installation

### Requirements

- Python 3.8+
- MediaPipe >= 0.10.0
- OpenCV >= 4.5.5
- NumPy

### Setup

```bash
# Navigate to the project root
cd smart_mirror

# Create/activate virtual environment (if not already active)
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r services/gestures/requirements.txt
```

## Usage

### Run the Gesture Service

```bash
python services/gestures/gesture.py
```

**Output:**

- **Console:** Prints detected gestures
  ```
  Detected gesture: RIGHT
  Gesture saved: RIGHT -> /tmp/gesture.json
  Detected gesture: UP
  Gesture saved: UP -> /tmp/gesture.json
  ```
- **Display:** OpenCV window shows live webcam with hand landmarks and gesture overlay
- **File:** Gestures saved to `/tmp/gesture.json` (Unix/Linux/macOS) or `C:\Users\<User>\AppData\Local\Temp\gesture.json` (Windows)

### Exit

Press **'q'** in the OpenCV window or **Ctrl+C** in the terminal to exit gracefully.

## Configuration

To customize thresholds and parameters, modify the `GestureDetector` initialization in `gesture.py`:

```python
detector = GestureDetector(
    window_size=8,              # Frames to analyze
    horizontal_threshold=0.12,  # LEFT/RIGHT sensitivity
    vertical_threshold=0.12,    # UP/DOWN sensitivity
    cooldown_frames=10          # Frames between gestures
)
```

**Tuning Guidelines:**

| Issue                       | Solution                                                 |
| --------------------------- | -------------------------------------------------------- |
| Too many false positives    | Increase `horizontal_threshold` and `vertical_threshold` |
| Gestures not detected       | Decrease thresholds                                      |
| Gestures repeat too quickly | Increase `cooldown_frames`                               |
| Sluggish detection          | Decrease `window_size`                                   |

## Testing

### Run Unit Tests

```bash
cd services/gestures
python -m pytest test_gesture_detector.py -v
# or
python -m unittest test_gesture_detector.py
```

### Manual Testing

1. **LEFT Gesture:**
   - Position hand in front of camera
   - Swipe hand left (≥ horizontal_threshold movement)
   - Observe: `"Detected gesture: LEFT"` in console

2. **RIGHT Gesture:**
   - Position hand in front of camera
   - Swipe hand right (≥ horizontal_threshold movement)
   - Observe: `"Detected gesture: RIGHT"` in console

3. **UP Gesture:**
   - Position hand in front of camera
   - Swipe hand upward (≥ vertical_threshold movement)
   - Observe: `"Detected gesture: UP"` in console

4. **DOWN Gesture:**
   - Position hand in front of camera
   - Swipe hand downward (≥ vertical_threshold movement)
   - Observe: `"Detected gesture: DOWN"` in console

5. **Small Movements (Ignored):**
   - Move hand slightly without exceeding thresholds
   - Observe: No gesture detected

6. **Diagonal Movements:**
   - Move hand diagonally (e.g., up-right)
   - Observe: Classified based on dominant axis (UP if |deltaY| > |deltaX|)

## JSON Output Format

Gestures are saved to `/tmp/gesture.json` with the following format:

```json
{
  "gesture": "RIGHT",
  "timestamp": 1718200000
}
```

Each gesture detection updates this file with the latest gesture and current Unix timestamp.

## Data Format: Hand Landmarks

Each hand detected by MediaPipe is represented as:

```python
{
    "handedness": "Right",  # "Left" or "Right"
    "landmarks": [
        {
            "index": 0,  # 0 = wrist
            "x": 0.5,    # normalized horizontal (0=left, 1=right)
            "y": 0.3,    # normalized vertical (0=top, 1=bottom)
            "z": 0.1     # depth (0=close, 1=far)
        },
        # ... 20 hand landmarks total
    ],
    "landmarks_px": [
        {
            "x": 320,    # pixel horizontal
            "y": 180     # pixel vertical
        },
        # ... pixel coordinates for drawing
    ]
}
```

**Landmark Indices:**

- 0: Wrist
- 1-4: Thumb
- 5-8: Index finger
- 9-12: Middle finger
- 13-16: Ring finger
- 17-20: Pinky finger

## Integration with MagicMirror

The gesture service is designed to integrate with MagicMirror via IPC or event listeners. Detected gestures can be:

1. **Written to JSON file** (`/tmp/gesture.json`) for polling
2. **Sent via WebSocket** to MagicMirror modules
3. **Broadcast via event emitter** to listening processes

The gesture JSON format is backward compatible with existing MagicMirror gesture handlers.

## Troubleshooting

| Problem                          | Cause                                | Solution                                                 |
| -------------------------------- | ------------------------------------ | -------------------------------------------------------- |
| No gestures detected             | Hand not in frame or too slow        | Ensure hand is visible in camera, increase `window_size` |
| False positives                  | Threshold too low or camera noise    | Increase thresholds, improve lighting                    |
| Gesture latency                  | Window too large or camera lag       | Decrease `window_size`, check camera FPS                 |
| Cooldown too long                | Can't trigger second gesture quickly | Decrease `cooldown_frames`                               |
| Diagonal movements misclassified | Dominant axis threshold too close    | Adjust thresholds for better separation                  |
| `gesture.json` not created       | Permissions or path issue            | Check write permissions in `/tmp` or temp directory      |

## Performance Notes

- **Frame processing:** ~30-50 FPS on modern CPU with MediaPipe
- **Landmark extraction:** ~20-30 ms per frame
- **Gesture classification:** <1 ms per frame
- **Memory footprint:** ~150 MB with MediaPipe model loaded

## Future Enhancements

- [ ] Multi-hand gesture recognition (e.g., both hands simultaneously)
- [ ] Gesture velocity tracking (fast vs. slow swipes)
- [ ] Circular/spiral gesture detection
- [ ] Pinch gesture detection
- [ ] Machine learning-based classifier for complex gestures
- [ ] Gesture confidence scores
- [ ] Configurable gesture names and custom gestures

## License

This gesture recognition service is part of the Smart Mirror project. See the main project LICENSE for details.

## References

- [MediaPipe Hands](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)
- [OpenCV Documentation](https://docs.opencv.org/)
- [Hand Landmark Guide](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker/python)
