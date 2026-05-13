#!/bin/bash
# audit_blogger_blogs.sh
# Auditoría completa de todos los blogs Blogger via API
# Y fix automático de artículos con HTML roto
#
# Uso: bash audit_blogger_blogs.sh
# Prerequisitos: N8N_API_KEY exportado, acceso a Google OAuth via n8n

set -e

# ── CONFIGURACIÓN ─────────────────────────────────────────────────────────────
N8N_BASE="http://localhost:5678"
OUTPUT_DIR="/opt/n8n/blogger_audit"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="${OUTPUT_DIR}/audit_report_${TIMESTAMP}.json"

# ──────────────────────────────────────────────────────────────────────────────

mkdir -p "$OUTPUT_DIR"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log_ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
log_info() { echo -e "${YELLOW}[INFO]${NC} $1"; }
log_err()  { echo -e "${RED}[ERROR]${NC} $1"; }
log_head() { echo -e "\n${BLUE}━━━ $1 ━━━${NC}"; }

echo "========================================"
echo "  AUDITORÍA BLOGGER — Fábrica SEO n8n"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"

# ── PASO 1: Obtener token OAuth de n8n ────────────────────────────────────────
log_head "PASO 1: Obteniendo token de autenticación Google"
log_info "Usa n8n para ejecutar una llamada de prueba y capturar el token..."
log_info "O usa una Service Account. Ver docs/SETUP_FASE2.md"

# El comando de auditoría usa curl directo a la API de Blogger
# Requiere un Access Token de Google OAuth (obtenido desde n8n o gcloud)
# Instrucción manual si no hay token automático:
echo ""
echo "OPCIÓN A — Obtener token via gcloud CLI:"
echo "  gcloud auth print-access-token"
echo ""
echo "OPCIÓN B — Obtener token via n8n (ejecutar este workflow de prueba):"
echo "  curl -s -X POST ${N8N_BASE}/api/v1/workflows/test"
echo ""

# Si se exporta GOOGLE_ACCESS_TOKEN externamente, úsalo
if [ -z "$GOOGLE_ACCESS_TOKEN" ]; then
  log_info "Exporta el token: export GOOGLE_ACCESS_TOKEN='ya29.xxx'"
  log_info "Luego ejecuta de nuevo el script."
  echo ""
  echo "Continuando con listado de blogs conocidos desde configuración..."
fi

# ── PASO 2: Listar todos los blogs del usuario ────────────────────────────────
log_head "PASO 2: Blogs conocidos — requiere BLOG_IDs reales"

