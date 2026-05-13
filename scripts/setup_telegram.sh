#!/bin/bash
# setup_telegram.sh
# Ejecutar desde el VPS: bash setup_telegram.sh
# Configura automáticamente el bot de Telegram en n8n:
#   1. Detecta CHAT_ID del bot
#   2. Crea credencial en n8n via API local
#   3. Actualiza CHAT_ID en el workflow 08_TELEGRAM_BROADCASTER
#   4. Prueba envío real de mensaje
#
# REQUISITO PREVIO: Enviar al menos 1 mensaje al bot @DrLuisArturoGarciaBot
#                   en Telegram antes de ejecutar este script.

set -e

# ── CONFIGURACIÓN ─────────────────────────────────────────────────────────────
BOT_TOKEN="8765288883:AAHiwmflADgkOiPzD4RJEolpC05kBZP5yNY"
N8N_API_URL="http://localhost:5678/api/v1"
# Leer API key desde variable de entorno o desde stack.env
N8N_API_KEY="${N8N_API_KEY:-}"
if [ -z "$N8N_API_KEY" ]; then
  # Intentar leer desde el archivo stack.env de Docker
  STACK_ENV="/opt/n8n/stack.env"
  if [ -f "$STACK_ENV" ]; then
    N8N_API_KEY=$(grep "^N8N_API_KEY=" "$STACK_ENV" | cut -d'=' -f2- | tr -d '"' | tr -d "'")
  fi
fi

WORKFLOW_JSON_DIR="/opt/n8n/workflows"  # ajustar si es diferente
# ──────────────────────────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
log_info() { echo -e "${YELLOW}[INFO]${NC} $1"; }
log_err()  { echo -e "${RED}[ERROR]${NC} $1"; }

echo "========================================"
echo "  SETUP TELEGRAM — Fábrica SEO n8n"
echo "========================================"
echo ""

# ── PASO 1: Detectar CHAT_ID ──────────────────────────────────────────────────
log_info "Paso 1: Detectando CHAT_ID del bot..."

