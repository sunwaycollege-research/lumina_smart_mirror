"""Voice recognition service entry point.

Per services/voice/README.md:
Microphone -> Vosk speech recognition -> Command parsing -> Output command result

This orchestrates VoskEngine and CommandParser. Both are currently minimal
placeholders (see their docstrings), so this entry point is likewise a
skeleton — it wires the pieces together but does not yet do real speech
recognition end-to-end.
"""

from __future__ import annotations

import logging

from vosk_engine import VoskEngine
from command_parser import CommandParser

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("VoiceService")


class VoiceService:
    def __init__(self, model_path: str | None = None):
        self.engine = VoskEngine(model_path=model_path)
        self.parser = CommandParser()

    def start(self) -> None:
        logger.info("Starting voice service (placeholder — no live transcription yet).")
        self.engine.start()

    def stop(self) -> None:
        self.engine.stop()

    def poll_command(self) -> str | None:
        """Fetch the latest transcript and try to resolve it to a command."""
        transcript = self.engine.get_transcript()
        return self.parser.parse(transcript)


if __name__ == "__main__":
    service = VoiceService()
    service.start()
    logger.info("Voice service running as a stub. Implement vosk_engine.py to enable real transcription.")
