#!/bin/bash
# bootstrap_sistema.sh — Fábrica SEO n8n
# Ejecutar desde el VPS: bash /opt/n8n/workflows_import/scripts/bootstrap_sistema.sh

# NO usar set -e porque grep retorna 1 cuando no encuentra nada
set -uo pipefail

# ── CONFIGURACIÓN ─────────────────────────────────────────────────────────────
STACK_ENV="/opt/n8n/stack.env"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd)" || SCRIPT_DIR="/opt/n8n/workflows_import/scripts"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC} $1"; }
info() { echo -e "${YELLOW}→${NC} $1"; }
err()  { echo -e "${RED}✗${NC} $1"; }
hdr()  { echo -e "\n${BLUE}══ $1 ══${NC}"; }
die()  { echo -e "${RED}FATAL:${NC} $1"; exit 1; }

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  BOOTSTRAP — FÁBRICA SEO N8N                 ║"
printf "║  %-44s║\n" "$(date '+%Y-%m-%d %H:%M:%S')"
echo "╚══════════════════════════════════════════════╝"

# ── 1. LEER API KEY ────────────────────────────────────────────────────────────
hdr "CONFIGURACIÓN"

N8N_API_KEY=""

# Intentar leer de stack.env
if [ -f "$STACK_ENV" ]; then
    _line=$(grep '^N8N_API_KEY=' "$STACK_ENV" 2>/dev/null || true)
    if [ -n "$_line" ]; then
        N8N_API_KEY="${_line#N8N_API_KEY=}"
        N8N_API_KEY="${N8N_API_KEY//\"/}"
        N8N_API_KEY="${N8N_API_KEY//\'/}"
    fi
fi

# Si sigue vacía, preguntar al usuario
if [ -z "$N8N_API_KEY" ]; then
    echo ""
    info "N8N_API_KEY no encontrada en $STACK_ENV"
    echo ""
    echo "  Pega aquí tu API key de n8n y pulsa Enter:"
    echo "  (la encuentras en n8n → Settings → API → Create API Key)"
    echo ""
    printf "  API Key: "
    read -r N8N_API_KEY </dev/tty || true
    N8N_API_KEY="${N8N_API_KEY// /}"  # quitar espacios

    if [ -z "$N8N_API_KEY" ]; then
        die "API key vacía. Inténtalo de nuevo."
    fi

    # Guardar en stack.env para la próxima vez
    if [ -f "$STACK_ENV" ]; then
        echo "N8N_API_KEY=${N8N_API_KEY}" >> "$STACK_ENV"
        ok "API key guardada en $STACK_ENV"
    fi
fi

ok "N8N_API_KEY cargada (${#N8N_API_KEY} caracteres)"

# Telegram (opcional)
BOT_TOKEN=""
CHAT_ID="0"
if [ -f "$STACK_ENV" ]; then
    _bt=$(grep '^BOT_TOKEN=' "$STACK_ENV" 2>/dev/null || true)
    _ci=$(grep '^CHAT_ID='   "$STACK_ENV" 2>/dev/null || true)
    [ -n "$_bt" ] && BOT_TOKEN="${_bt#BOT_TOKEN=}" && BOT_TOKEN="${BOT_TOKEN//\"/}"
    [ -n "$_ci" ] && CHAT_ID="${_ci#CHAT_ID=}"     && CHAT_ID="${CHAT_ID//\"/}"
fi

# ── 2. DETECTAR CONTENEDOR n8n ─────────────────────────────────────────────────
hdr "DETECTANDO DOCKER"

N8N_CONTAINER=""

for candidate in n8n-n8n-1 n8n_n8n_1 n8n n8n-app-1; do
    if docker inspect "$candidate" >/dev/null 2>&1; then
        _status=$(docker inspect --format='{{.State.Status}}' "$candidate" 2>/dev/null || true)
        if [ "$_status" = "running" ]; then
            N8N_CONTAINER="$candidate"
            break
        fi
    fi
done

if [ -z "$N8N_CONTAINER" ]; then
    N8N_CONTAINER=$(docker ps --format '{{.Names}}' 2>/dev/null | grep -i 'n8n' | head -1 || true)
fi

if [ -z "$N8N_CONTAINER" ]; then
    die "No se encontró ningún contenedor n8n corriendo. Ejecuta: docker ps"
fi

ok "Contenedor: $N8N_CONTAINER"

# Verificar node disponible
_nver=$(docker exec "$N8N_CONTAINER" node --version 2>/dev/null || true)
if [ -z "$_nver" ]; then
    die "node no disponible dentro de $N8N_CONTAINER"
fi
ok "Node.js en contenedor: $_nver"

# ── 3. VERIFICAR n8n API ────────────────────────────────────────────────────────
hdr "VERIFICANDO n8n API"

_check_script='
const http = require("http");
const req = http.request({
  hostname:"localhost", port:5678,
  path:"/api/v1/workflows?limit=1",
  method:"GET",
  headers:{"X-N8N-API-KEY": process.env.N8N_API_KEY}
}, res => {
  process.stdout.write(String(res.statusCode));
  res.resume();
});
req.on("error", () => process.stdout.write("0"));
req.setTimeout(10000, () => { req.destroy(); process.stdout.write("timeout"); });
req.end();
'

