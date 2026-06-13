#!/usr/bin/env python3
"""Voice recognition service entry point.

This module initializes the voice recognition workflow and orchestrates the
components that will be added later.
"""

from __future__ import annotations

import json
import logging
import os
import time
from pathlib import Path

from services.voice.vosk_engine import VoskEngine
from services.voice.command_parser import CommandParser


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    logger = logging.getLogger("voice_service")

    logger.info("Starting voice recognition service")

    engine = VoskEngine()
    parser = CommandParser()

    logger.info("Voice service initialized with VoskEngine and CommandParser")

    command_file = Path(os.environ.get("VOICE_COMMAND_FILE", "/tmp/voice.json"))

    try:
        for transcript in engine.transcribe_microphone():
            if not transcript:
                continue

            print(f"Recognized: {transcript}")
            command = parser.parse(transcript)
            if command:
                print(f"Mapped command: {command}")
                _save_command(command_file, command, logger)
            else:
                logger.debug("Unsupported phrase ignored: %s", transcript)
    except KeyboardInterrupt:
        logger.info("Voice service shutdown requested")
    except Exception as error:
        logger.exception("Voice service error: %s", error)


def _save_command(command_file: Path, command: str, logger: logging.Logger) -> None:
    payload = {
        "command": command,
        "timestamp": int(time.time()),
    }

    try:
        command_file.parent.mkdir(parents=True, exist_ok=True)
        with command_file.open("w", encoding="utf-8") as handle:
            json.dump(payload, handle)
            handle.write(os.linesep)
    except OSError as error:
        logger.error("Failed to write voice command to %s: %s", command_file, error)


if __name__ == "__main__":
    main()
