"""Lightweight HTTP server that shares camera frames with other components.

gesture.py captures each frame from OpenCV and pushes it here. The health
dashboard (or any other consumer) fetches the latest JPEG frame via
GET /frame on http://127.0.0.1:5001.

This avoids the Windows single-camera-lock problem entirely.
"""

from __future__ import annotations

import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from typing import Optional

import cv2


class FrameServer:
    """Serves the latest camera frame as JPEG over HTTP."""

    def __init__(self, port: int = 5001) -> None:
        self._frame_bytes: Optional[bytes] = None
        self._lock = threading.Lock()
        self._port = port
        self._server: Optional[HTTPServer] = None

    def update(self, frame) -> None:
        """Encode an OpenCV BGR frame as JPEG and store it."""
        _, jpeg = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        with self._lock:
            self._frame_bytes = jpeg.tobytes()

    def start(self) -> None:
        """Start the HTTP server on a background daemon thread."""
        parent = self

        class _Handler(BaseHTTPRequestHandler):
            def do_GET(self):
                if self.path == "/frame":
                    with parent._lock:
                        data = parent._frame_bytes
                    if data:
                        self.send_response(200)
                        self.send_header("Content-Type", "image/jpeg")
                        self.send_header("Access-Control-Allow-Origin", "*")
                        self.send_header("Cache-Control", "no-cache, no-store")
                        self.send_header("Content-Length", str(len(data)))
                        self.end_headers()
                        self.wfile.write(data)
                    else:
                        self.send_response(503)
                        self.end_headers()
                elif self.path == "/health":
                    self.send_response(200)
                    self.send_header("Content-Type", "text/plain")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(b"ok")
                else:
                    self.send_response(404)
                    self.end_headers()

            def do_OPTIONS(self):
                self.send_response(200)
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Access-Control-Allow-Methods", "GET")
                self.end_headers()

            def log_message(self, format, *args):
                pass  # Suppress request logging

        self._server = HTTPServer(("127.0.0.1", self._port), _Handler)
        thread = threading.Thread(target=self._server.serve_forever, daemon=True)
        thread.start()

    def stop(self) -> None:
        if self._server:
            self._server.shutdown()
            self._server = None
