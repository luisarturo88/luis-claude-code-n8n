#!/usr/bin/env bash
# Instala OpenShorts en el VPS SIN tocar n8n. Seguro de repetir.
set -euo pipefail
cd "$(dirname "$0")"
PIN=60e77143fabb54d9d4c7068ce9a65ef93a69be4d   # commit revisado de mutonby/openshorts
if [ ! -d src/.git ]; then
  git clone https://github.com/mutonby/openshorts src
fi
git -C src fetch --depth=1 origin "$PIN" && git -C src checkout -q "$PIN"
[ -f .env ] || cp .env.example .env
# GUARDA DE SEGURIDAD: OpenShorts usa varios GB de RAM; si el servidor no tiene de sobra, el sistema puede matar n8n.
DISP=$(awk '/MemAvailable/ {printf "%d", $2/1024/1024}' /proc/meminfo)
if [ "${DISP:-0}" -lt 8 ] && [ "${FORZAR:-0}" != "1" ]; then
  echo "ABORTADO: solo hay ${DISP} GB de RAM disponible (se necesitan 8+). Instalar aqui podria tumbar n8n."; exit 1
fi
echo "Disco libre:"; df -h . | tail -1; free -h | head -2
docker compose build
docker compose up -d
sleep 20
curl -sf "http://127.0.0.1:${OPENSHORTS_PORT:-8100}/health/ready" && echo " OpenShorts OK" || echo "Aun arrancando: docker compose logs -f backend"
