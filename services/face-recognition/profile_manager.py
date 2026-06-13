import os
import json
import logging
from typing import Dict, Any, Optional

# Configure logger
logger = logging.getLogger(__name__)
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


class ProfileManager:
    """
    Manages loading, saving, creating, and fetching user profiles stored inside users.json.
    """

    def __init__(self, profiles_path: str):
        """
        Initializes the ProfileManager with a path to profiles/users.json.
        
        Args:
            profiles_path (str): Path to users.json.
        """
        self.profiles_path = profiles_path
        self.profiles: Dict[str, Dict[str, Any]] = {}
        self.load_profile()

    def load_profile(self) -> Dict[str, Dict[str, Any]]:
        """
        Loads user profiles from the profiles_path JSON database.
        
        Returns:
            Dict[str, Dict[str, Any]]: Loaded profiles dictionary.
        """
        if not os.path.exists(self.profiles_path):
            logger.warning(f"Profiles file not found at: {self.profiles_path}. Starting with empty profiles.")
            self.profiles = {}
            self.save_profile()
            return self.profiles

        try:
            with open(self.profiles_path, 'r') as f:
                self.profiles = json.load(f)
            logger.info(f"Loaded {len(self.profiles)} user profiles from database.")
        except Exception as e:
            logger.error(f"Failed to load profiles from {self.profiles_path}: {e}")
            self.profiles = {}
        return self.profiles

    def save_profile(self) -> bool:
        """
        Saves the current profiles dictionary to the profiles_path JSON file.
        
        Returns:
            bool: True if saving succeeded, False otherwise.
        """
        try:
            os.makedirs(os.path.dirname(self.profiles_path), exist_ok=True)
            with open(self.profiles_path, 'w') as f:
                json.dump(self.profiles, f, indent=4)
            logger.info(f"Profiles database successfully saved to {self.profiles_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to save profiles to {self.profiles_path}: {e}")
            return False

    def create_profile(self, username: str, name: str, theme: str = "dark", role: str = "User", welcome_message: Optional[str] = None) -> Dict[str, Any]:
        """
        Creates a new user profile or updates an existing one, and saves it.
        
        Args:
            username (str): The unique identifier/username.
            name (str): Display name of the user.
            theme (str): Visual theme ("dark" or "light").
            role (str): Role of the user (e.g., "Student", "Admin").
            welcome_message (str, optional): Custom welcome greeting.
            
        Returns:
            Dict[str, Any]: The newly created profile dictionary.
        """
        if not welcome_message:
            welcome_message = f"Welcome back {name}"

        self.profiles[username] = {
            "name": name,
            "theme": theme,
            "role": role,
            "welcomeMessage": welcome_message
        }
        
        self.save_profile()
        logger.info(f"Created/updated profile for user: '{username}'")
        return self.profiles[username]

    def get_active_profile(self, username: str) -> Dict[str, Any]:
        """
        Retrieves profile info for the recognized user name. If unrecognized or 'Unknown',
        returns a default guest profile representation.
        
        Args:
            username (str): The recognized user's username.
            
        Returns:
            Dict[str, Any]: Full profile data formatted for output to face_data.json.
        """
        profile = self.profiles.get(username)
        if profile and username != "Unknown":
            return {
                "recognized": True,
                "user": username,
                "theme": profile.get("theme", "dark"),
                "role": profile.get("role", "User"),
                "welcomeMessage": profile.get("welcomeMessage", f"Welcome back {username}")
            }
        else:
            return {
                "recognized": False,
                "user": "Unknown",
                "theme": "dark",
                "role": "Guest",
                "welcomeMessage": "Hello! Register to personalize."
            }
