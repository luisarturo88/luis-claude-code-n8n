#!/bin/bash
# bootstrap_sistema.sh — Fábrica SEO n8n
# Ejecutar desde el VPS: bash /opt/n8n/workflows_import/scripts/bootstrap_sistema.sh

set -euo pipefail

# ── CONFIGURACIÓN ─────────────────────────────────────────────────────────────
BOT_TOKEN="8765288883:AAHiwmflADgkOiPzD4RJEolpC05kBZP5yNY"
STACK_ENV="/opt/n8n/stack.env"
WORKFLOWS_DIR="/opt/n8n/workflows_import"
# Nombre del contenedor n8n (ajustar si es diferente)
N8N_CONTAINER="${N8N_CONTAINER:-n8n-n8n-1}"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
ok()    { echo -e "${GREEN}✓${NC} $1"; }
info()  { echo -e "${YELLOW}→${NC} $1"; }
err()   { echo -e "${RED}✗${NC} $1"; }
hdr()   { echo -e "\n${BLUE}══ $1 ══${NC}"; }
die()   { err "$1"; exit 1; }

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  BOOTSTRAP — FÁBRICA SEO N8N                 ║"
printf "║  %-44s║\n" "$(date '+%Y-%m-%d %H:%M:%S')"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── FUNCIÓN: llamar n8n API (usa docker exec + python3 dentro del contenedor) ─
# Todos los requests van a través del contenedor para evitar problemas de red del host
n8n_api() {
    local method="$1"   # GET, POST, PUT, PATCH
    local path="$2"     # /api/v1/workflows
    local data="${3:-}" # JSON body (opcional)
    local api_key="$4"

    if [ -n "$data" ]; then
        docker exec "$N8N_CONTAINER" python3 -c "
import urllib.request, urllib.error, json, sys
req = urllib.request.Request(
    'http://localhost:5678${path}',
    method='${method}',
    data='${data}'.encode() if '${data}' else None,
    headers={'X-N8N-API-KEY': '${api_key}', 'Content-Type': 'application/json'}
)
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        print(r.read().decode())
except urllib.error.HTTPError as e:
    print(json.dumps({'error': str(e), 'code': e.code, 'body': e.read().decode()[:300]}))
except Exception as e:
    print(json.dumps({'error': str(e)}))
" 2>/dev/null
    else
        docker exec "$N8N_CONTAINER" python3 -c "
import urllib.request, urllib.error, json, sys
req = urllib.request.Request(
    'http://localhost:5678${path}',
    method='${method}',
    headers={'X-N8N-API-KEY': '${api_key}', 'Content-Type': 'application/json'}
)
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        print(r.read().decode())
except urllib.error.HTTPError as e:
    print(json.dumps({'error': str(e), 'code': e.code, 'body': e.read().decode()[:300]}))
except Exception as e:
    print(json.dumps({'error': str(e)}))
" 2>/dev/null
    fi
}

# ── FUNCIÓN: escapar JSON para shell ─────────────────────────────────────────
json_escape() {
    python3 -c "import json,sys; print(json.dumps(sys.stdin.read()))" <<< "$1"
}

# ── PASO 1: Verificar contenedor Docker ──────────────────────────────────────
hdr "PASO 1: Verificar n8n en Docker"

# Detectar nombre real del contenedor si no es el default
if ! docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^${N8N_CONTAINER}$"; then
    DETECTED=$(docker ps --format '{{.Names}}' 2>/dev/null | grep -i "n8n" | head -1 || echo "")
    if [ -n "$DETECTED" ]; then
        N8N_CONTAINER="$DETECTED"
        info "Contenedor detectado: ${N8N_CONTAINER}"
    else
        die "No se encontró ningún contenedor n8n corriendo. Ejecuta: docker ps"
    fi
fi
ok "Contenedor n8n: ${N8N_CONTAINER}"

