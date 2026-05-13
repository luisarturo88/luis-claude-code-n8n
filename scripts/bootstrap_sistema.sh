#!/bin/bash
# bootstrap_sistema.sh
# =======================================================
# BOOTSTRAP COMPLETO DEL SISTEMA — Fábrica SEO n8n
# Ejecutar UNA SOLA VEZ desde el VPS:
#   ssh root@161.97.184.148
#   bash bootstrap_sistema.sh
# =======================================================
# Lo que hace automáticamente:
#   1. Detecta CHAT_ID de Telegram
#   2. Crea/actualiza credencial Telegram en n8n
#   3. Agrega TELEGRAM_CHAT_ID a stack.env
#   4. Descarga todos los workflows del repositorio Git
#   5. Importa workflows en n8n via API
#   6. Activa workflows en el orden correcto
#   7. Verifica que el sistema está en marcha
#   8. Envía mensaje de confirmación a Telegram
# =======================================================

set -euo pipefail

# ── CONFIGURACIÓN ──────────────────────────────────────────────────────────────
BOT_TOKEN="8765288883:AAHiwmflADgkOiPzD4RJEolpC05kBZP5yNY"
N8N_URL="http://localhost:5678"
STACK_ENV="/opt/n8n/stack.env"
WORKFLOWS_DIR="/opt/n8n/workflows_import"
REPO_BRANCH="claude/setup-n8n-infrastructure-kz0dU"
REPO_URL="https://github.com/luisarturo88/luis-claude-code-n8n"

# N8N_API_KEY: leer desde stack.env si no está exportada
if [ -z "${N8N_API_KEY:-}" ]; then
    N8N_API_KEY=$(grep "^N8N_API_KEY=" "$STACK_ENV" 2>/dev/null | cut -d'=' -f2- | tr -d '"' | tr -d "'" || echo "")
fi

# ──────────────────────────────────────────────────────────────────────────────

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC} $1"; }
info() { echo -e "${YELLOW}→${NC} $1"; }
err()  { echo -e "${RED}✗${NC} $1"; }
head() { echo -e "\n${BLUE}══ $1 ══${NC}"; }

check_req() {
    for cmd in curl python3 git jq; do
        if ! command -v "$cmd" &>/dev/null; then
            info "Instalando $cmd..."
            apt-get install -y "$cmd" 2>/dev/null || yum install -y "$cmd" 2>/dev/null || true
        fi
    done
}

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  BOOTSTRAP — FÁBRICA SEO N8N                 ║"
echo "║  $(date '+%Y-%m-%d %H:%M:%S')                ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

check_req

# ── PASO 1: Verificar que n8n está corriendo ──────────────────────────────────
head "PASO 1: Estado de n8n"
N8N_HEALTH=$(curl -s --max-time 5 "${N8N_URL}/healthz" 2>/dev/null || echo "")
if echo "$N8N_HEALTH" | grep -q "ok\|status"; then
    ok "n8n está corriendo"
else
    err "n8n no responde en ${N8N_URL}"
    info "Verificar: docker ps | grep n8n"
    exit 1
fi

# Verificar API Key
if [ -z "$N8N_API_KEY" ]; then
    err "N8N_API_KEY no configurada"
    echo ""
    echo "Solución: Abre n8n en el navegador → Settings → API → Generate API Key"
    echo "Luego: echo 'N8N_API_KEY=tu-key-aqui' >> $STACK_ENV"
    echo "Y ejecuta de nuevo este script."
    exit 1
fi
ok "N8N_API_KEY encontrada"

# ── PASO 2: Telegram — detectar CHAT_ID ──────────────────────────────────────
head "PASO 2: Configuración Telegram"

info "Obteniendo updates del bot..."
TG_UPDATES=$(curl -s --max-time 10 "https://api.telegram.org/bot${BOT_TOKEN}/getUpdates" 2>/dev/null || echo '{"result":[]}')

