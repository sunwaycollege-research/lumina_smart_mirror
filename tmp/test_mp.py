import sys
import os

project_root = "/home/dawgybey/DejaVu/lumina_smart_mirror"
sys.path.append(os.path.join(project_root, "services", "gestures"))

from mediapipe_handler import MediapipeHandler
import numpy as np

handler = MediapipeHandler()
try:
    handler.init_landmarker()
    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    
    # Run hand landmark detector
    frame_rgb = np.ascontiguousarray(frame[:, :, ::-1]) # RGB
    from mediapipe import Image, ImageFormat
    mp_image = Image(image_format=ImageFormat.SRGB, data=frame_rgb)
    res = handler._hand_landmarker.detect(mp_image)
    
    print("Attributes of HandLandmarkerResult:", dir(res))
    print("Class of HandLandmarkerResult:", type(res))
    
    # If there are properties, print them
    for attr in dir(res):
        if not attr.startswith('_'):
            try:
                print(f"res.{attr} = {getattr(res, attr)}")
            except Exception as e:
                print(f"res.{attr} error: {e}")
except Exception as e:
    import traceback
    traceback.print_exc()
