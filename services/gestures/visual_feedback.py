import time
from typing import Optional, Any
import cv2
import numpy as np

def _draw_rounded_rect_filled(img, top_left, bottom_right, color, radius=10):
    """Helper to draw a filled rectangle with rounded corners."""
    x1, y1 = top_left
    x2, y2 = bottom_right
    # Filled circles at corners
    cv2.circle(img, (x1 + radius, y1 + radius), radius, color, -1)
    cv2.circle(img, (x2 - radius, y1 + radius), radius, color, -1)
    cv2.circle(img, (x1 + radius, y2 - radius), radius, color, -1)
    cv2.circle(img, (x2 - radius, y2 - radius), radius, color, -1)
    # Filled rectangles for the cross
    cv2.rectangle(img, (x1 + radius, y1), (x2 - radius, y2), color, -1)
    cv2.rectangle(img, (x1, y1 + radius), (x2, y2 - radius), color, -1)

class GestureVisualFeedback:
    """Provides visual feedback (arrows and dashboard) for recognized gestures."""

    def __init__(self, arrow_duration: float = 0.75, dashboard_duration: float = 2.0):
        """
        Args:
            arrow_duration: How long the arrow overlay remains visible in seconds.
            dashboard_duration: How long the dashboard message remains visible in seconds.
        """
        self.arrow_duration = arrow_duration
        self.dashboard_duration = dashboard_duration
        self.current_gesture: Optional[str] = None
        self.trigger_time: float = 0.0
        
        self.msg_map = {
            "LEFT": "Left swipe detected",
            "RIGHT": "Right swipe detected",
            "UP": "Up swipe detected",
            "DOWN": "Down swipe detected"
        }

    def trigger(self, gesture: str) -> None:
        """Trigger the feedback for a newly detected gesture."""
        if gesture in self.msg_map:
            self.current_gesture = gesture
            self.trigger_time = time.time()
            print(f"Dashboard updated: {self.msg_map[gesture]}")

    def draw(self, frame: Any) -> None:
        """Draw the visual feedback onto the given frame if active."""
        if not self.current_gesture:
            return

        elapsed = time.time() - self.trigger_time

        # Check if the overall feedback duration has expired
        if elapsed > self.dashboard_duration:
            self.current_gesture = None
            return

        h, w = frame.shape[:2]

        # 1. Render Dashboard Overlay (visible for dashboard_duration)
        msg = self.msg_map.get(self.current_gesture, "Gesture detected")
        
        padding_x, padding_y = 15, 10
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.6
        font_thickness = 1
        
        (text_w, text_h), _ = cv2.getTextSize(msg, font, font_scale, font_thickness)
        
        margin = 20
        box_w = text_w + (padding_x * 2)
        box_h = text_h + (padding_y * 2)
        
        top_left = (w - margin - box_w, margin)
        bottom_right = (w - margin, margin + box_h)
        
        # Semi-transparent background
        overlay = frame.copy()
        _draw_rounded_rect_filled(overlay, top_left, bottom_right, (30, 30, 30), radius=8)
        cv2.addWeighted(overlay, 0.6, frame, 0.4, 0, frame)
        
        # Text
        text_x = top_left[0] + padding_x
        text_y = bottom_right[1] - padding_y
        cv2.putText(frame, msg, (text_x, text_y), font, font_scale, (255, 255, 255), font_thickness, cv2.LINE_AA)

        # 2. Render Arrow Overlay (visible for arrow_duration)
        if elapsed <= self.arrow_duration:
            center_x, center_y = w // 2, int(h * 0.3)
            color = (0, 255, 255)  # Yellow
            thickness = 6
            arrow_length = 60

            start_point = (center_x, center_y)
            end_point = (center_x, center_y)

            if self.current_gesture == "LEFT":
                start_point = (center_x + arrow_length, center_y)
                end_point = (center_x - arrow_length, center_y)
            elif self.current_gesture == "RIGHT":
                start_point = (center_x - arrow_length, center_y)
                end_point = (center_x + arrow_length, center_y)
            elif self.current_gesture == "UP":
                start_point = (center_x, center_y + arrow_length)
                end_point = (center_x, center_y - arrow_length)
            elif self.current_gesture == "DOWN":
                start_point = (center_x, center_y - arrow_length)
                end_point = (center_x, center_y + arrow_length)

            cv2.arrowedLine(frame, start_point, end_point, color, thickness, tipLength=0.3)
