# Blog Factory Autopilot v2 — Setup Guide

## Qué incluye este repositorio

| Archivo | Descripción |
|---------|-------------|
| `workflows/blog-factory-autopilot-v2.json` | Flujo principal: procesa 1 post cada 5 min, genera 6 bloques HTML con DeepSeek, los inyecta en Blogger |
| `workflows/lead-premium-receiver.json` | Flujo receptor: webhook que registra leads premium ($250) desde systeme.io |

---

## Flujo principal: lo que hace en cada ejecución (cada 5 min)

```
1. Lee tu Google Sheet → elige el blog con el timestamp más antiguo (rotación automática)
2. Detecta si es ANIMALES o ABOGADOS/LEGAL por palabras clave del NICHO
3. Obtiene los posts PILAR del blog (para mapear estructura de silos)
4. Obtiene una página de 10 posts cluster (usando pageToken para paginar)
5. Selecciona el PRIMER cluster sin bloque <!-- EARLY_CTA --> (Ley 2)
6. DeepSeek genera 6 bloques HTML — SIN ver el contenido del artículo (Ley 1)
7. Inyecta los bloques por posición (20-30%, 30%, 50%, 65%, final)
8. Actualiza el post en Blogger
9. Actualiza el timestamp del blog en el Sheet
```

**⚖️ Ley 1** — DeepSeek NUNCA recibe el HTML del artículo. Solo recibe: título, labels, URLs de pilares/clusters, nicho, colores y URLs de funnels.

**⚖️ Ley 2** — Si un bloque ya existe en el post (por su marcador HTML), ese bloque no se regenera ni se sobreescribe.

---

## PASO 1 — Columnas del Google Sheet

En tu Sheet (`1Vq8TuyqI22C3_Ffth-GsGdDRuXfHORpdAGOiowLxIpk`), asegúrate de tener estas columnas:

### Columnas existentes (que ya usas)

| Columna | Ejemplo | Para qué sirve |
|---------|---------|----------------|
| `BLOG_ID` | `12345678` | ID del blog en Blogger |
| `BLOG_NAME` | `Mi Blog de Perros` | Nombre del blog |
| `NICHO` | `perros veterinaria` | Se usa para auto-detectar estrategia |
| `ESPECIE` | `perro` | Especie/tema específico para los prompts |
| `ACTIVE` | `YES` | Solo procesa blogs con valor `YES` |
| `LEAD_MAGNET_URL` | `https://...systeme.io/...` | URL del funnel del blog (sobreescribe el global) |
| `AMAZON_TAG` | `miblog-21` | Tag de afiliado Amazon (blogs animales) |

### Columnas nuevas a agregar

| Columna | Tipo | Para qué sirve |
|---------|------|----------------|
| `CLUSTERS_ULTIMO_PROCESO` | Texto (fecha ISO) | El flujo actualiza esto para rotar blogs. Dejar vacío en blogs nuevos. |
| `NEXT_PAGE_TOKEN` | Texto | Token de paginación del API de Blogger. El flujo lo gestiona automáticamente. |
| `PREMIUM_FORM_URL` | Texto | URL del formulario de calificación premium en systeme.io (abogados) |
| `BRAND_COLOR` | Texto | Color hex del blog, ej: `#16a34a`. Si vacío, se usa el color global del CONFIG. |
| `LEAD_VALUE_STANDARD` | Número | Valor del lead estándar en USD (default: 150) |
| `LEAD_VALUE_PREMIUM` | Número | Valor del lead premium en USD (default: 250) |
| `ESTRATEGIA` | Texto (opcional) | Forzar estrategia: `animales_productos` o `lead_abogados`. Si vacío, se auto-detecta. |
| `ULTIMO_LEAD_PREMIUM` | Texto (fecha ISO) | Lo escribe el webhook de leads premium |
| `LEADS_PREMIUM_TOTAL` | Número | Contador de leads premium — lo gestiona el webhook |
| `ULTIMO_LEAD_EMAIL` | Texto | Email del último lead premium registrado |

---

## PASO 2 — Configurar el nodo ⚙️ CONFIG

En `blog-factory-autopilot-v2.json`, edita el nodo **⚙️ CONFIG**:

| Campo | Descripción |
|-------|-------------|
| `SHEET_ID` | Ya está preconfigurado con tu Sheet |
| `HOJA_BLOGS` | Nombre de la pestaña: `Blogs` (o el nombre que uses) |
| `DEEPSEEK_API_KEY` | Tu API key de platform.deepseek.com |
| `LABEL_PILAR` | Etiqueta de posts pilar en Blogger: `pilar` |
| `FUNNEL_ANIMALES` | URL de systeme.io para blogs de animales (fallback global) |
| `FUNNEL_ABOGADOS` | URL de systeme.io para captación de leads legales (fallback global) |
| `PREMIUM_URL_DEFAULT` | URL del formulario de calificación premium (fallback global) |
| `COLOR_ANIMALES` | Hex: `#16a34a` |
| `COLOR_ABOGADOS` | Hex: `#1e40af` |
| `POSTS_PER_PAGE` | Posts cluster por ejecución: `10` (puedes subir a `25` si n8n aguanta) |