_api_status=$(docker exec -e N8N_API_KEY="$N8N_API_KEY" "$N8N_CONTAINER" \
    node -e "$_check_script" 2>/dev/null || true)

case "$_api_status" in
    200) ok "n8n API responde: HTTP 200" ;;
    401) die "API Key inválida (HTTP 401). Genera una nueva en n8n → Settings → API" ;;
    0|timeout) die "n8n no responde en localhost:5678. Verifica que esté corriendo." ;;
    *) info "n8n responde HTTP $_api_status — continuando" ;;
esac

# ── 4. COPIAR WORKFLOWS AL CONTENEDOR ─────────────────────────────────────────
hdr "COPIANDO WORKFLOWS AL CONTENEDOR"

CONTAINER_WF_DIR="/tmp/n8n_bootstrap"

docker exec "$N8N_CONTAINER" mkdir -p \
    "$CONTAINER_WF_DIR/production" \
    "$CONTAINER_WF_DIR/monetization" \
    "$CONTAINER_WF_DIR/distribution" \
    "$CONTAINER_WF_DIR/seo" 2>/dev/null || true

ok "Directorios creados en $CONTAINER_WF_DIR"

# Detectar directorio de workflows en el host
WF_HOST_DIR=""
for candidate in \
    "$SCRIPT_DIR/../workflows" \
    "/opt/n8n/workflows_import/workflows" \
    "/opt/n8n/workflows"; do
    _abs=$(realpath "$candidate" 2>/dev/null || true)
    if [ -d "$_abs" ]; then
        WF_HOST_DIR="$_abs"
        break
    fi
done

if [ -z "$WF_HOST_DIR" ]; then
    die "No se encontró el directorio de workflows. Esperado en: $SCRIPT_DIR/../workflows"
fi

ok "Workflows en host: $WF_HOST_DIR"

COPIED=0
for subfolder in production monetization distribution seo; do
    _src="$WF_HOST_DIR/$subfolder"
    if [ -d "$_src" ]; then
        docker cp "$_src/." "$N8N_CONTAINER:$CONTAINER_WF_DIR/$subfolder/" 2>/dev/null || true
        _n=$(ls "$_src"/*.json 2>/dev/null | wc -l)
        ok "Copiados $_n JSON de $subfolder/"
        COPIED=$(( COPIED + _n ))
    else
        info "Carpeta $subfolder/ no existe — omitiendo"
    fi
done

ok "Total copiados: $COPIED archivos"

# ── 5. COPIAR Y EJECUTAR n8n_importer.js ──────────────────────────────────────
hdr "IMPORTANDO WORKFLOWS EN n8n"

IMPORTER_SRC="$SCRIPT_DIR/n8n_importer.js"

if [ ! -f "$IMPORTER_SRC" ]; then
    for alt in \
        "/opt/n8n/workflows_import/scripts/n8n_importer.js" \
        "$(dirname "$SCRIPT_DIR")/scripts/n8n_importer.js"; do
        [ -f "$alt" ] && IMPORTER_SRC="$alt" && break
    done
fi

if [ ! -f "$IMPORTER_SRC" ]; then
    die "n8n_importer.js no encontrado. Verifica que el repo esté completo."
fi

docker cp "$IMPORTER_SRC" "$N8N_CONTAINER:/tmp/n8n_importer.js"
ok "n8n_importer.js copiado al contenedor"

info "Ejecutando importador (puede tardar 60-120 segundos)..."
echo ""

docker exec \
    -e N8N_API_KEY="$N8N_API_KEY" \
    -e WF_DIR="$CONTAINER_WF_DIR" \
    -e BOT_TOKEN="${BOT_TOKEN:-}" \
    -e CHAT_ID="${CHAT_ID:-0}" \
    "$N8N_CONTAINER" \
    node /tmp/n8n_importer.js

_exit=$?

echo ""
if [ $_exit -eq 0 ]; then
    ok "Importador finalizado con éxito"
else
    err "Importador terminó con código $_exit"
    exit $_exit
fi

# ── 6. VERIFICACIÓN FINAL ─────────────────────────────────────────────────────
hdr "VERIFICACIÓN FINAL"

_final_script='
const http = require("http");
let data = "";
const req = http.request({
  hostname:"localhost", port:5678,
  path:"/api/v1/workflows?active=true&limit=50",
  method:"GET",
  headers:{"X-N8N-API-KEY": process.env.N8N_API_KEY}
}, res => {
  res.on("data", c => data += c);
  res.on("end", () => {
    try {
      const wfs = JSON.parse(data).data || [];
      process.stdout.write(wfs.length + " activos:\n");
      wfs.forEach(w => process.stdout.write("  ✓ " + w.name + "\n"));
    } catch(e) { process.stdout.write("? (error leyendo respuesta)\n"); }
  });
});
req.on("error", () => process.stdout.write("? (error de red)\n"));
req.end();
'

echo ""
docker exec -e N8N_API_KEY="$N8N_API_KEY" "$N8N_CONTAINER" \
    node -e "$_final_script" 2>/dev/null || true

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  BOOTSTRAP COMPLETADO                        ║"
printf "║  %-44s║\n" "$(date '+%Y-%m-%d %H:%M:%S')"
echo "╠══════════════════════════════════════════════╣"
echo "║  Próximo artículo: ~20 minutos               ║"
echo "║  Panel: http://161.97.184.148:5678           ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
