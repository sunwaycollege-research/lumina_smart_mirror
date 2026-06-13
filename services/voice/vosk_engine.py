#!/usr/bin/env python3
"""Vosk transcription engine for offline microphone speech recognition.

This module provides a skeleton implementation for microphone transcription
using Vosk. It listens on the default system microphone, converts recognized
speech into lowercase text, and yields recognized phrases as they are
produced.

Requirements:
- Install Vosk: `pip install vosk`
- Install sounddevice for microphone input: `pip install sounddevice`
- Download a compatible Vosk model from:
  https://alphacephei.com/vosk/models
- Extract the model and configure `model_path` to point at the extracted
  model directory, for example:
      ~/.vosk/model

Assumptions and limitations:
- Only offline recognition is supported.
- The implementation uses a 16 kHz mono microphone stream.
- Ambient noise and microphone quality may affect recognition accuracy.
- This class does not implement command routing or MagicMirror integration.
- The Vosk model must be downloaded and configured before use.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Generator, Optional


class VoskEngine:
    """Vosk engine responsible for microphone transcription."""

    def __init__(self, model_path: Optional[str] = None, sample_rate: int = 16000) -> None:
        self.model_path = model_path or str(Path("d:/coding/College/Projects/Lumina/smart_mirror/vosk-model-small-en-us-0.15/vosk-model-small-en-us-0.15"))
        self.sample_rate = sample_rate
        self.logger = logging.getLogger(self.__class__.__name__)
        self._model = None
        self._ensure_model()

    def _ensure_model(self) -> None:
        model_dir = Path(self.model_path)
        if not model_dir.exists() or not model_dir.is_dir():
            raise RuntimeError(
                "Vosk model not found. "
                f"Please download a model from https://alphacephei.com/vosk/models "
                f"and extract it to '{self.model_path}', or pass a valid `model_path`."
            )

        try:
            from vosk import Model
        except ImportError as error:
            raise ImportError(
                "The vosk package is required for VoskEngine: install it with `pip install vosk`."
            ) from error

        self._model = Model(str(model_dir))
        self.logger.info("Loaded Vosk model from %s", self.model_path)

    def transcribe_microphone(self) -> Generator[str, None, None]:
        """Continuously listen to the default microphone and yield recognized phrases.

        Yields:
            Lowercase recognized speech phrases.

        Notes:
            - Silence is handled gracefully by continuing the listening loop.
            - Recognition errors are logged and do not stop the service.
        """
        try:
            import sounddevice as sd
        except ImportError as error:
            raise ImportError(
                "sounddevice is required for microphone input: install it with `pip install sounddevice`."
            ) from error

        try:
            from vosk import KaldiRecognizer
        except ImportError as error:
            raise ImportError(
                "The vosk package is required for VoskEngine: install it with `pip install vosk`."
            ) from error

        if self._model is None:
            raise RuntimeError("Vosk model has not been loaded")

        recognizer = KaldiRecognizer(self._model, float(self.sample_rate))
        recognizer.SetWords(False)

        self.logger.info("Starting microphone transcription on default audio device")

        try:
            with sd.RawInputStream(
                samplerate=self.sample_rate,
                blocksize=8000,
                dtype="int16",
                channels=1,
            ) as stream:
                while True:
                    try:
                        data, overflowed = stream.read(4000)
                        if overflowed:
                            self.logger.warning("Audio buffer overflow detected")
                        if not data:
                            continue

                        if recognizer.AcceptWaveform(bytes(data)):
                            result = recognizer.Result()
                            phrase = self._extract_phrase(result)
                            if phrase:
                                yield phrase
                    except Exception as error:
                        self.logger.error("Recognition error: %s", error)
                        continue
        except Exception as error:
            self.logger.error("Microphone input failed: %s", error)
            raise

    def _extract_phrase(self, result_json: str) -> Optional[str]:
        try:
            payload = json.loads(result_json)
        except json.JSONDecodeError:
            return None

        text = payload.get("text")
        if not text or not isinstance(text, str):
            return None

        return text.strip().lower()
