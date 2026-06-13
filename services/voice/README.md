# Voice Recognition Service

This service provides the initial structure for a voice recognition subsystem
for MagicMirror.

## Architecture

The workflow is designed as follows:

Microphone
↓
Vosk speech recognition
↓
Command parsing
↓
Output command result

## Components

- `voice.py`
  - Service entry point.
  - Initializes the transcription engine and command parser.
  - Orchestrates the voice workflow.

- `vosk_engine.py`
  - Placeholder for the Vosk transcription engine.
  - Will eventually handle microphone capture and speech-to-text.

- `command_parser.py`
  - Placeholder for mapping spoken phrases to actions.
  - Will eventually translate transcripts into commands.

## Requirements

- Do not implement speech recognition yet.
- Keep the initial service structure minimal.
- Use this module as the foundation for later voice control features.

## Next steps

1. Implement microphone capture in `vosk_engine.py`.
2. Add Vosk model loading and transcription.
3. Implement phrase-to-action mapping in `command_parser.py`.
4. Wire the service into MagicMirror notifications or external output.
