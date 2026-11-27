# Fábrica V3 · Estado (2026-11-27)

## Flujos en n8n (todos nuevos; ningún flujo anterior fue modificado)
| Flujo | ID | Estado |
|---|---|---|
| 🚀 V3 · Investigador de mercado IA | `me2hx2R4oYtw3eU0` | activo (lunes 06:07) |
| 🚀 V3 · CEO semanal (panel de agentes SEO) | `RM4ZsEhumHppaFH8` | activo (lunes 07:07) |
| 🚀 V3 · Redactor calidad alta | `qT3Y8wSiicsKMK48` | solo manual / llamado; deja borrador, no publica |
| 🚀 V3 · Vigía de saldo DeepSeek | `bbmhJxiTAduYpX6r` | activo (cada 30 min); lanza las 3 pruebas una sola vez al detectar saldo |

## Resultado de las pruebas previas a la recarga
- Lectura de FABRICA y NICHOS: OK. Armado de prompts: OK.
- Todos se detienen en DeepSeek con `402 Insufficient Balance` (cuenta sin saldo). No escribieron nada.
- Crear pestañas desde n8n: `403 Forbidden`. Hay que crear a mano las pestañas `CEO_V3` y `V3_BORRADORES` (ver abajo).

## Pasos manuales (una sola vez) en REGISTRY_BLOGS
1. Pestaña `CEO_V3`, fila 1: `FECHA, AGENTE, PRIORIDAD, RECOMENDACION, POR_QUE, IMPACTO_ESTIMADO, ACCION_SI_APRUEBO, APROBAR, ESTADO`.
2. Pestaña `V3_BORRADORES`, fila 1: `FECHA, BLOG_ID, IDIOMA, TITULO, KEYWORD, PALABRAS, CALIDAD_OK, NOTAS, REQUIERE_REVISION_VET, HTML, APROBAR, ESTADO`.
3. En NICHOS, formato condicional: rango `A2:V1000`, fórmula `=LEFT($C2,3)="V3-"`, fondo verde.
4. Recargar DeepSeek. En ≤30 minutos el vigía lanza las pruebas y avisa por Telegram.

## Reglas
- El autor de todos los blogs es Luis Arturo García. `AUTOR_TIPO` solo controla el tono (experto en veterinaria; bloguero en el resto, sin hacerse pasar por profesional).
- Foto del autor: el redactor ya acepta `AUTOR_FOTO_URL` y la inserta en la caja "Sobre el autor". Falta la URL de la foto.
- Los potenciales de ingresos son estimaciones. Contenido veterinario con fármacos: revisión del médico antes de publicar.

## Pendiente de construir (después de las pruebas chicas)
- Constructor de blog: páginas legales, plantilla y silos al aprobar un nicho (hoy lo cubren los subflujos `🏭 FB ·` existentes).
- Publicador de borradores aprobados (V3_BORRADORES, APROBAR = SI → Blogger).
- Datos reales de tráfico para el CEO (Search Console / Analytics).
- Validación de los mejores nichos con Ahrefs / Keyword Tool antes de crear el blog.

## Repositorios de agentes SEO (licencia MIT) para instalar como asesores
Encontrados por búsqueda en GitHub. Son skills/agentes para Claude Code, no flujos de n8n.
- `AgriciDaniel/claude-seo` (~32.8k estrellas): 26 sub-skills y 19 sub-agentes (SEO técnico, E-E-A-T, schema, GEO).
- `zubair-trabzada/geo-seo-claude` (~11.9k): SEO para buscadores con IA, puntaje de citabilidad.
- `coreyhaines31/marketingskills` (~63k): copywriting, CRO, SEO, analítica.
- `Illyism/seo-skills` (~2.2k): 30 skills de SEO con integración Ahrefs.
- `Ryze-AI-Adgent/open-seo-mcp-skills` (~10.7k): servidor MCP de SEO gratuito y skills.
Antes de instalar cualquiera hay que revisar su código; son de terceros.
