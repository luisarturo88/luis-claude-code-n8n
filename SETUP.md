# Blog Factory Autopilot — Setup Guide

## Lo que hace este workflow (TODO automático)

```
Diario 3am
  → Lee tu Google Sheet con todos los blogs
  → Elige el blog menos procesado (rotación automática)
  → Detecta si es ANIMALES o ABOGADOS/LEGAL
  → Obtiene sus posts de Blogger
  → Agrupa por cluster: 1 pilar + máx 10 cluster posts
  → Filtra posts que ya tienen los 3 bloques (Ley 2)
  → Para cada post nuevo:
      → DeepSeek genera 3 bloques HTML creativos
      → Inyecta sin tocar el contenido original (Ley 1)
      → Actualiza el post en Blogger
  → Marca el blog en el Sheet con timestamp
  → Mañana → siguiente blog en rotación
```

---

## PASO 1 — Agregar columna al Google Sheet

En tu Sheet (`1Vq8TuyqI22C3_Ffth-GsGdDRuXfHORpdAGOiowLxIpk`), agrega estas columnas al final:

| Columna | Tipo | Para qué sirve |
|---------|------|----------------|
| `CLUSTERS_ULTIMO_PROCESO` | Texto/Fecha | El workflow actualiza esto automáticamente para saber qué blog procesar siguiente |
| `ESTRATEGIA` | Texto (opcional) | Si lo dejas vacío, se auto-detecta por el nombre del nicho. Puedes forzar: `animales_productos` o `lead_abogados` |

---

## PASO 2 — Configurar el nodo ⚙️ CONFIG

| Campo | Valor |
|-------|-------|
| `SHEET_ID` | Ya está configurado con tu Sheet ID |
| `HOJA_BLOGS` | Nombre de la pestaña con el listado de blogs (ej: "Blogs", "Sheet1") |
| `DEEPSEEK_API_KEY` | Tu API key de platform.deepseek.com |
| `LABEL_PILAR` | Etiqueta que usas en posts pilar (ej: `pilar`) |
| `MAX_CLUSTER_POR_GRUPO` | 5–10 (posts cluster por grupo por run) |
| `FUNNEL_ANIMALES` | URL de systeme.io para blogs de animales (si el blog no tiene LEAD_MAGNET_URL) |
| `FUNNEL_ABOGADOS` | URL de systeme.io para captación de leads legales |
| `BRAND_COLOR_ANIMALES` | Color hex para blogs de animales (ej: `#16a34a`) |
| `BRAND_COLOR_ABOGADOS` | Color hex para blogs de abogados (ej: `#1e40af`) |

**Nota:** Si un blog ya tiene `LEAD_MAGNET_URL` en el Sheet, se usa ese URL. Los globales son el respaldo.

---

## PASO 3 — Credenciales en n8n

### Google Sheets OAuth2
En nodos `📊 Google Sheets: Leer Blogs` y `📊 Sheets: Marcar Blog Procesado`:
- Tipo: **Google Sheets OAuth2** (`googleSheetsOAuth2Api`)

### Blogger OAuth2
En nodos `📋 Blogger: Listar Posts` y `📤 Blogger: Actualizar Post`:
- Tipo: **Blogger OAuth2** (`bloggerOAuth2Api`)
- Scope: `https://www.googleapis.com/auth/blogger`

---

## Detección automática de estrategia

El workflow lee el `NICHO` de cada blog y detecta automáticamente:

**→ `lead_abogados`** si el nicho contiene: `abog`, `litig`, `legal`, `impuesto`, `multa`, `accidente`, `bienes ra`, `familia usa`, `herencia`, `divorcio`, `demanda`, `delito`

Blogs detectados como legales en tu Sheet:
- Abogados bienes raíces USA
- Abogados de accidente Orlando
- Abogados de familia USA
- Impuestos en USA
- Multas y permisos laborales USA
- Abogados accidente USA
- Litigios USA

**→ `animales_productos`** para el resto (animales, veterinaria, salud, etc.)

---

## Qué genera DeepSeek por cada post

### Para blogs de ANIMALES/VETERINARIA:

| Bloque | Posición | Contenido |
|--------|----------|-----------|
| `CLUSTER_BLOCK` | Al 65% del artículo | Caja con emoji de la especie, imagen cuadrada CSS, link al pilar |
| `CTA_BLOCK` | Al final | Cajón de conversión con imagen, bullets y botón al funnel |
| `POPUP_BLOCK` | Al final | Modal con JS inline: se activa al 40% scroll, exit intent o 10s |

### Para blogs de ABOGADOS/LEGAL:

| Bloque | Posición | Contenido |
|--------|----------|-----------|
| `CLUSTER_BLOCK` | Al 65% del artículo | Caja con emojis legales (⚖️🏛️📜), texto que conecta al pilar legal |
| `CTA_BLOCK` | Al final | Cajón de captación: "¿Necesitas ayuda legal? Consulta GRATIS" → tu form |
| `POPUP_BLOCK` | Al final | Modal urgente con JS: urgencia legal, botón al formulario de lead |

---

## Rotación automática de blogs

Con 35 blogs activos y ejecución diaria:
- Cada blog se procesa una vez cada 35 días
- Con `MAX_CLUSTER_POR_GRUPO = 10`: 11 posts por run (1 pilar + 10 cluster)
- Para 1500 posts en un blog: necesita ~137 ciclos = ~13 años completos

**Recomendación:** Aumenta `MAX_CLUSTER_POR_GRUPO` a 50 para procesar 51 posts por run.
Con 51 posts/run y rotación de 35 días: 1500 posts / 51 = ~30 ciclos = ~3 años.

O activa el schedule 2× por día para duplicar la velocidad.

---

## Las 2 Leyes (ya implementadas en el código)

### ⚖️ Ley 1 — DeepSeek NO modifica el contenido original
- DeepSeek recibe SOLO: título del post, labels, datos del pilar, especie/nicho, URLs
- NUNCA recibe el HTML del artículo
- El código de inyección usa solo `slice() + append` nunca `.replace()` en el original
- Doble verificación: si el marcador ya existe → no se sobreescribe

### ⚖️ Ley 2 — Si ya tiene los 3 bloques → skip total
- Antes del loop se revisa si el post tiene `<!-- CLUSTER_BLOCK -->`, `<!-- CTA_BLOCK -->` y `<!-- POPUP_BLOCK -->`
- Si los 3 existen → el post no entra al loop (no se llama a DeepSeek)
- Revisión adicional en el código de inyección como segunda barrera
