#!/bin/bash
# bootstrap_sistema.sh — Fábrica SEO n8n
# Ejecutar desde el VPS: bash /opt/n8n/workflows_import/scripts/bootstrap_sistema.sh

set -euo pipefail

# ── CONFIGURACIÓN ─────────────────────────────────────────────────────────────
STACK_ENV="/opt/n8n/stack.env"
WORKFLOWS_DIR="/opt/n8n/workflows_import"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC} $1"; }
info() { echo -e "${YELLOW}→${NC} $1"; }
err()  { echo -e "${RED}✗${NC} $1"; }
hdr()  { echo -e "\n${BLUE}══ $1 ══${NC}"; }
die()  { err "$1"; exit 1; }

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  BOOTSTRAP — FÁBRICA SEO N8N                 ║"
printf "║  %-44s║\n" "$(date '+%Y-%m-%d %H:%M:%S')"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── 1. LEER API KEY ────────────────────────────────────────────────────────────
hdr "CONFIGURACIÓN"

N8N_API_KEY=""
if [ -f "$STACK_ENV" ]; then
    N8N_API_KEY=$(grep -E '^N8N_API_KEY=' "$STACK_ENV" 2>/dev/null | cut -d= -f2- | tr -d '"' | tr -d "'")
fi

if [ -z "$N8N_API_KEY" ]; then
    # Buscar en variables de entorno del sistema
    N8N_API_KEY="${N8N_API_KEY:-}"
fi

if [ -z "$N8N_API_KEY" ]; then
    echo ""
    err "N8N_API_KEY no encontrada en $STACK_ENV"
    echo ""
    echo "Solución: añade esta línea a $STACK_ENV:"
    echo "  N8N_API_KEY=<tu_clave>"
    echo ""
    echo "Puedes generarla en n8n → Settings → API → Create API Key"
    echo ""
    read -r -p "¿Quieres introducir la clave ahora? (pégala y pulsa Enter): " N8N_API_KEY
    [ -z "$N8N_API_KEY" ] && die "API key requerida para continuar"
fi

ok "N8N_API_KEY cargada (${#N8N_API_KEY} chars)"

# Leer Telegram del stack.env (opcional)
BOT_TOKEN=""
CHAT_ID="0"
if [ -f "$STACK_ENV" ]; then
    BOT_TOKEN=$(grep -E '^BOT_TOKEN=' "$STACK_ENV" 2>/dev/null | cut -d= -f2- | tr -d '"' | tr -d "'" || true)
    CHAT_ID=$(grep -E '^CHAT_ID=' "$STACK_ENV" 2>/dev/null | cut -d= -f2- | tr -d '"' | tr -d "'" || true)
fi

# ── 2. DETECTAR CONTENEDOR n8n ─────────────────────────────────────────────────
hdr "DETECTANDO DOCKER"

# Buscar contenedor con "n8n" en el nombre que esté corriendo
N8N_CONTAINER=""

# Intentar primero el nombre por defecto
for candidate in n8n-n8n-1 n8n_n8n_1 n8n n8n-app-1; do
    if docker inspect "$candidate" &>/dev/null 2>&1; then
        STATUS=$(docker inspect --format='{{.State.Status}}' "$candidate" 2>/dev/null || echo "")
        if [ "$STATUS" = "running" ]; then
            N8N_CONTAINER="$candidate"
            break
        fi
    fi
done

# Si no encontramos por nombre, buscar por imagen
if [ -z "$N8N_CONTAINER" ]; then
    N8N_CONTAINER=$(docker ps --format '{{.Names}}' 2>/dev/null | grep -i n8n | head -1 || true)
fi

if [ -z "$N8N_CONTAINER" ]; then
    die "No se encontró ningún contenedor n8n corriendo. Ejecuta 'docker ps' para verificar."
fi

ok "Contenedor n8n: $N8N_CONTAINER"

# Verificar que node esté disponible dentro del contenedor
if ! docker exec "$N8N_CONTAINER" node --version &>/dev/null; then
    die "node no disponible dentro de $N8N_CONTAINER"
fi
NODE_VER=$(docker exec "$N8N_CONTAINER" node --version)
ok "Node.js en contenedor: $NODE_VER"

# ── 3. VERIFICAR n8n RESPONDE ──────────────────────────────────────────────────
hdr "VERIFICANDO n8n API"