# Verificar que n8n responde via docker exec (método confiable)
N8N_RESPONSE=$(docker exec "$N8N_CONTAINER" python3 -c "
import urllib.request
try:
    r = urllib.request.urlopen('http://localhost:5678/', timeout=10)
    print('ok:' + str(r.status))
except Exception as e:
    print('fail:' + str(e))
" 2>/dev/null || echo "fail:docker_error")

if echo "$N8N_RESPONSE" | grep -q "^ok:"; then
    ok "n8n responde (HTTP $(echo $N8N_RESPONSE | cut -d: -f2))"
else
    die "n8n no responde dentro del contenedor: ${N8N_RESPONSE}"
fi

# ── PASO 2: Leer N8N_API_KEY ─────────────────────────────────────────────────
hdr "PASO 2: API Key de n8n"

if [ -z "${N8N_API_KEY:-}" ]; then
    N8N_API_KEY=$(grep "^N8N_API_KEY=" "$STACK_ENV" 2>/dev/null | cut -d'=' -f2- | tr -d '"' | tr -d "'" || echo "")
fi

if [ -z "$N8N_API_KEY" ]; then
    echo ""
    err "N8N_API_KEY no configurada."
    echo ""
    echo "  SOLUCIÓN (1 minuto):"
    echo "  1. Abre: http://161.97.184.148:5678"
    echo "  2. Ve a: Settings → API → Generate API Key"
    echo "  3. Copia la clave y ejecuta:"
    echo ""
    echo "     echo 'N8N_API_KEY=TU_CLAVE_AQUI' >> ${STACK_ENV}"
    echo "     bash ${WORKFLOWS_DIR}/scripts/bootstrap_sistema.sh"
    echo ""
    exit 1
fi

# Validar que la API key funciona
API_TEST=$(n8n_api "GET" "/api/v1/workflows?limit=1" "" "$N8N_API_KEY")
if echo "$API_TEST" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if 'data' in d else 1)" 2>/dev/null; then
    ok "API Key válida"
else
    echo ""
    err "API Key inválida o sin permisos. Respuesta: $(echo $API_TEST | head -c 200)"
    echo ""
    echo "  Regenera la API key en n8n → Settings → API"
    echo "  Luego actualiza: sed -i 's/^N8N_API_KEY=.*/N8N_API_KEY=NUEVA_CLAVE/' ${STACK_ENV}"
    exit 1
fi

# ── PASO 3: Telegram — detectar CHAT_ID ──────────────────────────────────────
hdr "PASO 3: Configurar Telegram"

