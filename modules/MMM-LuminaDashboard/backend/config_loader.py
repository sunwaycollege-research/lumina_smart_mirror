"""Loads project-wide settings from <project_root>/config.json.

This is the single place to plug in your own Google Calendar link, a
Nepali (or any other) news RSS feed, and to tune gesture smoothing /
health-monitor confidence without touching Python code.

If config.json is missing or malformed, sane defaults are used instead -
nothing here should ever crash the backend over a config problem.
"""

from __future__ import annotations

import copy
import json
import os

from logger import get_logger

logger = get_logger("Config")

DEFAULTS = {
    "calendar": {
        # Works with ANY public/secret .ics URL, including Google Calendar's
        # own export - see config.json for exact steps. No API key needed.
        "ical_url": "https://ics.calendarlabs.com/76/mm3137/US_Holidays.ics",
    },
    "news": {
        # Nepali-language source by default (OnlineKhabar). Swap for any
        # RSS 2.0 feed URL. fallback_rss_url is only used if the primary
        # fails to respond.
        "primary_rss_url": "https://www.onlinekhabar.com/feed",
        "fallback_rss_url": "https://feeds.bbci.co.uk/news/rss.xml",
    },
    "gestures": {
        "min_cutoff": 1.0,
        "beta": 0.3,
        "horizontal_threshold": 0.08,
        "vertical_threshold": 0.08,
        "cooldown_frames": 6,
        # Enables static hand-pose gestures (CLOSED_FIST, ONE_FINGER..FIVE_FINGERS,
        # THUMBS_UP) on top of the LEFT/RIGHT/UP/DOWN swipe gestures. Required for
        # finger-count navigation and closed-fist "close" gesture to work.
        "enable_static_poses": True,
        # Restricts detection to finger counting only (ignores motion/swipe gestures)
        "only_read_fingers": True,
        # Number of continuous matching frames required to confirm a gesture
        "verification_frames": 8,
    },
    "health_monitor": {
        "min_signal_quality": 0.35,
    },
}


def load_config(project_root: str) -> dict:
    """Returns DEFAULTS deep-merged with <project_root>/config.json, if present."""
    cfg = copy.deepcopy(DEFAULTS)
    config_path = os.path.join(project_root, "config.json")

    if not os.path.exists(config_path):
        logger.info(f"No config.json found at {config_path}; using built-in defaults.")
        return cfg

    try:
        with open(config_path, "r", encoding="utf-8") as f:
            user_cfg = json.load(f)
    except Exception as e:
        logger.warning(f"config.json exists but failed to parse ({e}); using built-in defaults.")
        return cfg

    for section, values in user_cfg.items():
        if section.startswith("_"):
            continue
        if section in cfg and isinstance(values, dict) and isinstance(cfg[section], dict):
            for key, value in values.items():
                if not key.startswith("_"):
                    cfg[section][key] = value
        else:
            cfg[section] = values

    logger.info(f"Loaded config.json from {config_path}")
    return cfg