# Probar desde dentro del contenedor (no desde el host)
API_STATUS=$(docker exec -e N8N_API_KEY="$N8N_API_KEY" "$N8N_CONTAINER" \
    node -e "
const http = require('http');
const req = http.request({
  hostname:'localhost', port:5678,
  path:'/api/v1/workflows?limit=1',
  method:'GET',
  headers:{'X-N8N-API-KEY': process.env.N8N_API_KEY}
}, res => {
  process.stdout.write(String(res.statusCode));
  res.resume();
});
req.on('error', () => process.stdout.write('0'));
req.end();
" 2>/dev/null || echo "0")

if [ "$API_STATUS" = "200" ]; then
    ok "n8n API responde correctamente (HTTP 200)"
elif [ "$API_STATUS" = "401" ]; then
    die "API Key inválida. Genera una nueva en n8n → Settings → API"
elif [ "$API_STATUS" = "0" ]; then
    die "n8n no responde en localhost:5678. Verifica que esté corriendo."
else
    info "n8n responde con HTTP $API_STATUS — continuando de todos modos"
fi

# ── 4. PREPARAR DIRECTORIO DE WORKFLOWS EN EL CONTENEDOR ──────────────────────
hdr "COPIANDO WORKFLOWS AL CONTENEDOR"

CONTAINER_WF_DIR="/tmp/n8n_bootstrap"

# Crear estructura dentro del contenedor
docker exec "$N8N_CONTAINER" mkdir -p \
    "$CONTAINER_WF_DIR/production" \
    "$CONTAINER_WF_DIR/monetization" \
    "$CONTAINER_WF_DIR/distribution" \
    "$CONTAINER_WF_DIR/seo"

ok "Directorios creados en contenedor: $CONTAINER_WF_DIR"

# Detectar directorio de workflows en el host
WF_HOST_DIR=""
for candidate in \
    "$WORKFLOWS_DIR/workflows" \
    "$SCRIPT_DIR/../workflows" \
    "/opt/n8n/workflows_import/workflows" \
    "/opt/n8n/workflows"; do
    if [ -d "$candidate" ]; then
        WF_HOST_DIR="$(realpath "$candidate")"
        break
    fi
done

if [ -z "$WF_HOST_DIR" ]; then
    die "No se encontró el directorio de workflows. Buscado en: $WORKFLOWS_DIR/workflows, $SCRIPT_DIR/../workflows"
fi

ok "Workflows en host: $WF_HOST_DIR"

# Copiar cada carpeta de workflows
COPIED=0
for subfolder in production monetization distribution seo; do
    SRC="$WF_HOST_DIR/$subfolder"
    if [ -d "$SRC" ]; then
        # docker cp copia el contenido de la carpeta al contenedor
        docker cp "$SRC/." "$N8N_CONTAINER:$CONTAINER_WF_DIR/$subfolder/" 2>/dev/null || true
        COUNT=$(ls "$SRC"/*.json 2>/dev/null | wc -l || echo 0)
        ok "Copiados $COUNT JSONs de $subfolder/"
        COPIED=$((COPIED + COUNT))
    else
        info "Carpeta $subfolder/ no existe en host — omitiendo"
    fi
done

ok "Total archivos copiados: $COPIED"

# ── 5. COPIAR Y EJECUTAR n8n_importer.js ──────────────────────────────────────
hdr "IMPORTANDO WORKFLOWS EN n8n"

IMPORTER_SRC="$SCRIPT_DIR/n8n_importer.js"
if [ ! -f "$IMPORTER_SRC" ]; then
    # Buscar alternativas
    for alt in \
        "$WORKFLOWS_DIR/scripts/n8n_importer.js" \
        "/opt/n8n/workflows_import/scripts/n8n_importer.js"; do
        [ -f "$alt" ] && IMPORTER_SRC="$alt" && break
    done
fi

if [ ! -f "$IMPORTER_SRC" ]; then
    die "No se encontró n8n_importer.js. Verifica que el repositorio esté completo."
fi

# Copiar importer al contenedor
docker cp "$IMPORTER_SRC" "$N8N_CONTAINER:/tmp/n8n_importer.js"
ok "n8n_importer.js copiado al contenedor"

info "Ejecutando importador (puede tardar 30-90 segundos)..."
echo ""

# Ejecutar el importador con todas las variables necesarias
docker exec \
    -e N8N_API_KEY="$N8N_API_KEY" \
    -e WF_DIR="$CONTAINER_WF_DIR" \
    -e BOT_TOKEN="${BOT_TOKEN:-}" \
    -e CHAT_ID="${CHAT_ID:-0}" \
    "$N8N_CONTAINER" \
    node /tmp/n8n_importer.js

IMPORT_EXIT=$?

echo ""
if [ $IMPORT_EXIT -eq 0 ]; then
    ok "Importador completado exitosamente"
else
    err "El importador terminó con código de salida $IMPORT_EXIT"
    echo "Revisa los mensajes anteriores para identificar el error."
    exit $IMPORT_EXIT
fi

# ── 6. VERIFICACIÓN FINAL DESDE EL HOST ───────────────────────────────────────
hdr "VERIFICACIÓN FINAL"

ACTIVE_COUNT=$(docker exec -e N8N_API_KEY="$N8N_API_KEY" "$N8N_CONTAINER" \
    node -e "
const http = require('http');
let data = '';
const req = http.request({
  hostname:'localhost', port:5678,
  path:'/api/v1/workflows?active=true&limit=50',
  method:'GET',
  headers:{'X-N8N-API-KEY': process.env.N8N_API_KEY}
}, res => {
  res.on('data', c => data += c);
  res.on('end', () => {
    try {
      const body = JSON.parse(data);
      process.stdout.write(String((body.data||[]).length));
    } catch { process.stdout.write('?'); }
  });
});
req.on('error', () => process.stdout.write('?'));
req.end();
" 2>/dev/null || echo "?")

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  FÁBRICA SEO — RESULTADO                     ║"
printf "║  Workflows activos: %-25s║\n" "$ACTIVE_COUNT"
printf "║  %-44s║\n" "$(date '+%Y-%m-%d %H:%M:%S')"
echo "╚══════════════════════════════════════════════╝"
echo ""

if [ "$ACTIVE_COUNT" != "?" ] && [ "$ACTIVE_COUNT" -ge 5 ] 2>/dev/null; then
    ok "Sistema productivo. $ACTIVE_COUNT workflows activos."
    echo ""
    echo "El Master Scheduler publicará 1 artículo cada 20 minutos."
    echo "Verifica en: http://161.97.184.148:5678"
else
    info "Verifica manualmente en n8n que los workflows estén activos."
fi

echo ""
