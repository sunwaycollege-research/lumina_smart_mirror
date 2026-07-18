#!/usr/bin/env bash
# Sets up the Python environment the Lumina backend expects.
#
# node_helper.js launches uvicorn from <project_root>/.venv/bin/uvicorn.
# Nothing in this repo previously created that venv, which is why the
# dashboard backend never started. Run this once from the project root:
#
#   chmod +x setup.sh && ./setup.sh
#
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$PROJECT_ROOT/.venv"
REQ_FILE="$PROJECT_ROOT/modules/MMM-LuminaDashboard/backend/requirements.txt"

if [ ! -f "$REQ_FILE" ]; then
    echo "Could not find $REQ_FILE — run this script from the project root." >&2
    exit 1
fi

echo "Creating venv at $VENV_DIR ..."
python3 -m venv "$VENV_DIR"

echo "Installing backend requirements (fastapi, uvicorn[standard], mediapipe, face-recognition, etc.)..."
"$VENV_DIR/bin/pip" install --upgrade pip
"$VENV_DIR/bin/pip" install -r "$REQ_FILE"

echo ""
echo "Done. uvicorn is now at: $VENV_DIR/bin/uvicorn"
echo "Start MagicMirror normally and node_helper.js will launch the backend automatically."