TG_UPDATES=$(docker exec "$N8N_CONTAINER" python3 -c "
import urllib.request, json
try:
    r = urllib.request.urlopen('https://api.telegram.org/bot${BOT_TOKEN}/getUpdates', timeout=10)
    print(r.read().decode())
except Exception as e:
    print('{\"result\":[]}')
" 2>/dev/null || echo '{"result":[]}')

CHAT_ID=$(echo "$TG_UPDATES" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for r in reversed(data.get('result', [])):
        for key in ['message', 'channel_post', 'edited_message']:
            msg = r.get(key, {})
            chat = msg.get('chat', {})
            if chat.get('id'):
                print(chat['id'])
                exit(0)
    print('NOT_FOUND')
except:
    print('NOT_FOUND')
" 2>/dev/null || echo "NOT_FOUND")

if [ "$CHAT_ID" = "NOT_FOUND" ] || [ -z "$CHAT_ID" ]; then
    info "CHAT_ID no encontrado — continúa sin Telegram por ahora"
    info "Acción: envía /start al bot @DrLuisArturoGarciaBot y re-ejecuta el script"
    CHAT_ID="0"
else
    ok "CHAT_ID: ${CHAT_ID}"
    grep -q "^TELEGRAM_CHAT_ID=" "$STACK_ENV" 2>/dev/null \
        && sed -i "s|^TELEGRAM_CHAT_ID=.*|TELEGRAM_CHAT_ID=${CHAT_ID}|" "$STACK_ENV" \
        || echo "TELEGRAM_CHAT_ID=${CHAT_ID}" >> "$STACK_ENV"
fi

# Crear credencial Telegram en n8n
EXISTING_TG=$(n8n_api "GET" "/api/v1/credentials" "" "$N8N_API_KEY")
TG_CRED_ID=$(echo "$EXISTING_TG" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    for c in d.get('data', []):
        if c.get('name') == 'Telegram Bot production':
            print(c.get('id',''))
            exit(0)
    print('')
except:
    print('')
" 2>/dev/null || echo "")

TG_CRED_JSON="{\"name\":\"Telegram Bot production\",\"type\":\"telegramApi\",\"data\":{\"accessToken\":\"${BOT_TOKEN}\"}}"

if [ -n "$TG_CRED_ID" ]; then
    n8n_api "PATCH" "/api/v1/credentials/${TG_CRED_ID}" "{\"data\":{\"accessToken\":\"${BOT_TOKEN}\"}}" "$N8N_API_KEY" > /dev/null
    ok "Credencial Telegram actualizada (ID: ${TG_CRED_ID})"
else
    CREATE=$(n8n_api "POST" "/api/v1/credentials" "$TG_CRED_JSON" "$N8N_API_KEY")
    NEW_TG_ID=$(echo "$CREATE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id','error'))" 2>/dev/null || echo "error")
    [ "$NEW_TG_ID" != "error" ] && ok "Credencial Telegram creada (ID: ${NEW_TG_ID})" || info "Credencial Telegram: ya puede existir con otro nombre"
fi

# ── PASO 4: Importar workflows ────────────────────────────────────────────────
hdr "PASO 4: Importar workflows"

cd "$WORKFLOWS_DIR"

WORKFLOW_ORDER=(
    "workflows/production/05_LOCK_WATCHDOG.json"
    "workflows/production/02_AI_CONTENT_GENERATOR.json"
    "workflows/production/04_BLOGGER_PUBLISHER.json"
    "workflows/production/25_TITLE_FACTORY.json"
    "workflows/monetization/06_AFFILIATE_INJECTOR.json"
    "workflows/monetization/07_MONETIZATION_INJECTOR.json"
    "workflows/distribution/08_TELEGRAM_BROADCASTER.json"
    "workflows/distribution/09_DIGITAL_PRODUCT_LINKER.json"
    "workflows/seo/15_INTERLINK_BUILDER.json"
    "workflows/production/01_MASTER_SCHEDULER.json"
)

declare -A WORKFLOW_IDS

for wf_path in "${WORKFLOW_ORDER[@]}"; do
    [ -f "$wf_path" ] || { info "No existe: $wf_path — saltando"; continue; }

    wf_name=$(python3 -c "import json; print(json.load(open('${wf_path}')).get('name','?'))" 2>/dev/null || echo "?")

    # Inyectar CHAT_ID si corresponde
    WF_JSON=$(python3 -c "
import json, sys
with open('${wf_path}') as f:
    content = f.read()
content = content.replace('PENDING_TELEGRAM_SETUP', '${CHAT_ID}')
print(content)
" 2>/dev/null)

    # Buscar si ya existe
    ALL_WF=$(n8n_api "GET" "/api/v1/workflows?limit=100" "" "$N8N_API_KEY")
    EXISTING_ID=$(echo "$ALL_WF" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    name = '${wf_name}'
    for w in d.get('data', []):
        if w.get('name') == name:
            print(w.get('id',''))
            exit(0)
    print('')
except:
    print('')
" 2>/dev/null || echo "")

    # Escribir JSON limpio a archivo temp dentro del contenedor
    TMP_FILE="/tmp/wf_$(echo $wf_name | tr ' ' '_' | tr -cd 'a-zA-Z0-9_').json"
    echo "$WF_JSON" > "$TMP_FILE"
    docker cp "$TMP_FILE" "${N8N_CONTAINER}:${TMP_FILE}" 2>/dev/null

    if [ -n "$EXISTING_ID" ]; then
        RESULT=$(docker exec "$N8N_CONTAINER" python3 -c "
import urllib.request, json
with open('${TMP_FILE}') as f:
    data = f.read().encode()
req = urllib.request.Request('http://localhost:5678/api/v1/workflows/${EXISTING_ID}',
    method='PUT', data=data,
    headers={'X-N8N-API-KEY': '${N8N_API_KEY}', 'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        d = json.loads(r.read())
        print(d.get('id','?'))
except urllib.error.HTTPError as e:
    print('err:' + str(e.code))
except Exception as e:
    print('err:' + str(e)[:50])
" 2>/dev/null || echo "err:exec")
        WORKFLOW_IDS["$wf_name"]="$EXISTING_ID"
        ok "${wf_name}: actualizado (${EXISTING_ID})"
    else
        RESULT=$(docker exec "$N8N_CONTAINER" python3 -c "
import urllib.request, json
with open('${TMP_FILE}') as f:
    data = f.read().encode()
req = urllib.request.Request('http://localhost:5678/api/v1/workflows',
    method='POST', data=data,
    headers={'X-N8N-API-KEY': '${N8N_API_KEY}', 'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        d = json.loads(r.read())
        print(d.get('id','?'))
except urllib.error.HTTPError as e:
    body = e.read().decode()[:200]
    print('err:' + str(e.code) + ':' + body)
except Exception as e:
    print('err:' + str(e)[:50])
" 2>/dev/null || echo "err:exec")

        if echo "$RESULT" | grep -q "^err:"; then
            err "${wf_name}: error — ${RESULT}"
        else
            WORKFLOW_IDS["$wf_name"]="$RESULT"
            ok "${wf_name}: importado (${RESULT})"
        fi
    fi

    rm -f "$TMP_FILE"
done

# ── PASO 5: Auto-cablear IDs en WF01 ─────────────────────────────────────────
hdr "PASO 5: Auto-cablear sub-workflows en Master Scheduler"

ALL_WF=$(n8n_api "GET" "/api/v1/workflows?limit=100" "" "$N8N_API_KEY")

WF01_ID=$(echo "$ALL_WF" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(w['id']) for w in d.get('data',[]) if '01_MASTER' in w.get('name','')]" 2>/dev/null | head -1 || echo "")
WF02_ID=$(echo "$ALL_WF" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(w['id']) for w in d.get('data',[]) if '02_AI' in w.get('name','')]" 2>/dev/null | head -1 || echo "")
WF04_ID=$(echo "$ALL_WF" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(w['id']) for w in d.get('data',[]) if '04_BLOGGER' in w.get('name','')]" 2>/dev/null | head -1 || echo "")

if [ -n "$WF01_ID" ] && [ -n "$WF02_ID" ] && [ -n "$WF04_ID" ]; then
    info "Cableando WF01=${WF01_ID} → WF02=${WF02_ID}, WF04=${WF04_ID}"

    # Obtener WF01 completo y parchear IDs
    WF01_JSON=$(n8n_api "GET" "/api/v1/workflows/${WF01_ID}" "" "$N8N_API_KEY")
    WF01_PATCHED=$(echo "$WF01_JSON" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for node in d.get('nodes', []):
    if node.get('type') == 'n8n-nodes-base.executeWorkflow':
        name = node.get('name','')
        wf_id_param = node.get('parameters',{}).get('workflowId',{})
        if isinstance(wf_id_param, dict):
            if '02' in name or 'AI' in name or 'Content' in name:
                node['parameters']['workflowId']['value'] = '${WF02_ID}'
            elif '04' in name or 'Publisher' in name or 'Blogger' in name:
                node['parameters']['workflowId']['value'] = '${WF04_ID}'
# Limpiar campos que la API no acepta en PUT
for k in ['createdAt','updatedAt','versionId']:
    d.pop(k, None)
print(json.dumps(d))
" 2>/dev/null || echo "")

    if [ -n "$WF01_PATCHED" ]; then
        TMP_WF01="/tmp/wf01_patched.json"
        echo "$WF01_PATCHED" > "$TMP_WF01"
        docker cp "$TMP_WF01" "${N8N_CONTAINER}:/tmp/wf01_patched.json" 2>/dev/null
        PATCH_RESULT=$(docker exec "$N8N_CONTAINER" python3 -c "
import urllib.request, json
with open('/tmp/wf01_patched.json') as f:
    data = f.read().encode()
req = urllib.request.Request('http://localhost:5678/api/v1/workflows/${WF01_ID}',
    method='PUT', data=data,
    headers={'X-N8N-API-KEY': '${N8N_API_KEY}', 'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        print('ok')
except urllib.error.HTTPError as e:
    print('err:' + str(e.code) + ':' + e.read().decode()[:100])
except Exception as e:
    print('err:' + str(e)[:80])
" 2>/dev/null || echo "err:exec")
        rm -f "$TMP_WF01"
        echo "$PATCH_RESULT" | grep -q "^ok" && ok "WF01 cableado correctamente" || err "Error cableando WF01: ${PATCH_RESULT}"
    fi
else
    info "IDs: WF01=${WF01_ID:-MISSING} WF02=${WF02_ID:-MISSING} WF04=${WF04_ID:-MISSING}"
    info "Cablear manualmente si alguno falta"
fi

# ── PASO 6: Activar workflows ─────────────────────────────────────────────────
hdr "PASO 6: Activar workflows"

ACTIVATE_ORDER=(
    "05_LOCK_WATCHDOG"
    "25_TITLE_FACTORY"
    "02_AI_CONTENT_GENERATOR"
    "04_BLOGGER_PUBLISHER"
    "06_AFFILIATE_INJECTOR"
    "07_MONETIZATION_INJECTOR"
    "08_TELEGRAM_BROADCASTER"
    "09_DIGITAL_PRODUCT_LINKER"
    "15_INTERLINK_BUILDER"
    "01_MASTER_SCHEDULER"
)

ALL_WF=$(n8n_api "GET" "/api/v1/workflows?limit=100" "" "$N8N_API_KEY")

for wf_name in "${ACTIVATE_ORDER[@]}"; do
    WF_ID=$(echo "$ALL_WF" | python3 -c "
import sys,json
d=json.load(sys.stdin)
for w in d.get('data',[]):
    if '${wf_name}' in w.get('name',''):
        print(w.get('id',''))
        exit(0)
print('')
" 2>/dev/null || echo "")

    [ -z "$WF_ID" ] && { info "${wf_name}: no encontrado"; continue; }

    ACT=$(docker exec "$N8N_CONTAINER" python3 -c "
import urllib.request, json
req = urllib.request.Request('http://localhost:5678/api/v1/workflows/${WF_ID}/activate',
    method='POST', data=b'{}',
    headers={'X-N8N-API-KEY': '${N8N_API_KEY}', 'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req, timeout=15) as r:
        print('ok')
except urllib.error.HTTPError as e:
    body = e.read().decode()[:100]
    print('err:' + str(e.code) + ':' + body)
except Exception as e:
    print('err:' + str(e)[:50])
" 2>/dev/null || echo "err:exec")

    echo "$ACT" | grep -q "^ok" && ok "${wf_name} ACTIVO (${WF_ID})" || err "${wf_name}: ${ACT}"
    sleep 0.3
done

# ── PASO 7: Verificación final ────────────────────────────────────────────────
hdr "PASO 7: Estado final"

FINAL_WF=$(n8n_api "GET" "/api/v1/workflows?active=true&limit=50" "" "$N8N_API_KEY")
ACTIVE_COUNT=$(echo "$FINAL_WF" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('data',[])))" 2>/dev/null || echo "0")
ok "Workflows activos: ${ACTIVE_COUNT}"

echo ""
echo "$FINAL_WF" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for w in d.get('data', []):
    print('  ✓ ' + w.get('name','?') + ' [' + str(w.get('id','')) + ']')
" 2>/dev/null || true

# ── PASO 8: Telegram de confirmación ─────────────────────────────────────────
if [ "$CHAT_ID" != "0" ] && [ "$CHAT_ID" != "NOT_FOUND" ]; then
    hdr "PASO 8: Confirmación Telegram"
    MSG="🚀 <b>Fábrica SEO n8n — ACTIVA</b>%0A%0A✅ ${ACTIVE_COUNT} workflows activos%0A✅ Crons corriendo%0A✅ Pipeline listo%0A%0A🕐 $(date '+%Y-%m-%d %H:%M')%0A%0A_Próximo artículo en 20 min._"
    docker exec "$N8N_CONTAINER" python3 -c "
import urllib.request, urllib.parse
url = 'https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${MSG}&parse_mode=HTML'
try:
    r = urllib.request.urlopen(url, timeout=10)
    print('ok')
except Exception as e:
    print('warn: ' + str(e)[:80])
" 2>/dev/null && ok "Mensaje enviado a Telegram" || info "Telegram: verificar canal del bot"
fi

# ── RESUMEN ───────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  BOOTSTRAP COMPLETADO                                        ║"
printf "║  Workflows activos: %-41s║\n" "${ACTIVE_COUNT}"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  SIGUIENTE PASO OBLIGATORIO:                                 ║"
echo "║                                                              ║"
echo "║  Cargar backlog de 363 artículos en CONTENT_PIPELINE:        ║"
echo "║  1. Abre este Sheet (363 títulos listos):                    ║"
echo "║     docs.google.com/spreadsheets/d/                          ║"
echo "║     18Frct3tCREHa2IPDwoRxYqYx8kcX0PKubEgSUr2MpDQ            ║"
echo "║  2. Copia todas las filas (sin header)                       ║"
echo "║  3. Pégalas en tu CONTENT_PIPELINE principal                 ║"
echo "║     (spreadsheet 18BQ8BjfTvVa56R5FjWyBuvcGR8vVlz0rx...)     ║"
echo "║                                                              ║"
echo "║  El sistema publica solo cada 20 min sin intervención.       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
