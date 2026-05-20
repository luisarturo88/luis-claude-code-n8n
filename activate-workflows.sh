#!/usr/bin/env bash
# Conecta a tu instancia n8n, lista todos los flujos y activa los que están inactivos.

N8N_URL="https://vmi3096105.contaboserver.net"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmOGM1MTJmNy1mNTVhLTQwYjYtYWU1Ni00MDM0OWNlMDlmMjkiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiYzlhMzNiZDctMGE4OS00YzRmLTk2NzQtYzNjMjY5Yjg0NTNlIiwiaWF0IjoxNzc5MjkyOTgxfQ.MMMhLsnW8H6mWilfglRpLMvHNusGPV36QfifwMeLf8M"

HEADERS=(-H "X-N8N-API-KEY: $API_KEY" -H "Accept: application/json")

echo "========================================="
echo "  n8n Workflow Manager"
echo "  $N8N_URL"
echo "========================================="
echo ""

# Obtener todos los flujos (paginado)
ALL_WORKFLOWS="[]"
CURSOR=""
PAGE=1

while true; do
  URL="$N8N_URL/api/v1/workflows?limit=100"
  [[ -n "$CURSOR" ]] && URL="$URL&cursor=$CURSOR"

  RESPONSE=$(curl -sf "${HEADERS[@]}" "$URL")
  if [[ $? -ne 0 ]]; then
    echo "ERROR: No se pudo conectar a $N8N_URL"
    echo "Verifica que la URL es correcta y que tienes acceso de red."
    exit 1
  fi

  PAGE_DATA=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.dumps(d.get('data',[])))")
  ALL_WORKFLOWS=$(echo "$ALL_WORKFLOWS $PAGE_DATA" | python3 -c "import sys,json; parts=sys.stdin.read().split(); print(json.dumps([item for p in parts for item in json.loads(p)]))")

  NEXT_CURSOR=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('nextCursor',''))" 2>/dev/null)
  [[ -z "$NEXT_CURSOR" || "$NEXT_CURSOR" == "None" ]] && break
  CURSOR="$NEXT_CURSOR"
  ((PAGE++))
done

TOTAL=$(echo "$ALL_WORKFLOWS" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")
ACTIVE=$(echo "$ALL_WORKFLOWS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(sum(1 for w in d if w.get('active')))")
INACTIVE=$((TOTAL - ACTIVE))

echo "Flujos encontrados: $TOTAL total | $ACTIVE activos | $INACTIVE inactivos"
echo ""
echo "--- Lista de flujos ---"
echo "$ALL_WORKFLOWS" | python3 -c "
import sys, json
workflows = json.load(sys.stdin)
for w in workflows:
    status = 'ACTIVO  ' if w.get('active') else 'INACTIVO'
    print(f\"  [{status}] ID:{w['id']:>6}  {w['name']}\")
"
echo ""

if [[ $INACTIVE -eq 0 ]]; then
  echo "Todos los flujos ya están activos. Nada que hacer."
  exit 0
fi

echo "--- Activando flujos inactivos ---"
ACTIVATED=0
ERRORS=0

while IFS= read -r line; do
  WF_ID=$(echo "$line" | python3 -c "import sys,json; d=json.loads(sys.stdin.read()); print(d['id'])")
  WF_NAME=$(echo "$line" | python3 -c "import sys,json; d=json.loads(sys.stdin.read()); print(d['name'])")

  RESULT=$(curl -sf -X PATCH "${HEADERS[@]}" \
    -H "Content-Type: application/json" \
    -d '{"active": true}' \
    "$N8N_URL/api/v1/workflows/$WF_ID")

  if [[ $? -eq 0 ]]; then
    echo "  OK  [$WF_ID] $WF_NAME"
    ((ACTIVATED++))
  else
    echo "  ERR [$WF_ID] $WF_NAME"
    ((ERRORS++))
  fi
done < <(echo "$ALL_WORKFLOWS" | python3 -c "
import sys, json
for w in json.load(sys.stdin):
    if not w.get('active'):
        print(json.dumps(w))
")

echo ""
echo "========================================="
echo "  Resultado: $ACTIVATED activados | $ERRORS errores"
echo "========================================="
