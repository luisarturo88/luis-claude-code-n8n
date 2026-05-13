#!/bin/bash
# deploy_vps.sh — Ejecutar en el VPS con: bash deploy_vps.sh
# O directamente desde internet:
#   curl -fsSL https://raw.githubusercontent.com/luisarturo88/luis-claude-code-n8n/claude/setup-n8n-infrastructure-kz0dU/scripts/deploy_vps.sh | bash

set -euo pipefail

REPO_URL="https://github.com/luisarturo88/luis-claude-code-n8n"
REPO_BRANCH="claude/setup-n8n-infrastructure-kz0dU"
INSTALL_DIR="/opt/n8n/workflows_import"
STACK_ENV="/opt/n8n/stack.env"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC} $1"; }
info() { echo -e "${YELLOW}→${NC} $1"; }
err()  { echo -e "${RED}✗${NC} $1"; }

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  DEPLOY — Fábrica SEO n8n                    ║"
echo "║  $(date '+%Y-%m-%d %H:%M:%S')               ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── Instalar dependencias mínimas ────────────────────────────────────────────
for cmd in curl git python3 jq; do
    if ! command -v "$cmd" &>/dev/null; then
        info "Instalando $cmd..."
        apt-get install -y "$cmd" 2>/dev/null || yum install -y "$cmd" 2>/dev/null || true
    fi
done
ok "Dependencias listas"

# ── Crear directorio ─────────────────────────────────────────────────────────
mkdir -p "$INSTALL_DIR"
ok "Directorio: $INSTALL_DIR"

# ── Clonar o actualizar repo ─────────────────────────────────────────────────
if [ -d "$INSTALL_DIR/.git" ]; then
    info "Actualizando repo existente..."
    cd "$INSTALL_DIR"
    git fetch origin "$REPO_BRANCH" 2>/dev/null
    git checkout "$REPO_BRANCH" 2>/dev/null
    git pull origin "$REPO_BRANCH" 2>/dev/null
    ok "Repo actualizado"
else
    info "Clonando repo..."
    cd "$INSTALL_DIR"
    git clone --branch "$REPO_BRANCH" --depth 1 "$REPO_URL" . 2>/dev/null
    ok "Repo clonado"
fi

# ── Verificar que el bootstrap existe ────────────────────────────────────────
if [ ! -f "scripts/bootstrap_sistema.sh" ]; then
    err "ERROR: scripts/bootstrap_sistema.sh no encontrado después de clonar"
    ls -la scripts/ 2>/dev/null || echo "Directorio scripts no existe"
    exit 1
fi

chmod +x scripts/bootstrap_sistema.sh
ok "bootstrap_sistema.sh listo (chmod +x)"

# ── Ejecutar bootstrap ────────────────────────────────────────────────────────
echo ""
info "Ejecutando bootstrap completo..."
echo ""
bash scripts/bootstrap_sistema.sh

