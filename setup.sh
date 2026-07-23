#!/usr/bin/env bash
# Sets up the Python environment and dependencies for Lumina / SOMA Smart Mirror.
#
# Usage:
#   chmod +x setup.sh && ./setup.sh
#

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$PROJECT_ROOT/.venv"
REQ_BACKEND="$PROJECT_ROOT/modules/MMM-LuminaDashboard/backend/requirements.txt"
REQ_FACE="$PROJECT_ROOT/services/face-recognition/requirements.txt"
REQ_GESTURE="$PROJECT_ROOT/services/gestures/requirements.txt"

echo "==============================================="
echo "  Lumina / SOMA Smart Mirror Environment Setup  "
echo "==============================================="

# 1. Verify Python installation
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] python3 is not installed. Run: sudo apt install python3 python3-pip python3-venv" >&2
    exit 1
fi

# 2. Create Python Virtual Environment
if [ ! -d "$VENV_DIR" ]; then
    echo "[INFO] Creating Python virtual environment at $VENV_DIR ..."
    python3 -m venv "$VENV_DIR"
else
    echo "[INFO] Using existing virtual environment at $VENV_DIR"
fi

# 3. Upgrade pip, setuptools, wheel
echo "[INFO] Upgrading core pip packages..."
"$VENV_DIR/bin/pip" install --upgrade pip setuptools wheel

# 4. Install backend dependencies
if [ -f "$REQ_BACKEND" ]; then
    echo "[INFO] Installing backend dependencies ($REQ_BACKEND)..."
    "$VENV_DIR/bin/pip" install -r "$REQ_BACKEND"
fi

# 5. Install service dependencies if present
if [ -f "$REQ_FACE" ]; then
    echo "[INFO] Installing face-recognition service dependencies..."
    "$VENV_DIR/bin/pip" install -r "$REQ_FACE"
fi

if [ -f "$REQ_GESTURE" ]; then
    echo "[INFO] Installing gesture service dependencies..."
    "$VENV_DIR/bin/pip" install -r "$REQ_GESTURE"
fi

echo ""
echo "==============================================="
echo "  Setup Complete!                              "
echo "==============================================="
echo "Uvicorn executable: $VENV_DIR/bin/uvicorn"
echo "To activate venv in terminal: source .venv/bin/activate"
echo "To start Smart Mirror: npm start"
echo "==============================================="

