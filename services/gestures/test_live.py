import sys, time
sys.path.insert(0, '.')
from mediapipe_handler import MediapipeHandler
from gesture_detector import GestureDetector

mp = MediapipeHandler()
mp.init_camera()
detector = GestureDetector()

print("=== Place your hand in front of the camera ===")
print("=== Running for 10 seconds... ===")

detected_hands = 0
detected_gestures = []
start = time.time()

while time.time() - start < 10:
    hands = mp.get_hand_landmarks()
    if hands:
        detected_hands += 1
        gesture = detector.detect(hands)
        if gesture:
            detected_gestures.append(gesture)
            print("GESTURE DETECTED:", gesture)
        else:
            print("Hands seen, no gesture yet:", len(hands), "hand(s)")
    time.sleep(0.05)

print("=== Results ===")
print("Frames with hands:", detected_hands)
print("Gestures detected:", detected_gestures)
mp.close()