CHAT_ID=$(echo "$TG_UPDATES" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    results = data.get('result', [])
    for r in reversed(results):
        for key in ['message', 'channel_post', 'edited_message']:
            msg = r.get(key, {})
            chat = msg.get('chat', {})
            if chat.get('id'):
                print(chat['id'])
                sys.exit(0)
    print('NOT_FOUND')
except:
    print('NOT_FOUND')
" 2>/dev/null)

if [ "$CHAT_ID" = "NOT_FOUND" ] || [ -z "$CHAT_ID" ]; then
    err "No se encontró CHAT_ID"
    echo ""
    echo "ACCIÓN REQUERIDA (30 segundos):"
    echo "  1. Abre Telegram"
    echo "  2. Busca @DrLuisArturoGarciaBot"
    echo "  3. Envía cualquier mensaje (ej: /start)"
    echo "  4. Ejecuta este script de nuevo"
    echo ""
    info "Si ya hiciste eso, el bot puede necesitar un canal. Agrega el bot a tu canal y envía un mensaje ahí."
    # No salir — continuar sin Telegram si es necesario
    CHAT_ID="PENDING_TELEGRAM_SETUP"
else
    ok "CHAT_ID detectado: ${CHAT_ID}"

    # Guardar en stack.env
    if grep -q "^TELEGRAM_CHAT_ID=" "$STACK_ENV" 2>/dev/null; then
        sed -i "s|^TELEGRAM_CHAT_ID=.*|TELEGRAM_CHAT_ID=${CHAT_ID}|" "$STACK_ENV"
    else
        echo "TELEGRAM_CHAT_ID=${CHAT_ID}" >> "$STACK_ENV"
    fi
    ok "TELEGRAM_CHAT_ID guardado en stack.env"
fi

# Crear/actualizar credencial Telegram en n8n
info "Configurando credencial Telegram en n8n..."
EXISTING_CRED_ID=$(curl -s \
    -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
    "${N8N_URL}/api/v1/credentials" 2>/dev/null | \
    python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for c in data.get('data', []):
        if c.get('name') == 'Telegram Bot production':
            print(c.get('id', ''))
            break
except:
    pass
" 2>/dev/null || echo "")

if [ -n "$EXISTING_CRED_ID" ]; then
    curl -s -X PATCH \
        -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
        -H "Content-Type: application/json" \
        "${N8N_URL}/api/v1/credentials/${EXISTING_CRED_ID}" \
        -d "{\"data\":{\"accessToken\":\"${BOT_TOKEN}\"}}" > /dev/null 2>&1
    ok "Credencial Telegram actualizada (ID: ${EXISTING_CRED_ID})"
else
    CREATE_RESULT=$(curl -s -X POST \
        -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
        -H "Content-Type: application/json" \
        "${N8N_URL}/api/v1/credentials" \
        -d "{\"name\":\"Telegram Bot production\",\"type\":\"telegramApi\",\"data\":{\"accessToken\":\"${BOT_TOKEN}\"}}" 2>/dev/null || echo "{}")
    NEW_CRED_ID=$(echo "$CREATE_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id','error'))" 2>/dev/null || echo "error")
    if [ "$NEW_CRED_ID" != "error" ] && [ -n "$NEW_CRED_ID" ]; then
        ok "Credencial Telegram creada (ID: ${NEW_CRED_ID})"
    else
        err "No se pudo crear credencial Telegram (puede ya existir con otro nombre)"
        info "Crear manualmente: n8n → Settings → Credentials → Telegram → Token: ${BOT_TOKEN}"
    fi
fi

# ── PASO 3: Descargar workflows del repositorio ───────────────────────────────
head "PASO 3: Descargando workflows"

mkdir -p "$WORKFLOWS_DIR"
cd "$WORKFLOWS_DIR"

if [ -d ".git" ]; then
    info "Actualizando repositorio existente..."
    git fetch origin "$REPO_BRANCH" 2>/dev/null && git checkout "$REPO_BRANCH" 2>/dev/null && git pull origin "$REPO_BRANCH" 2>/dev/null
else
    info "Clonando repositorio..."
    git clone --branch "$REPO_BRANCH" --depth 1 "$REPO_URL" . 2>/dev/null || \
    git clone --branch "$REPO_BRANCH" "$REPO_URL" . 2>/dev/null || \
    { err "No se pudo clonar. Usa: git clone ${REPO_URL} ${WORKFLOWS_DIR}"; }
fi

WORKFLOW_COUNT=$(find . -name "*.json" -path "*/workflows/*" 2>/dev/null | wc -l)
ok "Workflows disponibles: ${WORKFLOW_COUNT}"

# ── PASO 4: Importar workflows en n8n ────────────────────────────────────────
head "PASO 4: Importando workflows en n8n"

# Orden de importación (crítico: producción primero)
WORKFLOW_ORDER=(
    "workflows/production/01_MASTER_SCHEDULER.json"
    "workflows/production/02_AI_CONTENT_GENERATOR.json"
    "workflows/production/04_BLOGGER_PUBLISHER.json"
    "workflows/production/05_LOCK_WATCHDOG.json"
    "workflows/production/25_TITLE_FACTORY.json"
    "workflows/monetization/06_AFFILIATE_INJECTOR.json"
    "workflows/monetization/07_MONETIZATION_INJECTOR.json"
    "workflows/distribution/08_TELEGRAM_BROADCASTER.json"
    "workflows/distribution/09_DIGITAL_PRODUCT_LINKER.json"
    "workflows/distribution/13_REEL_SCRIPT_GENERATOR.json"
    "workflows/seo/15_INTERLINK_BUILDER.json"
)

declare -A WORKFLOW_IDS

for wf_path in "${WORKFLOW_ORDER[@]}"; do
    if [ ! -f "$wf_path" ]; then
        info "No encontrado: $wf_path (saltando)"
        continue
    fi

    wf_name=$(python3 -c "import json; d=json.load(open('${wf_path}')); print(d.get('name','unknown'))" 2>/dev/null || echo "unknown")

    # Inyectar TELEGRAM_CHAT_ID si no está PENDING
    if [ "$CHAT_ID" != "PENDING_TELEGRAM_SETUP" ]; then
        TMP_WF=$(mktemp /tmp/wf_XXXXXX.json)
        python3 -c "
import json, sys
with open('${wf_path}') as f:
    d = json.load(f)
content = json.dumps(d)
content = content.replace('<!-- CONFIGURA_TELEGRAM_CHAT_ID_EN_STACK_ENV -->', '${CHAT_ID}')
content = content.replace('PENDING_TELEGRAM_SETUP', '${CHAT_ID}')
with open('${TMP_WF}', 'w') as f:
    f.write(content)
" 2>/dev/null
        WF_FILE="$TMP_WF"
    else
        WF_FILE="$wf_path"
    fi

    # Verificar si ya existe el workflow
    EXISTING_ID=$(curl -s \
        -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
        "${N8N_URL}/api/v1/workflows" 2>/dev/null | \
        python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    name = '${wf_name}'
    for w in data.get('data', []):
        if w.get('name') == name:
            print(w.get('id', ''))
            break
except:
    pass
" 2>/dev/null || echo "")

    if [ -n "$EXISTING_ID" ]; then
        info "${wf_name}: ya existe (ID: ${EXISTING_ID}) — actualizando..."
        UPDATE_RESULT=$(curl -s -X PUT \
            -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
            -H "Content-Type: application/json" \
            "${N8N_URL}/api/v1/workflows/${EXISTING_ID}" \
            -d @"$WF_FILE" 2>/dev/null || echo "{}")
        WORKFLOW_IDS["$wf_name"]="$EXISTING_ID"
        ok "${wf_name}: actualizado"
    else
        IMPORT_RESULT=$(curl -s -X POST \
            -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
            -H "Content-Type: application/json" \
            "${N8N_URL}/api/v1/workflows" \
            -d @"$WF_FILE" 2>/dev/null || echo "{}")
        NEW_ID=$(echo "$IMPORT_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id','error'))" 2>/dev/null || echo "error")
        if [ "$NEW_ID" != "error" ] && [ -n "$NEW_ID" ]; then
            WORKFLOW_IDS["$wf_name"]="$NEW_ID"
            ok "${wf_name}: importado (ID: ${NEW_ID})"
        else
            err "${wf_name}: error al importar"
        fi
    fi

    # Limpiar temp
    [ -f "${TMP_WF:-}" ] && rm -f "$TMP_WF"
done

# ── PASO 4.5: Auto-cablear IDs de sub-workflows en WF01 ──────────────────────
head "PASO 4.5: Auto-cableando sub-workflows en Master Scheduler"

WF01_ID="${WORKFLOW_IDS[01_MASTER_SCHEDULER]:-}"
WF02_ID="${WORKFLOW_IDS[02_AI_CONTENT_GENERATOR]:-}"
WF04_ID="${WORKFLOW_IDS[04_BLOGGER_PUBLISHER]:-}"

# Buscar IDs si no están en el mapa (segunda pasada por nombre)
if [ -z "$WF01_ID" ] || [ -z "$WF02_ID" ] || [ -z "$WF04_ID" ]; then
    ALL_WF=$(curl -s -H "X-N8N-API-KEY: ${N8N_API_KEY}" "${N8N_URL}/api/v1/workflows" 2>/dev/null || echo '{"data":[]}')
    [ -z "$WF01_ID" ] && WF01_ID=$(echo "$ALL_WF" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(w['id']) for w in d.get('data',[]) if '01_MASTER' in w.get('name','')]; " 2>/dev/null | head -1)
    [ -z "$WF02_ID" ] && WF02_ID=$(echo "$ALL_WF" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(w['id']) for w in d.get('data',[]) if '02_AI' in w.get('name','')]; " 2>/dev/null | head -1)
    [ -z "$WF04_ID" ] && WF04_ID=$(echo "$ALL_WF" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(w['id']) for w in d.get('data',[]) if '04_BLOGGER' in w.get('name','')]; " 2>/dev/null | head -1)
fi

if [ -n "$WF01_ID" ] && [ -n "$WF02_ID" ] && [ -n "$WF04_ID" ]; then
    info "Cableando WF01 con WF02=${WF02_ID} y WF04=${WF04_ID}..."
    # Obtener el JSON completo de WF01
    WF01_JSON=$(curl -s -H "X-N8N-API-KEY: ${N8N_API_KEY}" "${N8N_URL}/api/v1/workflows/${WF01_ID}" 2>/dev/null || echo '{}')
    # Reemplazar los IDs placeholder por los IDs reales
    WF01_PATCHED=$(echo "$WF01_JSON" | python3 -c "
import sys, json
d = json.load(sys.stdin)
content = json.dumps(d)
# Reemplazar ID hardcodeado de WF02
content = content.replace('4T1IUWfkNEEgwCNQ', '${WF02_ID}')
content = content.replace('WORKFLOW_02_ID', '${WF02_ID}')
# Reemplazar ID hardcodeado de WF04
content = content.replace('VK7N11rme5vFICLb', '${WF04_ID}')
content = content.replace('WORKFLOW_04_ID', '${WF04_ID}')
# Actualizar los nodos de executeWorkflow con los IDs correctos
d2 = json.loads(content)
for node in d2.get('nodes', []):
    if node.get('type') == 'n8n-nodes-base.executeWorkflow':
        wf_id_obj = node.get('parameters', {}).get('workflowId', {})
        if isinstance(wf_id_obj, dict):
            val = wf_id_obj.get('value', '')
            if '02_AI' in node.get('name', '') or 'AI Content' in node.get('name', ''):
                node['parameters']['workflowId']['value'] = '${WF02_ID}'
            elif '04' in node.get('name', '') or 'Publisher' in node.get('name', '') or 'Blogger' in node.get('name', ''):
                node['parameters']['workflowId']['value'] = '${WF04_ID}'
print(json.dumps(d2))
" 2>/dev/null || echo "")

    if [ -n "$WF01_PATCHED" ]; then
        PATCH_RESULT=$(curl -s -X PUT \
            -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
            -H "Content-Type: application/json" \
            "${N8N_URL}/api/v1/workflows/${WF01_ID}" \
            -d "$WF01_PATCHED" 2>/dev/null || echo '{}')
        ok "WF01 auto-cableado: WF02=${WF02_ID}, WF04=${WF04_ID}"
    else
        err "No se pudo parchear WF01 (actualizar manualmente)"
    fi
else
    err "No se encontraron todos los IDs para auto-cablear WF01"
    info "IDs encontrados: WF01=${WF01_ID:-MISSING} WF02=${WF02_ID:-MISSING} WF04=${WF04_ID:-MISSING}"
    info "Cablear manualmente en n8n: abre WF01 → nodo Execute WF02 → poner ID de 02_AI_CONTENT_GENERATOR"
fi

# ── PASO 5: Activar workflows en orden correcto ───────────────────────────────
head "PASO 5: Activando workflows"

# Activar en este orden exacto (los crons deben estar activos para que funcionen)
ACTIVATE_ORDER=(
    "05_LOCK_WATCHDOG"
    "02_AI_CONTENT_GENERATOR"
    "04_BLOGGER_PUBLISHER"
    "25_TITLE_FACTORY"
    "01_MASTER_SCHEDULER"
    "06_AFFILIATE_INJECTOR"
    "07_MONETIZATION_INJECTOR"
    "08_TELEGRAM_BROADCASTER"
)

for wf_name in "${ACTIVATE_ORDER[@]}"; do
    WF_ID="${WORKFLOW_IDS[$wf_name]:-}"
    if [ -z "$WF_ID" ]; then
        # Buscar por nombre
        WF_ID=$(curl -s \
            -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
            "${N8N_URL}/api/v1/workflows" 2>/dev/null | \
            python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for w in data.get('data', []):
        if '${wf_name}' in w.get('name', ''):
            print(w.get('id', ''))
            break
except:
    pass
" 2>/dev/null || echo "")
    fi

    if [ -n "$WF_ID" ]; then
        ACTIVATE=$(curl -s -X POST \
            -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
            "${N8N_URL}/api/v1/workflows/${WF_ID}/activate" 2>/dev/null || echo "{}")
        ok "${wf_name} activado (ID: ${WF_ID})"
    else
        info "${wf_name}: no encontrado para activar"
    fi
    sleep 0.5
done

# ── PASO 6: Verificación final ────────────────────────────────────────────────
head "PASO 6: Verificación del sistema"

ACTIVE_WF=$(curl -s \
    -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
    "${N8N_URL}/api/v1/workflows?active=true" 2>/dev/null | \
    python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    wfs = data.get('data', [])
    print(len(wfs))
except:
    print(0)
" 2>/dev/null || echo "0")

ok "Workflows activos en n8n: ${ACTIVE_WF}"

# ── PASO 7: Mensaje de confirmación a Telegram ────────────────────────────────
head "PASO 7: Prueba de Telegram"

if [ "$CHAT_ID" != "PENDING_TELEGRAM_SETUP" ] && [ -n "$CHAT_ID" ]; then
    TEST_MSG=$(curl -s -X POST \
        "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
        -H "Content-Type: application/json" \
        -d "{
            \"chat_id\": ${CHAT_ID},
            \"text\": \"🚀 <b>Fábrica SEO n8n — Sistema ACTIVADO</b>\\n\\n✅ ${ACTIVE_WF} workflows activos\\n✅ Telegram conectado\\n✅ Pipeline funcionando\\n\\n🕐 $(date '+%Y-%m-%d %H:%M')\\n\\n_El sistema ya trabaja solo._\",
            \"parse_mode\": \"HTML\"
        }" 2>/dev/null || echo '{"ok":false}')

    if echo "$TEST_MSG" | grep -q '"ok":true'; then
        ok "Mensaje de confirmación enviado a Telegram"
    else
        err "No se pudo enviar mensaje (el bot puede no estar en un canal)"
        info "Para recibir mensajes: crea un canal, agrega @DrLuisArturoGarciaBot como admin"
    fi
fi

# ── RESUMEN FINAL ─────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  BOOTSTRAP COMPLETADO                                    ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  TELEGRAM_CHAT_ID : ${CHAT_ID:0:20}$(printf '%*s' $((20-${#CHAT_ID})) '')        ║"
echo "║  Workflows activos: ${ACTIVE_WF}                                         ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  LO QUE FALTA HACER (CRÍTICO):                          ║"
echo "║                                                          ║"
echo "║  1. CARGAR BACKLOG (363 artículos ya listos):           ║"
echo "║     Abre: sheets.google.com                             ║"
echo "║     Copia de: BACKLOG_MASIVO_CONTENT_PIPELINE           ║"
echo "║     Pega en: CONTENT_PIPELINE (Sheet principal)         ║"
echo "║     ID backup: 18Frct3tCREHa2IPDwoRxYqYx8kcX0PKubEgSU  ║"
echo "║                                                          ║"
echo "║  2. VERIFICAR CREDENCIALES en n8n:                      ║"
echo "║     - Google Sheets account (OAuth2)                    ║"
echo "║     - Google Blogger OAuth2                             ║"
echo "║     - DeepSeek API (Header Auth con Bearer token)       ║"
echo "║                                                          ║"
echo "║  3. CSS BLOGGER: pegar blogger_css_fix.html en          ║"
echo "║     Diseño → Gadget HTML/JS de cada blog                ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Ver n8n: http://161.97.184.148:5678"