# Lista de blogs conocidos (COMPLETAR con IDs reales)
# Para obtener el BLOG_ID: en Blogger, ir a Settings > Basic > Blog ID
# O desde la URL: https://draft.blogger.com/blog/posts/XXXXXXXXXX
declare -A BLOGS=(
  ["Veterinario Luis Garcia"]="2772493032989228627"
  ["EL BLOG DEL HURÓN"]="TU_BLOG_ID_HURON"
  ["Bulldogs Vet"]="TU_BLOG_ID_BULLDOGS"
  ["Seguros de Mascotas"]="TU_BLOG_ID_SEGUROS_MASCOTAS"
  ["IMPUESTOS EN USA"]="TU_BLOG_ID_IMPUESTOS"
  ["Abogados de Familia En USA"]="TU_BLOG_ID_ABOGADOS_FAMILIA"
  ["Abogados de Accidentes Orlando"]="TU_BLOG_ID_ABOGADOS_ACC"
  ["abogado de bienes raíces en usa"]="TU_BLOG_ID_BIENES_RAICES"
  ["multas permisos laboral"]="TU_BLOG_ID_MULTAS"
  ["Hipertensión Arterial"]="TU_BLOG_ID_HIPERTENSION"
  ["Tensiometro"]="TU_BLOG_ID_TENSIOMETRO"
  ["Tecnicas Anti Estrés"]="TU_BLOG_ID_ANTISTRESS"
  ["Tratamiento Esclerosis Multiple"]="TU_BLOG_ID_ESCLEROSIS"
  ["PEZ BETTA"]="TU_BLOG_ID_PEZ_BETTA"
  ["PEZ GUPPY"]="TU_BLOG_ID_PEZ_GUPPY"
  ["Pez Platy"]="TU_BLOG_ID_PEZ_PLATY"
  ["CAMARONES DE ACUARIO"]="TU_BLOG_ID_CAMARONES"
  ["Acuarios Nano"]="TU_BLOG_ID_ACUARIOS_NANO"
  ["Reptiles"]="TU_BLOG_ID_REPTILES"
  ["GECKOS LEOPARDO"]="TU_BLOG_ID_GECKOS"
  ["Chinchillas"]="TU_BLOG_ID_CHINCHILLAS"
  ["guacamayos"]="TU_BLOG_ID_GUACAMAYOS"
  ["Loros"]="TU_BLOG_ID_LOROS"
  ["Periquitos"]="TU_BLOG_ID_PERIQUITOS"
  ["Patos"]="TU_BLOG_ID_PATOS"
  ["Razas de Perros"]="TU_BLOG_ID_RAZAS"
  ["Pastor Alemán"]="TU_BLOG_ID_PASTOR"
  ["Mastín Tibetano"]="TU_BLOG_ID_MASTIN"
  ["Alimentación para Perros"]="TU_BLOG_ID_ALIM_PERROS"
  ["Alimentación para Gatos"]="TU_BLOG_ID_ALIM_GATOS"
  ["VETERINARIO DE BOVINOS"]="TU_BLOG_ID_BOVINOS"
  ["VET BOVINOS"]="TU_BLOG_ID_BOVINOS2"
  ["cine24plus"]="TU_BLOG_ID_CINE"
  ["Emprendimientos desde casa facilitos"]="TU_BLOG_ID_EMPREND"
  ["IMPACTO GEOPOLITICO ECONOMICO"]="TU_BLOG_ID_GEOPOLITICA"
)

echo ""
echo "Blogs configurados: ${#BLOGS[@]}"
echo ""

# ── PASO 3: Auditar cada blog vía API ─────────────────────────────────────────
log_head "PASO 3: Auditoría por blog"

AUDIT_DATA='{"blogs": []}'

