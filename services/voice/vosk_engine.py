"""Placeholder for the Vosk transcription engine.

Per services/voice/README.md, this module is intentionally minimal for now:
it defines the shape of the transcription engine (start/stop/get_transcript)
without wiring up actual microphone capture or Vosk model loading yet.

Next steps (see README.md):
1. Implement microphone capture here.
2. Add Vosk model loading and transcription.
"""

from __future__ import annotations

import logging

logger = logging.getLogger("VoskEngine")


class VoskEngine:
    """Skeleton transcription engine. Does not yet perform real speech-to-text."""

    def __init__(self, model_path: str | None = None):
        self.model_path = model_path
        self._running = False

    def start(self) -> None:
        """Start listening/transcribing. Not yet implemented."""
        self._running = True
        logger.warning("VoskEngine.start() called, but transcription is not yet implemented.")

    def stop(self) -> None:
        """Stop listening/transcribing."""
        self._running = False

    def get_transcript(self) -> str:
        """Return the most recent transcript. Not yet implemented."""
        return ""

    @property
    def is_running(self) -> bool:
        return self._running
