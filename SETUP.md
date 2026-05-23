# Setup — Blog Factory SEO Clusters + DeepSeek

## Importar en tu n8n (Contabo)

1. n8n → Workflows → **Import from file**
2. Selecciona: `workflows/blog-factory-seo-clusters-deepseek.json`

## Configurar (nodo ⚙️ CONFIG)

| Campo | Qué poner |
|-------|-----------|
| `BLOG_ID` | ID numérico de tu blog (URL del panel de Blogger) |
| `LABEL_PILAR` | Etiqueta que usas en posts pilar, ej: `pilar` |
| `DEEPSEEK_API_KEY` | Tu API key de platform.deepseek.com |
| `SYSTEME_URL` | URL de tu funnel en systeme.io |
| `BRAND_COLOR` | Hex de tu color principal, ej: `#2563eb` |
| `BRAND_NAME` | Nombre de tu blog/marca |

## Credencial de Google

En los nodos `📥 Obtener Posts` y `📤 Actualizar Post`, selecciona tu credencial **Google OAuth2** ya configurada.

## Estructura de labels en Blogger

```
Post PILAR:   labels → ["pilar", "seo"]
Post CLUSTER: labels → ["seo", "keyword-research"]
Post CLUSTER: labels → ["seo", "link-building"]
```
Todos los posts con la label `seo` (compartida) se detectan como del mismo cluster.

## Qué genera DeepSeek en cada post

**Bloque cluster→pilar** (solo en posts de cluster):
- Caja con imagen cuadrada 78x78px (gradient + emoji temático)
- Texto con 2 emojis del nicho que invitan a leer el pilar
- Link "Leer la guía completa: [título pilar] →"
- Se inserta al 65% del artículo
- Se reemplaza si ya existe (no duplica)

**Cajón CTA de ventas** (en TODOS los posts):
- Fondo gradient del color de marca
- Imagen cuadrada 90x90px con emoji del nicho
- Título con emoji de urgencia/valor
- 2 bullets de beneficios con emojis
- Botón hacia tu funnel de systeme.io
- Se inserta al final del post

## Ejecutar

- **Manual**: clic en "Ejecutar Ahora"
- **Automático**: se activa solo los domingos a las 4am
