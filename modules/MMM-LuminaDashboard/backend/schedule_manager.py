import os
import json
from logger import get_logger

logger = get_logger("ScheduleManager")

class ScheduleManager:
    def __init__(self, json_path: str):
        self.json_path = json_path
        self.schedules_data = {}
        self.load_schedules()

    def load_schedules(self):
        """Loads schedule data from JSON file with 5-second caching."""
        import time
        now = time.time()
        if hasattr(self, "_last_load_time") and (now - self._last_load_time < 5.0):
            return
        self._last_load_time = now
        if os.path.exists(self.json_path):
            try:
                with open(self.json_path, "r", encoding="utf-8") as f:
                    self.schedules_data = json.load(f)
            except Exception as e:
                logger.error(f"Error reading schedules.json: {e}")
                self.schedules_data = {}
        else:
            logger.warning(f"Schedules JSON path not found: {self.json_path}")
            self.schedules_data = {}

    def get_schedule_for_student(self, username: str, user_section: str = None) -> dict:
        """
        Retrieves schedule details for a given student username.
        Falls back to section schedule or default master schedule if student not specifically listed.
        """
        self.load_schedules()  # Refresh on fetch to allow live JSON edits
        students = self.schedules_data.get("students", {})
        
        # 1. Match specific student
        student_data = None
        if username in students:
            student_data = dict(students[username])
        else:
            for name, data in students.items():
                if name.lower() == username.lower():
                    student_data = dict(data)
                    break

        # 2. Match section if provided or activeGroup
        if not student_data:
            active_group = self.schedules_data.get("activeGroup", "L3")
            target_section = (user_section or active_group).upper()
            sections = self.schedules_data.get("sections", {})
            if target_section in sections:
                sec_info = sections[target_section]
                student_data = {
                    "student_id": f"HS-2024-{target_section}",
                    "student_name": username if username and username not in ["Searching...", "Guest", "Unknown"] else f"Student ({target_section})",
                    "program": sec_info.get("program", "BSc (Hons) Computer Science"),
                    "section": sec_info.get("section", target_section),
                    "schedule": sec_info.get("schedule", [])
                }

        # 3. Fallback to default schedule
        if not student_data:
            default_sched = dict(self.schedules_data.get("default_schedule", {}))
            student_data = {
                "student_id": default_sched.get("student_id", "L3-GENERAL"),
                "student_name": username if username and username not in ["Searching...", "Guest", "Unknown"] else default_sched.get("student_name", "General Student Schedule"),
                "program": default_sched.get("program", "BSc (Hons) Computer Science"),
                "section": default_sched.get("section", "L3"),
                "schedule": default_sched.get("schedule", [])
            }

        student_data["default_schedule"] = self.schedules_data.get("default_schedule", {})
        student_data["school_notices"] = self.schedules_data.get("school_notices", [])
        return student_data

    def update_schedule(self, new_data: dict) -> bool:
        """Updates schedule data and writes to JSON."""
        try:
            with open(self.json_path, "w", encoding="utf-8") as f:
                json.dump(new_data, f, indent=2)
            self.schedules_data = new_data
            logger.info("Schedule data successfully updated.")
            return True
        except Exception as e:
            logger.error(f"Failed to write schedules.json: {e}")
            return False

    def update_general_schedule(self, schedule_entries: list) -> bool:
        """Updates the default/master schedule for all students."""
        self.load_schedules()
        if "default_schedule" not in self.schedules_data:
            self.schedules_data["default_schedule"] = {
                "student_id": "ALL-STUDENTS",
                "student_name": "General Master Schedule for All Students",
                "program": "Secondary & Higher Secondary Academy",
                "section": "General Campus Bell Timetable & Daily Routine",
                "schedule": []
            }
        self.schedules_data["default_schedule"]["schedule"] = schedule_entries
        return self.update_schedule(self.schedules_data)

