"""Placeholder for mapping spoken phrases to actions.

Per services/voice/README.md, this maps transcripts (from vosk_engine.py)
into command actions. Currently just a minimal structure — no real phrase
matching is implemented yet.
"""

from __future__ import annotations

from typing import Optional


class CommandParser:
    """Maps a transcript string to a command name, if recognized."""

    def __init__(self):
        # Simple placeholder command map: exact phrase -> command name.
        # Expand this (or replace with fuzzy matching) as real phrases are defined.
        self.command_map = {}

    def parse(self, transcript: str) -> Optional[str]:
        """Returns the matched command name, or None if nothing matched."""
        if not transcript:
            return None
        normalized = transcript.strip().lower()
        return self.command_map.get(normalized)
