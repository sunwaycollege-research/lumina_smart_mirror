# Gesture Recognition Service

A real-time hand gesture recognition system using MediaPipe for hand tracking and a rule-based classifier to detect directional swipe gestures.

## Supported Gestures

The service detects four directional swipe gestures:

| Gesture   | Direction      | Trigger                                            | Output    |
| --------- | -------------- | -------------------------------------------------- | --------- |
| **LEFT**  | Swipe left     | Horizontal movement exceeds threshold to the left  | `"LEFT"`  |
| **RIGHT** | Swipe right    | Horizontal movement exceeds threshold to the right | `"RIGHT"` |
| **UP**    | Swipe upward   | Vertical movement exceeds threshold upward         | `"UP"`    |
| **DOWN**  | Swipe downward | Vertical movement exceeds threshold downward       | `"DOWN"`  |

## Gesture Movement Diagrams

```
LEFT Gesture                RIGHT Gesture
─────────────────          ─────────────────
      ↙    ↙                  ↘    ↘
  ✋(start) → ✋(end)      ✋(end) ← ✋(start)

UP Gesture                  DOWN Gesture
─────────────────          ─────────────────
      ↑    ↑                  ↓    ↓
      ✋                       ✋
     (end)                    (start)
      |                        |
      ✋                       ✋
    (start)                   (end)
```

## Detection Algorithm

### Dominant Axis Classification

The detector tracks wrist (landmark index 0) position across a sliding window of frames and computes movement deltas in both horizontal (x) and vertical (y) axes.

**Axis Priority:**

- If `|deltaX| > |deltaY|`: Classify as **LEFT** or **RIGHT** (horizontal gesture)
- If `|deltaY| ≥ |deltaX|`: Classify as **UP** or **DOWN** (vertical gesture)

This prevents misclassification of slightly diagonal movements.

### Movement Thresholds

Movement thresholds are in **normalized coordinates** (0.0 to 1.0 representing the full frame).

| Threshold              | Type  | Default | Description                                                        |
| ---------------------- | ----- | ------- | ------------------------------------------------------------------ |
| `horizontal_threshold` | float | 0.12    | Min horizontal movement (12% of frame width) to trigger LEFT/RIGHT |
| `vertical_threshold`   | float | 0.12    | Min vertical movement (12% of frame height) to trigger UP/DOWN     |
| `window_size`          | int   | 8       | Number of frames to analyze for movement                           |
| `cooldown_frames`      | int   | 10      | Frames to wait before accepting next gesture from same hand        |

**Example:**

- Frame width = 640 pixels
- `horizontal_threshold = 0.12`
- Min movement = 640 × 0.12 = 77 pixels

### Cooldown Mechanism

After a gesture is detected, the system waits for `cooldown_frames` frames before accepting a new gesture from the same hand. This prevents:

- Repeated triggering from a single prolonged gesture
- Noise from inducing false positives
- The hand remaining stationary after a gesture causing re-triggers

## Files

| File                       | Purpose                                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| `gesture.py`               | Entry point. Initializes camera handler and gesture detector, processes frames continuously.        |
| `gesture_detector.py`      | `GestureDetector` class. Implements rule-based gesture classification using wrist position history. |
| `mediapipe_handler.py`     | `MediapipeHandler` class. Handles camera capture and MediaPipe hand landmark extraction.            |
| `requirements.txt`         | Python dependencies (MediaPipe, OpenCV, NumPy).                                                     |
| `test_gesture_detector.py` | Unit tests for gesture detector logic.                                                              |

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
