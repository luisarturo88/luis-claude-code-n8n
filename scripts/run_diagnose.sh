#!/bin/bash
# run_diagnose.sh — Diagnóstico rápido del sistema
# Usar: bash scripts/run_diagnose.sh

STACK_ENV="/opt/n8n/stack.env"
N8N_CONTAINER=""

for c in n8n-n8n-1 n8n_n8n_1 n8n n8n-app-1; do
  if docker inspect "$c" >/dev/null 2>&1; then
    S=$(docker inspect --format='{{.State.Status}}' "$c" 2>/dev/null || true)
    [ "$S" = "running" ] && N8N_CONTAINER="$c" && break
  fi
done
[ -z "$N8N_CONTAINER" ] && N8N_CONTAINER=$(docker ps --format '{{.Names}}' 2>/dev/null | grep -i n8n | head -1 || true)
[ -z "$N8N_CONTAINER" ] && echo "ERROR: No se encontró contenedor n8n" && exit 1

N8N_API_KEY=""
[ -f "$STACK_ENV" ] && _l=$(grep '^N8N_API_KEY=' "$STACK_ENV" 2>/dev/null || true) && [ -n "$_l" ] && N8N_API_KEY="${_l#N8N_API_KEY=}"

if [ -z "$N8N_API_KEY" ]; then
  printf "API Key n8n: "; read -r N8N_API_KEY </dev/tty
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
docker cp "$SCRIPT_DIR/diagnose.js" "$N8N_CONTAINER:/tmp/diagnose.js"
docker exec -e N8N_API_KEY="$N8N_API_KEY" "$N8N_CONTAINER" node /tmp/diagnose.js