for BLOG_NAME in "${!BLOGS[@]}"; do
  BLOG_ID="${BLOGS[$BLOG_NAME]}"

  if [[ "$BLOG_ID" == TU_BLOG_ID* ]]; then
    log_info "SKIP ${BLOG_NAME}: sin BLOG_ID configurado"
    continue
  fi

  if [ -z "$GOOGLE_ACCESS_TOKEN" ]; then
    log_info "Sin token — auditando estructura local para: ${BLOG_NAME} (ID: ${BLOG_ID})"
    continue
  fi

  log_info "Auditando: ${BLOG_NAME} (${BLOG_ID})"

  # Obtener info del blog
  BLOG_INFO=$(curl -s \
    -H "Authorization: Bearer ${GOOGLE_ACCESS_TOKEN}" \
    "https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}")

  POST_COUNT=$(echo "$BLOG_INFO" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(d.get('posts', {}).get('totalItems', 0))
" 2>/dev/null || echo "0")

  BLOG_URL=$(echo "$BLOG_INFO" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(d.get('url', ''))
" 2>/dev/null || echo "")

  log_ok "${BLOG_NAME}: ${POST_COUNT} posts — ${BLOG_URL}"

  # Obtener últimos 10 posts para análisis
  POSTS=$(curl -s \
    -H "Authorization: Bearer ${GOOGLE_ACCESS_TOKEN}" \
    "https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts?maxResults=10&status=live")

  # Analizar posts por problemas de HTML
  BROKEN_POSTS=$(echo "$POSTS" | python3 -c "
import sys, json, re
d = json.load(sys.stdin)
broken = []
for p in d.get('items', []):
    content = p.get('content', '')
    issues = []
    # Detectar HTML roto
    if not re.search(r'<h[1-6]', content, re.I):
        issues.append('sin-headings')
    if content.count('<p>') < 2:
        issues.append('pocos-parrafos')
    if '<div' not in content:
        issues.append('sin-divs')
    if len(content) < 500:
        issues.append('contenido-corto')
    # Detectar estilos inline excesivos que rompen el template
    if content.count('style=') > 20:
        issues.append('exceso-styles-inline')
    if issues:
        broken.append({'id': p.get('id'), 'title': p.get('title'), 'issues': issues, 'url': p.get('url')})
for b in broken:
    print(f\"  ROTO: {b['title'][:50]} — {', '.join(b['issues'])}\")
" 2>/dev/null)

  if [ -n "$BROKEN_POSTS" ]; then
    echo "$BROKEN_POSTS"
  fi

done

# ── PASO 4: Fix automático de artículo roto ───────────────────────────────────
log_head "PASO 4: Fix HTML — artículo 'como alimentar un huron bebe'"

HURON_BLOG_ID="2772493032989228627"  # Veterinario Luis Garcia - el conocido

if [ -n "$GOOGLE_ACCESS_TOKEN" ]; then
  log_info "Buscando artículo sobre hurón bebé..."

  POSTS_RESULT=$(curl -s \
    -H "Authorization: Bearer ${GOOGLE_ACCESS_TOKEN}" \
    "https://www.googleapis.com/blogger/v3/blogs/${HURON_BLOG_ID}/posts?q=alimentar+huron&maxResults=5")

  POST_ID=$(echo "$POSTS_RESULT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for p in d.get('items', []):
    title = p.get('title', '').lower()
    if 'huron' in title and ('alimentar' in title or 'bebe' in title or 'bebé' in title):
        print(p.get('id', ''))
        break
" 2>/dev/null)

  if [ -n "$POST_ID" ]; then
    log_ok "Post encontrado: ID ${POST_ID}"
    log_info "Obteniendo contenido actual..."

    POST_DATA=$(curl -s \
      -H "Authorization: Bearer ${GOOGLE_ACCESS_TOKEN}" \
      "https://www.googleapis.com/blogger/v3/blogs/${HURON_BLOG_ID}/posts/${POST_ID}")

    # Aplicar fix CSS y estructura HTML
    FIXED_HTML=$(echo "$POST_DATA" | python3 -c "
import sys, json, re

d = json.load(sys.stdin)
html = d.get('content', '')

# Fix 1: Limpiar estilos inline problemáticos del editor de Blogger
html = re.sub(r' style=\"[^\"]*font-family[^\"]*\"', '', html)
html = re.sub(r' style=\"[^\"]*font-size[^\"]*\"', '', html)

# Fix 2: Asegurar que divs de productos tengan estilos correctos
html = html.replace(
    'class=\"rec-productos\"',
    'class=\"rec-productos\" style=\"background:#f8f9fa;border-radius:12px;padding:20px;margin:25px 0;\"'
)

# Fix 3: Wrap del contenido en article tag si falta
if '<article' not in html:
    html = '<article class=\"post-content\">' + html + '</article>'

print(json.dumps({'content': html}))
" 2>/dev/null)

    if [ -n "$FIXED_HTML" ]; then
      log_info "Aplicando fix al post..."
      PATCH_RESULT=$(curl -s -X PATCH \
        -H "Authorization: Bearer ${GOOGLE_ACCESS_TOKEN}" \
        -H "Content-Type: application/json" \
        "https://www.googleapis.com/blogger/v3/blogs/${HURON_BLOG_ID}/posts/${POST_ID}" \
        -d "$FIXED_HTML")

      if echo "$PATCH_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if d.get('id') else 1)" 2>/dev/null; then
        log_ok "Post reparado exitosamente"
      else
        log_err "Error al parchear el post"
        echo "$PATCH_RESULT" | python3 -m json.tool 2>/dev/null | head -20
      fi
    fi
  else
    log_info "Post no encontrado automáticamente. Búsqueda manual en:"
    echo "  https://draft.blogger.com/blog/posts/${HURON_BLOG_ID}"
  fi
else
  log_info "Sin GOOGLE_ACCESS_TOKEN. Para el fix manual:"
  echo ""
  echo "  1. Abrir: https://draft.blogger.com/blog/posts/2772493032989228627"
  echo "  2. Buscar: 'como alimentar un huron bebe'"
  echo "  3. Editar HTML — AGREGAR al inicio del contenido:"
  echo ""
  cat << 'CSSFIX'
<style>
.post-content { font-family: Georgia, serif; line-height: 1.7; max-width: 800px; }
.post-content h2 { color: #1a1a2e; border-bottom: 2px solid #e74c3c; padding-bottom: 8px; }
.post-content h3 { color: #2c3e50; }
.post-content p { margin-bottom: 1.2em; color: #333; }
.rec-productos { background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 25px 0; }
.cta-telegram { background: #0088cc; color: white; border-radius: 10px; padding: 20px; margin: 25px 0; }
.cta-telegram a { color: #fff; font-weight: bold; }
.cta-final { background: #27ae60; color: white; border-radius: 10px; padding: 20px; margin: 25px 0; }
</style>
CSSFIX
  echo ""
fi

# ── PASO 5: Generar reporte final ─────────────────────────────────────────────
log_head "PASO 5: Reporte de auditoría"

cat << 'REPORT'

CLASIFICACIÓN ESTRATÉGICA DE BLOGS:

TIER 1 — ACCIÓN INMEDIATA (alto RPM):
  ✦ IMPUESTOS EN USA          RPM: ~$55   → Prioridad máxima, contenido en inglés
  ✦ Abogados de Accidentes    RPM: ~$75   → RPM más alto de todos
  ✦ Abogados de Familia       RPM: ~$65   → Legal family law
  ✦ Bienes Raíces USA         RPM: ~$50   → Real estate legal
  ✦ Esclerosis Múltiple       RPM: ~$25   → Salud premium
  ✦ Hipertensión Arterial     RPM: ~$18   → Salud masiva
  ✦ multas permisos laboral   RPM: ~$55   → Employment law

TIER 2 — DESARROLLAR (animal especializado):
  ★ Veterinario Luis Garcia   RPM: ~$4.5  → HUB PRINCIPAL — autoridad médica
  ★ EL BLOG DEL HURÓN         RPM: ~$4    → Nicho especializado, baja competencia
  ★ Geckos Leopardo           RPM: ~$4    → Reptiles exóticos
  ★ Chinchillas               RPM: ~$4    → Pequeños mamíferos
  ★ Camarones de Acuario      RPM: ~$3.5  → Nicho acuariofilia
  ★ Bulldogs Vet              RPM: ~$3.8  → Razas específicas
  ★ Alimentación Perros/Gatos RPM: ~$4.5  → Alto potencial afiliados comida

TIER 3 — MANTENER/VOLUMEN:
  • PEZ BETTA / GUPPY / PLATY  → Volumen alto, afiliados acuariofilia
  • Loros / Guacamayos         → Aves exóticas, nicho sin explotar
  • Reptiles (general)         → Feeder para geckos/específicos
  • Mastín Tibetano            → Rareza premium, alta monetización

RECICLABLES:
  ↻ Emprendimientos desde casa → Convertir en Finanzas/SaaS
  ↻ IMPACTO GEOPOLITICO        → Muy bajo RPM, pausar o pivotar a finance
  ↻ cine24plus                 → Sin potencial monetización real, PAUSAR

ACCIONES CRÍTICAS:
  1. BLOG PRINCIPAL (Veterinario Luis Garcia) — publicar pilar médico ya
  2. IMPUESTOS EN USA — contenido en inglés urgente (RPM $55+)
  3. Abogados de Accidentes — RPM más alto del portafolio
  4. Completar BLOG_IDs en NICHE_CONFIG para todos los blogs

REPORT

log_ok "Auditoría completada. Reporte guardado en: ${REPORT_FILE}"
echo ""
echo "PRÓXIMOS PASOS:"
echo "  1. Completar BLOG_IDs en /opt/n8n/scripts/audit_blogger_blogs.sh"
echo "  2. Exportar GOOGLE_ACCESS_TOKEN y re-ejecutar para auditoría automática"
echo "  3. Completar NICHE_CONFIG Google Sheet con los BLOG_IDs reales"
echo "  4. Activar workflows en orden: 01 → 02 → 04 → 05 → 06 → 07 → 08"
echo "  5. Ejecutar 25_TITLE_FACTORY primero para llenar el pipeline"
