import os
import time
import threading
from datetime import datetime
from logger import get_logger

sys_logger = get_logger("ActivityTextLogger")

class TextLogger:
    def __init__(self, log_file_path: str):
        self.log_file_path = log_file_path
        self._lock = threading.Lock()
        
        log_dir = os.path.dirname(self.log_file_path)
        if log_dir:
            os.makedirs(log_dir, exist_ok=True)
            
        if not os.path.exists(self.log_file_path):
            with open(self.log_file_path, "w", encoding="utf-8") as f:
                f.write("=================================================================================\n")
                f.write("            COLLEGE SMART MIRROR - REGISTERED STUDENT USAGE LOGS                \n")
                f.write("=================================================================================\n\n")

        # Active student session tracking
        self.current_user = None
        self.session_start_time = None
        self.current_feature = None
        self.feature_start_time = None

    def _format_duration(self, seconds: float) -> str:
        secs = max(1, int(seconds))
        if secs < 60:
            return f"{secs}s"
        mins = secs // 60
        rem_secs = secs % 60
        return f"{mins}m {rem_secs}s"

    def _is_registered_student(self, user: str) -> bool:
        if not user or user in ["Unknown", "Guest", "Searching...", ""]:
            return False
        return True

    def start_student_session(self, username: str, initial_feature: str = "Class Schedules (Auto Popup)", mood: str = "", happiness_score: float = 0.0):
        """Triggers when a registered student is identified via face recognition."""
        if not self._is_registered_student(username):
            return

        now = time.time()
        with self._lock:
            # If a different student session was active, close it first
            if self.current_user and self.current_user != username:
                self._end_session_internal(now)

            if self.current_user == username:
                return  # Session already active for this student

            self.current_user = username
            self.session_start_time = now
            self.current_feature = initial_feature
            self.feature_start_time = now

            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            mood_info = f"Mood: {mood} ({round(happiness_score, 1)}%)" if mood else ""
            log_entry = f"[{now_str}] | LOGIN   | Student: {username:<14} | Action: Student Recognized -> Opened '{initial_feature}' | {mood_info}\n"
            self._write_to_file(log_entry)

    def log_feature_usage(self, username: str, new_feature: str, mood: str = "", happiness_score: float = 0.0, details: str = ""):
        """Triggers when a registered student uses or switches to a feature/module."""
        if not self._is_registered_student(username):
            return

        now = time.time()
        with self._lock:
            if not self.current_user or self.current_user != username:
                self.current_user = username
                self.session_start_time = now
                self.current_feature = new_feature
                self.feature_start_time = now
                now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                mood_info = f"Mood: {mood} ({round(happiness_score, 1)}%)" if mood else ""
                log_entry = f"[{now_str}] | LOGIN   | Student: {username:<14} | Action: Student Recognized -> Opened '{new_feature}' | {mood_info}\n"
                self._write_to_file(log_entry)
                return

            if self.current_feature == new_feature:
                return  # Same feature, don't write duplicate logs

            # Log previous feature duration
            prev_duration = self._format_duration(now - self.feature_start_time)
            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            mood_info = f"Mood: {mood} ({round(happiness_score, 1)}%)" if mood else ""
            detail_str = f" | Details: {details}" if details else ""

            log_entry = f"[{now_str}] | FEATURE | Student: {username:<14} | Feature Used: '{self.current_feature}' | Duration Spent: {prev_duration:<8} | {mood_info}{detail_str}\n"
            self._write_to_file(log_entry)

            self.current_feature = new_feature
            self.feature_start_time = now

    def end_student_session(self, username: str):
        """Triggers when student leaves camera view."""
        if not self._is_registered_student(username):
            return

        now = time.time()
        with self._lock:
            if self.current_user == username:
                self._end_session_internal(now)

    def _end_session_internal(self, now: float):
        if not self.current_user:
            return

        total_duration = self._format_duration(now - self.session_start_time)
        last_feature_duration = self._format_duration(now - self.feature_start_time)
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        log_entry = (
            f"[{now_str}] | FEATURE | Student: {self.current_user:<14} | Feature Used: '{self.current_feature}' | Duration Spent: {last_feature_duration:<8}\n"
            f"[{now_str}] | LOGOUT  | Student: {self.current_user:<14} | Total Session Time: {total_duration}\n"
            f"-------------------------------------------------------------------------------------------------\n"
        )
        self._write_to_file(log_entry)

        self.current_user = None
        self.session_start_time = None
        self.current_feature = None
        self.feature_start_time = None

    def _write_to_file(self, text: str):
        try:
            with open(self.log_file_path, "a", encoding="utf-8") as f:
                f.write(text)
        except Exception as e:
            sys_logger.error(f"Failed to append to log file {self.log_file_path}: {e}")