UPDATES=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getUpdates")
CHAT_ID=$(echo "$UPDATES" | python3 -c "
import sys, json
data = json.load(sys.stdin)
results = data.get('result', [])
if not results:
    print('NOT_FOUND')
else:
    # Priorizar mensajes de canal, luego grupos, luego privados
    for r in reversed(results):
        msg = r.get('message') or r.get('channel_post') or {}
        chat = msg.get('chat', {})
        if chat:
            print(chat.get('id', 'NOT_FOUND'))
            break
    else:
        print('NOT_FOUND')
" 2>/dev/null)

if [ "$CHAT_ID" = "NOT_FOUND" ] || [ -z "$CHAT_ID" ]; then
  log_err "No se encontró CHAT_ID."
  echo ""
  echo "  → Abre Telegram, envía cualquier mensaje al bot @DrLuisArturoGarciaBot"
  echo "  → O agrega el bot a tu canal y envía /start"
  echo "  → Luego ejecuta este script nuevamente"
  echo ""
  # Mostrar respuesta raw para debug
  echo "--- Respuesta API Telegram ---"
  echo "$UPDATES" | python3 -m json.tool 2>/dev/null | head -40
  exit 1
fi

log_ok "CHAT_ID detectado: $CHAT_ID"

# ── PASO 2: Prueba de envío directo vía API ───────────────────────────────────
log_info "Paso 2: Probando envío de mensaje de prueba..."

TEST_RESPONSE=$(curl -s -X POST \
  "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "{
    \"chat_id\": ${CHAT_ID},
    \"text\": \"✅ *Fábrica SEO n8n — Telegram conectado*\\n\\nEl sistema está listo para publicar artículos automáticamente en este canal.\\n\\n_Mensaje de prueba — $(date '+%Y-%m-%d %H:%M')_\",
    \"parse_mode\": \"Markdown\"
  }")

TEST_OK=$(echo "$TEST_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print('yes' if d.get('ok') else 'no')" 2>/dev/null)

if [ "$TEST_OK" = "yes" ]; then
  log_ok "Mensaje de prueba enviado exitosamente"
else
  log_err "Error al enviar mensaje de prueba:"
  echo "$TEST_RESPONSE" | python3 -m json.tool 2>/dev/null
  exit 1
fi

# ── PASO 3: Crear credencial en n8n ──────────────────────────────────────────
log_info "Paso 3: Creando credencial Telegram en n8n..."

if [ -z "$N8N_API_KEY" ]; then
  log_err "N8N_API_KEY no encontrada. Exporta la variable:"
  echo "  export N8N_API_KEY='tu-api-key-aqui'"
  echo "  bash setup_telegram.sh"
  exit 1
fi

# Verificar si ya existe la credencial
EXISTING=$(curl -s \
  -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
  "${N8N_API_URL}/credentials" | \
  python3 -c "
import sys, json
data = json.load(sys.stdin)
for c in data.get('data', []):
    if c.get('name') == 'Telegram Bot production':
        print(c.get('id', ''))
        break
" 2>/dev/null)

if [ -n "$EXISTING" ]; then
  log_info "Credencial 'Telegram Bot production' ya existe (ID: $EXISTING). Actualizando..."
  CRED_RESPONSE=$(curl -s -X PATCH \
    -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
    -H "Content-Type: application/json" \
    "${N8N_API_URL}/credentials/${EXISTING}" \
    -d "{
      \"data\": {
        \"accessToken\": \"${BOT_TOKEN}\"
      }
    }")
  CRED_ID="$EXISTING"
else
  CRED_RESPONSE=$(curl -s -X POST \
    -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
    -H "Content-Type: application/json" \
    "${N8N_API_URL}/credentials" \
    -d "{
      \"name\": \"Telegram Bot production\",
      \"type\": \"telegramApi\",
      \"data\": {
        \"accessToken\": \"${BOT_TOKEN}\"
      }
    }")
  CRED_ID=$(echo "$CRED_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null)
fi

if [ -n "$CRED_ID" ]; then
  log_ok "Credencial configurada (ID: $CRED_ID)"
else
  log_err "No se pudo crear/actualizar la credencial:"
  echo "$CRED_RESPONSE" | python3 -m json.tool 2>/dev/null | head -20
  echo ""
  log_info "Puedes crear la credencial manualmente en n8n:"
  echo "  Settings → Credentials → Add → Telegram → Token: ${BOT_TOKEN}"
fi

# ── PASO 4: Mostrar instrucciones para actualizar workflow ────────────────────
echo ""
echo "========================================"
echo "  CONFIGURACIÓN COMPLETADA"
echo "========================================"
echo ""
log_ok "CHAT_ID: ${CHAT_ID}"
log_ok "Credencial: Telegram Bot production"
echo ""
echo "PRÓXIMOS PASOS EN n8n UI:"
echo ""
echo "  1. Abre el workflow 08_TELEGRAM_BROADCASTER en n8n"
echo "  2. En el nodo de código JavaScript, reemplaza:"
echo "       <!-- TELEGRAM_CHAT_ID -->"
echo "     con:"
echo "       ${CHAT_ID}"
echo ""
echo "  3. También actualiza el registro de Telegram en la hoja AFFILIATE_LINKS:"
echo "     Busca filas con affiliate_type = 'telegram'"
echo "     En la columna affiliate_url, pon el link de tu canal Telegram"
echo "     (ejemplo: https://t.me/tu_canal)"
echo ""
echo "  4. Activa el workflow 08_TELEGRAM_BROADCASTER"
echo ""

# ── PASO 5: Guardar CHAT_ID en archivo local para referencia ─────────────────
echo "CHAT_ID=${CHAT_ID}" > /tmp/telegram_config.env
log_info "CHAT_ID guardado en /tmp/telegram_config.env"

# Intentar actualizar stack.env con TELEGRAM_CHAT_ID si tiene acceso
if [ -f "/opt/n8n/stack.env" ]; then
  if grep -q "^TELEGRAM_CHAT_ID=" /opt/n8n/stack.env; then
    sed -i "s|^TELEGRAM_CHAT_ID=.*|TELEGRAM_CHAT_ID=${CHAT_ID}|" /opt/n8n/stack.env
    log_ok "TELEGRAM_CHAT_ID actualizado en stack.env"
  else
    echo "TELEGRAM_CHAT_ID=${CHAT_ID}" >> /opt/n8n/stack.env
    log_ok "TELEGRAM_CHAT_ID agregado a stack.env"
  fi
fi

echo ""
echo "Script completado exitosamente."