---

## PASO 3 — Credenciales en n8n

### Google Sheets OAuth2
Nodos: `📊 Leer Blogs (Sheet)` y `📊 Sheet: Marcar Blog Procesado` y `📊 Sheet: Avanzar Página`
- Tipo: **Google Sheets OAuth2** (`googleSheetsOAuth2Api`)

### Google API (Blogger)
Nodos: `🏛️ Obtener Posts Pilar`, `📄 Obtener Página de Clusters` y `📤 Blogger: Actualizar Post`
- Tipo: **Google API** (`googleApi`) con scope `https://www.googleapis.com/auth/blogger`

---

## PASO 4 — Webhook para Leads Premium

Importa `lead-premium-receiver.json` como un segundo flujo en n8n.

1. Activa el flujo
2. Copia la URL del webhook: `https://TU_N8N.contabo.com/webhook/lead-premium`
3. En systeme.io, configura un webhook en el formulario de calificación premium con esa URL
4. Parámetros POST que systeme.io debe enviar:

| Campo | Requerido | Descripción |
|-------|-----------|-------------|
| `email` | ✅ | Email del lead |
| `first_name` | | Nombre |
| `phone` | | Teléfono |
| `blog_id` | ✅ | ID del blog de Blogger (para localizar la fila en Sheet) |
| `blog_name` | | Nombre del blog (fallback si no viene blog_id) |
| `lead_value` | | Valor del lead en USD (default: 250) |

---

## Detección automática de estrategia

El flujo lee el `NICHO` + `BLOG_NAME` de cada blog y detecta:

**→ `lead_abogados`** si contiene: `abog`, `litig`, `legal`, `leyes`, `impuesto`, `multa`, `accidente`, `bienes ra`, `familia usa`, `herencia`, `divorcio`, `demanda`, `delito`

**→ `animales_productos`** para el resto

Puedes forzar la estrategia en la columna `ESTRATEGIA` del Sheet.

---

## Qué genera DeepSeek por cada post (6 bloques)

| Bloque | Marcador HTML | Posición | Descripción |
|--------|--------------|----------|-------------|
| Hiperenlaces tipo silo | `<!-- CONTEXTUAL_LINKS -->` | 20–30% | 2-3 enlaces pill con emoji al pilar y clusters hermanos |
| CTA temprano | `<!-- EARLY_CTA -->` | 30% | Caja de conversión: lead capture (legal) o producto (animales) |
| Bloque comercial | `<!-- COMMERCIAL_BLOCKS -->` | 50% | Tabla comparativa o checklist |
| Segundo CTA | `<!-- SECOND_CTA -->` | 65% | CTA con urgencia diferente al primero |
| FAQ Schema | `<!-- FAQ_SCHEMA -->` | Final | JSON-LD con 3-5 preguntas frecuentes para SEO |
| Popup (exit + scroll) | `<!-- POPUP_BLOCK -->` | Final | 2 popups: exit intent + scroll 60%. sessionStorage. Botón cierre 28px. |

---

## Rotación automática de blogs

Con 35 blogs activos y ejecución cada 5 minutos:
- Cada 5 min → 1 post procesado en el blog menos procesado
- Cada blog recibe atención ~1 vez cada 35 × (tiempo entre posts del mismo blog)
- El campo `NEXT_PAGE_TOKEN` va avanzando páginas de 10 posts hasta cubrir todo el blog
- Cuando llega al final (sin más pageToken), vuelve a empezar desde cero en el siguiente ciclo

**Recomendación de velocidad:**
- `POSTS_PER_PAGE = 10` → selecciona 1 de los 10 de la página por run (conservador, recomendado para empezar)
- Si quieres procesar más rápido: aumenta la frecuencia del schedule a cada 2 min, o aumenta `POSTS_PER_PAGE`

---

## Columnas Sheet — resumen completo

```
BLOG_ID | BLOG_NAME | NICHO | ESPECIE | ACTIVE | LEAD_MAGNET_URL | AMAZON_TAG
ESTRATEGIA | BRAND_COLOR | LEAD_VALUE_STANDARD | LEAD_VALUE_PREMIUM | PREMIUM_FORM_URL
CLUSTERS_ULTIMO_PROCESO | NEXT_PAGE_TOKEN
ULTIMO_LEAD_PREMIUM | LEADS_PREMIUM_TOTAL | ULTIMO_LEAD_EMAIL
```
