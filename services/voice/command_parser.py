#!/usr/bin/env python3
"""Command parser for voice commands.

This module maps normalized voice transcripts to application actions.
"""

from __future__ import annotations

import re
from typing import Optional


class CommandParser:
    """Maps recognized speech phrases to action commands."""

    _COMMAND_MAP = {
        "next page": "NEXT",
        "go next": "NEXT",
        "forward": "NEXT",
        "previous page": "PREVIOUS",
        "go back": "PREVIOUS",
        "back": "PREVIOUS",
        "show schedule": "SHOW_SCHEDULE",
        "show health": "SHOW_HEALTH",
    }

    def parse(self, transcript: str) -> Optional[str]:
        """Parse transcript text and return the corresponding command.

        Matching is case-insensitive and ignores extra whitespace.
        Unsupported phrases return None.
        """
        if not isinstance(transcript, str):
            return None

        normalized = self._normalize_transcript(transcript)
        return self._COMMAND_MAP.get(normalized)

    def _normalize_transcript(self, transcript: str) -> str:
        """Normalize transcript text for matching."""
        cleaned = transcript.strip().lower()
        cleaned = re.sub(r"\s+", " ", cleaned)
        return cleaned


if __name__ == "__main__":
    import unittest


    class CommandParserTests(unittest.TestCase):
        def setUp(self) -> None:
            self.parser = CommandParser()

        def test_parse_next_commands(self) -> None:
            self.assertEqual(self.parser.parse("Next Page"), "NEXT")
            self.assertEqual(self.parser.parse("  go   next  "), "NEXT")
            self.assertEqual(self.parser.parse("FORWARD"), "NEXT")

        def test_parse_previous_commands(self) -> None:
            self.assertEqual(self.parser.parse("previous page"), "PREVIOUS")
            self.assertEqual(self.parser.parse("Go Back"), "PREVIOUS")
            self.assertEqual(self.parser.parse(" back "), "PREVIOUS")

        def test_parse_show_commands(self) -> None:
            self.assertEqual(self.parser.parse("show schedule"), "SHOW_SCHEDULE")
            self.assertEqual(self.parser.parse("Show Health"), "SHOW_HEALTH")

        def test_unsupported_commands_return_none(self) -> None:
            self.assertIsNone(self.parser.parse("hello world"))
            self.assertIsNone(self.parser.parse("nextpage"))
            self.assertIsNone(self.parser.parse("") )

        def test_invalid_input_returns_none(self) -> None:
            self.assertIsNone(self.parser.parse(None))

    unittest.main()
