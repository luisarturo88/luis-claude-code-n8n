#!/bin/bash
# Deja Paperclip (https://github.com/paperclipai/paperclip) disponible en cada sesión cloud.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

PAPERCLIP_DIR="$HOME/paperclipai/paperclip"

# Idempotente: solo clona si falta
if ! git -C "$PAPERCLIP_DIR" rev-parse HEAD >/dev/null 2>&1; then
  rm -rf "$PAPERCLIP_DIR"
  mkdir -p "$(dirname "$PAPERCLIP_DIR")"
  GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 https://github.com/paperclipai/paperclip "$PAPERCLIP_DIR"
fi

if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo "export PAPERCLIP_DIR=\"$PAPERCLIP_DIR\"" >> "$CLAUDE_ENV_FILE"
fi
