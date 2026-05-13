# ARQUITECTURA MAESTRA — Content Factory
## Sistema Autónomo de Producción Industrial de Contenido
### Versión 1.0 — Documento vivo (actualizar con cada cambio estructural)

---

# PARTE 1 — ESTADO ACTUAL Y AUDITORÍA

## 1.1 Inventario Completo de Workflows

### WORKFLOWS DEFINITIVOS DE PRODUCCIÓN (mantener activos)

| ID n8n | Nombre canónico | Función | Estado requerido |
|---|---|---|---|
| *(asignar tras import)* | `01_MASTER_SCHEDULER` | Orquestador central, adquiere locks, llama sub-workflows | ACTIVO |
| *(asignar tras import)* | `02_AI_CONTENT_GENERATOR` | Genera HTML con DeepSeek | ACTIVO |
| *(asignar tras import)* | `04_BLOGGER_PUBLISHER` | Publica en Blogger, maneja 429 | ACTIVO |
| *(asignar tras import)* | `05_LOCK_WATCHDOG` | Libera zombie locks > 35 min | ACTIVO |

### WORKFLOWS PELIGROSOS — ELIMINAR INMEDIATAMENTE

| Nombre en UI | Riesgo | Acción |
|---|---|---|
| `TEMP_READ_PIPELINE` | Consume operaciones, puede leer estado corrupto | **ELIMINAR** |
| `Sheet Reset Row 2 v2` | Sobreescribe filas de producción | **ELIMINAR** |
| `TEMP_UPDATE_ROW_3_FIXED_CREDENTIALS` | Hardcoded: corrompe fila específica | **ELIMINAR** |
| `02_AI_OUTLINE_GENERATOR_FIXED` (versión vieja) | Duplica generación, conflicto de estado | **ELIMINAR** |
| Cualquier `TEMP_*` o `TEST_*` activo | Sin excepción | **ELIMINAR** |

**Regla permanente:** Ningún workflow con prefijo TEMP o TEST debe sobrevivir más de 24 horas en producción.

---

# PARTE 2 — ARQUITECTURA DEFINITIVA

## 2.1 Ecosistema Completo por Fases

```
FASE 1 — PRODUCCIÓN (HOY)
├── 01_MASTER_SCHEDULER
├── 02_AI_CONTENT_GENERATOR
├── 04_BLOGGER_PUBLISHER
└── 05_LOCK_WATCHDOG

FASE 2 — MONETIZACIÓN (semana 2-3)
├── 06_AFFILIATE_INJECTOR
└── 07_ADSENSE_OPTIMIZER

FASE 3 — DISTRIBUCIÓN (mes 2)
├── 08_SOCIAL_DISTRIBUTOR
└── 09_TELEGRAM_BROADCASTER

FASE 4 — SEO AVANZADO (mes 2-3)
├── 10_INTERLINK_BUILDER
└── 11_META_OPTIMIZER

FASE 5 — MULTIMEDIA (mes 3+)
├── 12_REEL_GENERATOR
└── 13_IMAGE_GENERATOR

FASE 6 — INTELIGENCIA (mes 4+)
└── 14_PERFORMANCE_ANALYZER
```

## 2.2 Estructura de Carpetas en n8n UI

```
n8n Workflows/
├── 📁 PRODUCCION/
│   ├── 01_MASTER_SCHEDULER
│   ├── 02_AI_CONTENT_GENERATOR
│   ├── 04_BLOGGER_PUBLISHER
│   └── 05_LOCK_WATCHDOG
├── 📁 MONETIZACION/
│   ├── 06_AFFILIATE_INJECTOR
│   └── 07_ADSENSE_OPTIMIZER
├── 📁 DISTRIBUCION/
│   ├── 08_SOCIAL_DISTRIBUTOR
│   └── 09_TELEGRAM_BROADCASTER
├── 📁 SEO/
│   ├── 10_INTERLINK_BUILDER
│   └── 11_META_OPTIMIZER
├── 📁 MULTIMEDIA/
│   ├── 12_REEL_GENERATOR
│   └── 13_IMAGE_GENERATOR
├── 📁 INTELIGENCIA/
│   └── 14_PERFORMANCE_ANALYZER
└── 📁 _ARCHIVO/
    └── (workflows obsoletos, NO activos)
```

## 2.3 Convención de Nomenclaturas

### Workflows
```
NN_NOMBRE_EN_MAYUSCULAS
│   └── Verbo + sustantivo, sin spaces
└── Número de orden (01-99)

Ejemplos válidos:
  01_MASTER_SCHEDULER
  06_AFFILIATE_INJECTOR
  10_INTERLINK_BUILDER

Ejemplos inválidos:
  temp_test_v2_final_REAL
  workflow_blogger_nuevo
  test copy 3
```

### Carpetas en Google Sheets
```
CONTENT_PIPELINE   — pipeline principal (producción)
NICHE_CONFIG       — configuración de nichos, prompts, blogs
PUBLISHED_POSTS    — registro de posts publicados con métricas
AFFILIATE_LINKS    — biblioteca de links de afiliados por keyword
SOCIAL_QUEUE       — cola de distribución social
PERFORMANCE_LOG    — métricas de rendimiento por artículo
```

### Nomenclatura de columnas en Sheets
```
MAYUSCULAS_CON_GUION_BAJO
Sin acentos, sin espacios, en inglés o español consistente.

Bien:  ROW_NUMBER, STATUS, LOCK, BLOG_ID, HTML_CONTENT
Mal:   RowNumber, estado, lock status, html
```

### Credenciales en n8n
```
[Servicio] [Tipo] [Cuenta/Entorno]

Ejemplos:
  "Google Sheets account"
  "Google Blogger OAuth2"
  "DeepSeek API"
  "Telegram Bot production"
  "Amazon Associates API"
```

---

# PARTE 3 — GOOGLE SHEETS: ESQUEMA DEFINITIVO

## 3.1 CONTENT_PIPELINE — Columnas Definitivas

| Col | Campo | Tipo | Quién escribe | Descripción |
|---|---|---|---|---|
| A | `ROW_NUMBER` | Int | Manual/fórmula | `=ROW()` o manual. Clave de matching. |
| B | `STATUS` | Enum | Todos | Ver estados en 3.2 |
| C | `LOCK` | TRUE/FALSE | 01, 04, 05 | Mutex de fila |
| D | `LOCK_TIMESTAMP` | ISO8601 | 01 | Cuándo se adquirió el lock |
| E | `TITLE` | Texto | **MANUAL** | Título del artículo |
| F | `NICHE` | Texto | **MANUAL** | Nicho: veterinary, finanzas, etc. |
| G | `KEYWORDS` | CSV | **MANUAL** | keyword1, keyword2, keyword3 |
| H | `BLOG_ID` | Int | **MANUAL** | ID numérico del blog en Blogger |
| I | `LANGUAGE` | es/en | **MANUAL** | Idioma del artículo (default: es) |
| J | `PRIORITY` | 1-5 | **MANUAL** | 1=máxima prioridad (futuro: sort por prioridad) |
| K | `HTML_CONTENT` | HTML | 02 | Artículo completo en HTML |
| L | `TOKENS_USED` | Int | 02 | Para monitoreo de costos |
| M | `GENERATED_AT` | ISO8601 | 02 | Timestamp de generación |
| N | `PUBLISHED_URL` | URL | 04 | URL del post publicado |
| O | `POST_ID` | Texto | 04 | ID del post en Blogger |
| P | `PUBLISHED_AT` | ISO8601 | 04 | Timestamp de publicación |
| Q | `AFFILIATE_INJECTED` | TRUE/FALSE | 06 | Si ya tiene links de afiliado |
| R | `SOCIAL_DISTRIBUTED` | TRUE/FALSE | 08 | Si ya fue distribuido en redes |
| S | `INTERLINKS_ADDED` | TRUE/FALSE | 10 | Si tiene interlinking SEO |
| T | `ERROR_MESSAGE` | Texto | Todos | Último error (se sobreescribe) |
| U | `RETRY_COUNT` | Int | 01 | Número de reintentos (max 3) |

## 3.2 Estados del Pipeline

```
PENDING       → En cola, esperando ser procesado
QUEUED        → Lock adquirido, procesando
CONTENT_READY → HTML generado y guardado
PUBLISHING    → Enviando a Blogger
PUBLISHED     → Publicado exitosamente
FAILED        → Error irrecuperable (requiere revisión manual)
SKIP          → No procesar (marcado manualmente para omitir)
```

**Transiciones válidas:**
```
PENDING → QUEUED (por 01)
QUEUED → CONTENT_READY (por 02)
CONTENT_READY → PUBLISHING (por 04)
PUBLISHING → PUBLISHED (por 04 en éxito)
PUBLISHING → FAILED (por 04 en error)
QUEUED/CONTENT_READY/PUBLISHING → PENDING (por 05 watchdog en zombie lock)
FAILED → PENDING (manual: para reintentar)
cualquiera → SKIP (manual: para excluir)
```

## 3.3 NICHE_CONFIG — Hoja de Configuración

Esta hoja controla los prompts y configuración por nicho sin tocar código.

| Col | Campo | Ejemplo |
|---|---|---|
| A | `NICHE_ID` | veterinary |
| B | `DISPLAY_NAME` | Medicina Veterinaria |
| C | `LANGUAGE` | es |
| D | `TONE` | experto, educativo, cercano |
| E | `AUDIENCE` | dueños de mascotas preocupados |
| F | `MIN_WORDS` | 1200 |
| G | `MAX_WORDS` | 1800 |
| H | `PROMPT_EXTRA` | Incluye siempre síntomas específicos y cuándo ir al veterinario |
| I | `AFFILIATE_CATEGORY` | pet-supplies |
| J | `RPM_ESTIMATE` | 3.50 |
| K | `ACTIVE` | TRUE |

**Uso:** En 02_AI_CONTENT_GENERATOR, antes de llamar DeepSeek, el workflow lee NICHE_CONFIG para construir el prompt. Cambiar el prompt = editar la hoja, no el workflow.

---

# PARTE 4 — PIPELINES DEFINITIVOS

## 4.1 Pipeline de Producción (Fase 1 — HOY)

```
ENTRADA: fila en CONTENT_PIPELINE con STATUS=PENDING
   │
   ▼
01_MASTER_SCHEDULER (cada 20 min)
   ├── Lee toda CONTENT_PIPELINE
   ├── Filtra STATUS=PENDING, LOCK=FALSE, RETRY_COUNT < 3
   ├── Ordena por PRIORITY desc, ROW_NUMBER asc
   ├── Toma 1 fila
   ├── Adquiere lock: LOCK=TRUE, STATUS=QUEUED, LOCK_TIMESTAMP=now
   │
   ▼
02_AI_CONTENT_GENERATOR
   ├── Lee NICHE_CONFIG para el nicho de la fila
   ├── Construye prompt dinámico
   ├── Llama DeepSeek (timeout 120s, retry 3x con backoff 5s)
   ├── Limpia respuesta (elimina markdown fences)
   ├── Valida mínimo 500 caracteres
   ├── Guarda HTML_CONTENT, STATUS=CONTENT_READY
   └── Retorna HTML al caller
   │
   ▼
04_BLOGGER_PUBLISHER
   ├── STATUS=PUBLISHING
   ├── POST a Blogger API
   ├── Si 429: espera 90s → retry 1x
   ├── Si éxito: STATUS=PUBLISHED, LOCK=FALSE, guarda URL
   └── Si falla: STATUS=FAILED, LOCK=FALSE, guarda error
   │
   ▼
SALIDA: artículo en vivo en Blogger + URL en CONTENT_PIPELINE

05_LOCK_WATCHDOG (cada 30 min, independiente)
   └── Libera locks > 35 min → STATUS=PENDING para reintento
```

**Capacidad:** 72 artículos/día (cada 20 min, 24/7)

## 4.2 Pipeline de Monetización (Fase 2)

```
TRIGGER: STATUS=PUBLISHED en CONTENT_PIPELINE

06_AFFILIATE_INJECTOR
   ├── Lee PUBLISHED_URL del post
   ├── Obtiene HTML_CONTENT de la fila
   ├── Lee AFFILIATE_LINKS sheet para keywords del nicho
   ├── Inyecta links Amazon Associates en el HTML
   │   (max 3 links por artículo, no spam)
   ├── Actualiza el post en Blogger via API (PATCH)
   └── Marca AFFILIATE_INJECTED=TRUE

AFFILIATE_LINKS sheet:
   keyword | amazon_url | product_name | commission | niche
   "comida para hurones" | amzn.to/xxx | [producto] | 4% | hurones
```

**Nota:** AdSense se activa automáticamente al tener el código en el blog. No requiere workflow.

## 4.3 Pipeline de Distribución Social (Fase 3)

```
TRIGGER: STATUS=PUBLISHED + AFFILIATE_INJECTED=TRUE

08_SOCIAL_DISTRIBUTOR
   ├── Lee post de Blogger (título, URL, primer párrafo)
   ├── Genera caption para redes (DeepSeek, 50 tokens)
   ├── Publica en Telegram channel (Bot API)
   ├── Publica en Facebook Page (Graph API)
   ├── Agrega a SOCIAL_QUEUE para Pinterest/Twitter
   └── Marca SOCIAL_DISTRIBUTED=TRUE

09_TELEGRAM_BROADCASTER (separado)
   ├── Trigger: manual o semanal
   ├── Agrupa artículos de la semana por nicho
   └── Envía resumen semanal al canal
```

## 4.4 Pipeline SEO Avanzado (Fase 4)

```
10_INTERLINK_BUILDER (semanal)
   ├── Lee todos los posts PUBLISHED del mismo BLOG_ID
   ├── Para cada post nuevo, busca posts relacionados (keyword matching)
   ├── Genera sugerencias de interlinks (máximo 3 por post)
   ├── Actualiza posts en Blogger via API (PATCH)
   └── Marca INTERLINKS_ADDED=TRUE

11_META_OPTIMIZER (opcional, mensual)
   ├── Analiza posts con bajo tráfico (Google Search Console API)
   ├── Sugiere mejoras de título y meta descripción
   └── Actualiza posts vía Blogger API
```

## 4.5 Pipeline de Reels Automáticos (Fase 5)

```
12_REEL_GENERATOR
   ├── Trigger: STATUS=PUBLISHED en nichos seleccionados
   ├── Extrae los 5 puntos clave del artículo (DeepSeek, 100 tokens)
   ├── Genera script de reel (30-60 segundos, 5 slides)
   ├── Llama servicio de generación de video (Remotion/Creatomate API)
   │   o genera imágenes + texto con Canva API
   ├── Descarga video generado
   ├── Publica en Instagram Reels via API
   ├── Publica en TikTok via API
   └── Marca REEL_CREATED=TRUE en CONTENT_PIPELINE
```

## 4.6 Pipeline de Comunidades (Fase 5)

```
09_TELEGRAM_BROADCASTER (evolución)
   ├── Canal público: artículos con CTA hacia blog
   ├── Grupo privado (pago): contenido exclusivo, tips, Q&A
   ├── Bot de bienvenida con link de pago (Stripe/PayPal)
   └── Secuencia de onboarding automática (5 mensajes en 5 días)

Modelo de negocio:
   Canal gratuito → tráfico al blog → AdSense + Afiliados
   Grupo pago ($5-15/mes) → ingresos directos recurrentes
```

---

# PARTE 5 — OPTIMIZACIONES CRÍTICAS

## 5.1 Optimización DeepSeek (reducción de costos)

### Prompt Engineering para mínimo de tokens

**Reglas:**
1. **Un solo llamado por artículo.** No outline + content. Todo en uno.
2. **System prompt corto** (< 50 tokens). Solo el rol y la restricción de formato.
3. **Instrucción de longitud explícita** en el prompt para evitar respuestas largas innecesarias.
4. **No pedir ejemplos** en el prompt. No "por ejemplo...".
5. **`max_tokens: 3000`** es suficiente para 1500 palabras en HTML. No subir a 4096 salvo nichos largos.

**Prompt optimizado (ejemplo veterinario):**
```
SYSTEM (45 tokens):
"Expert SEO writer for {niche}. Output ONLY HTML. No markdown. No explanations."

USER (varía por nicho):
"Write SEO article: '{title}'
Keywords: {keywords}
Lang: {language}
Length: 1200-1500 words
Structure: H1, intro (2p), 4 H2s (2-3p each), conclusion
Bold key terms. No preamble, start with <h1>."
```

**Ahorro estimado:** De ~2,900 tokens → ~2,200 tokens por artículo = **24% menos costo**.

### Caché de prompts (futuro)
- Prompts idénticos (mismo nicho, misma estructura) = misma parte del prompt
- DeepSeek no cobra caching explícito, pero tokens de entrada son más baratos que salida
- Mantener system prompts cortos y reutilizables

### Temperatura óptima
- Artículos informativos: `temperature: 0.6` (más consistente, menos "creativo")
- Artículos de opinión/listas: `temperature: 0.75`
- Nunca > 0.8 (demasiada variabilidad en HTML)

## 5.2 Optimización Blogger

### Límites reales de Blogger API
```
Cuota por defecto: 10,000 unidades/día por proyecto Google Cloud
Crear post: 1 unidad
Actualizar post: 1 unidad
Leer post: 1 unidad

72 posts/día = 72 unidades (0.72% de la cuota diaria)
Con afiliados + interlinking: ~200 unidades/día máximo
Sin problema hasta ~5,000 posts/día (muy por encima de necesidades actuales)
```

### Evitar 429 definitivamente
- **1 post cada 20 min** = nunca llega al rate limit de Blogger
- Si se quiere acelerar: distribuir entre múltiples proyectos Google Cloud
- Cada proyecto Cloud tiene su propia cuota de 10,000 unidades/día
- Con 5 proyectos = capacidad para 50,000 operaciones/día

### Optimización de la llamada API
```javascript
// Payload mínimo — no enviar campos innecesarios
{
  "kind": "blogger#post",
  "blog": { "id": BLOG_ID },
  "title": TITLE,
  "content": HTML_CONTENT,
  "labels": [NICHE]
  // No enviar: author, dates, replies, status
}
```

### Publicación en borrador primero (opcional)
```javascript
// ?isDraft=true en la URL para publicar como borrador
// Ventaja: se puede revisar antes de publicar
// Desventaja: requiere un paso adicional para publicar
// Recomendación: NO usar en producción automática
```

## 5.3 Optimización Google Sheets

### Problema: Google Sheets es el cuello de botella
Cada ciclo de 01_MASTER_SCHEDULER hace:
- 1 lectura de toda la hoja (getValues)
- 1-2 escrituras de update

Con 1,000 filas, leer toda la hoja es lento. Con 10,000 filas, es un problema real.

### Solución: Sheets eficiente

**Regla 1: Archivar posts PUBLISHED**
```
Después de 7 días publicado → mover a hoja PUBLISHED_ARCHIVE
CONTENT_PIPELINE solo tiene filas PENDING, QUEUED, FAILED
Resultado: CONTENT_PIPELINE siempre pequeño (< 200 filas activas)
```

**Regla 2: No leer columnas de contenido en 01**
```
01_MASTER_SCHEDULER NO necesita leer HTML_CONTENT (columna K)
Solo necesita: ROW_NUMBER, STATUS, LOCK, LOCK_TIMESTAMP, TITLE, NICHE, KEYWORDS, BLOG_ID, LANGUAGE, PRIORITY
Usar ranges específicos: A:J en lugar de A:T para la lectura inicial
```

**Regla 3: Escrituras en batch cuando sea posible**
```
Mejor: actualizar STATUS + LOCK + LOCK_TIMESTAMP en un solo update
Peor: tres updates separados (3x la latencia, 3x el riesgo de fallo parcial)
```

**Regla 4: ROW_NUMBER como clave absoluta**
```
Nunca buscar por título o keyword (comparación lenta)
Siempre matching por ROW_NUMBER (entero, búsqueda O(1))
```

### Límites de Google Sheets API
```
300 requests/minuto por proyecto (escrituras)
60 requests/minuto por usuario
Con 1 artículo/20 min: ~9 requests/hora → insignificante
Con futuro batch de 10 artículos/hora: ~90 requests/hora → sin problema
```

## 5.4 Eliminación de Race Conditions

### El problema de concurrencia en n8n
n8n puede ejecutar múltiples instancias del mismo workflow si el cron dispara antes de que termine la ejecución anterior.

**Escenario peligroso:**
```
T=0:00 → Ciclo 1 empieza, lee fila 5, LOCK=FALSE, empieza a adquirir lock
T=0:01 → Ciclo 2 empieza, lee fila 5 antes de que Ciclo 1 escribiera LOCK=TRUE
T=0:02 → Ambos ciclos adquieren lock en fila 5 → DUPLICADO
```

### Solución implementada: concurrencia = 1

**En 01_MASTER_SCHEDULER → Settings → Execution:**
```
"Max concurrent executions": 1
```

Esto hace que si el cron dispara y ya hay una ejecución en curso, la nueva ejecución espera o se descarta (configurable). Esto es la defensa primaria.

**Defensa secundaria (en código):**
```javascript
// Antes de procesar, verificar que el lock no fue adquirido
// por otra instancia en los últimos 5 segundos
// (verificación doble después de escribir)
```

**Resultado:** 0 race conditions posibles con este diseño.

## 5.5 Estrategia de Locks — Diseño Definitivo

```
Lock = mutex de fila, no mutex global
Cada fila tiene su propio lock
Máximo 1 fila procesada a la vez (por concurrencia=1 en 01)

Ciclo de vida del lock:
1. ADQUIRIR: LOCK=TRUE, STATUS=QUEUED, LOCK_TIMESTAMP=ISO8601
2. LIBERAR (éxito): LOCK=FALSE, STATUS=PUBLISHED, LOCK_TIMESTAMP=""
3. LIBERAR (fallo): LOCK=FALSE, STATUS=FAILED, LOCK_TIMESTAMP=""
4. LIBERAR (zombie): via WATCHDOG → LOCK=FALSE, STATUS=PENDING, LOCK_TIMESTAMP=""

Tiempo máximo que puede durar un lock:
- Normal: 2-4 minutos (DeepSeek + Blogger)
- Con retry 429: ~6 minutos
- Watchdog actúa a: 35 minutos
- Margen de seguridad: 29 minutos

No existe condición donde un lock quede permanente.
```

---

# PARTE 6 — ESTRATEGIA DE PRODUCCIÓN INDUSTRIAL

## 6.1 Roadmap de Escala

### Semana 1 (HOY): Estabilización
```
Meta: 72 artículos/día sin intervención manual
Blogs activos: 1-2
Nichos: 1-2
Volumen: ~500 artículos/mes
Ingresos esperados: $0-50 (AdSense comienza después de ~3 meses)
```

### Mes 1: Expansión de nichos
```
Meta: 200-300 artículos/día
Blogs activos: 5-10
Nichos: 5-8 (vet + 2-3 alto RPM)
Cambio técnico: cron de 20 min → 8 min
                múltiples entradas en CONTENT_PIPELINE
Volumen: ~6,000-9,000 artículos/mes
Ingresos esperados: afiliados primeros $50-200
```

### Mes 2-3: Monetización activa
```
Meta: AdSense aprobado en blogs con 50+ artículos
Affiliate injector funcionando
Telegram con 500+ suscriptores
Ingresos esperados: $200-800/mes (AdSense + afiliados)
```

### Mes 6: Escala industrial
```
Blogs activos: 20-30
Artículos/mes: 50,000+
Nichos: 15+
Idiomas: es + en
Ingresos esperados: $2,000-8,000/mes
```

### Año 1: Libertad financiera
```
Blogs activos: 50-100
Artículos totales: 200,000+
Nichos de alto RPM en inglés dominados
Comunidades pagas activas
Ingresos esperados: $5,000-20,000/mes
```

## 6.2 Estrategia Multinicho por RPM

### Prioridad de nichos (ordenar pipeline por esta lógica)

```
TIER 1 — RPM $20-80 USD (inglés, máxima prioridad)
  insurance, legal, finance, SaaS, real-estate, loans
  → 1 artículo/nicho/día mínimo

TIER 2 — RPM $8-20 USD (español e inglés)
  IA, automatización, software, health, employment
  → 1 artículo/nicho cada 2 días

TIER 3 — RPM $2-8 USD (español, volumen alto)
  veterinary, hurones, bulldogs, chinchillas, exotic-pets
  → 3-5 artículos/día (volumen compensa RPM bajo)
```

**Implementación en CONTENT_PIPELINE:**
```
Campo PRIORITY:
  1 = Tier 1 (máxima)
  2 = Tier 2
  3 = Tier 3

01_MASTER_SCHEDULER ordena por PRIORITY ascendente primero.
Siempre se publica Tier 1 antes que Tier 3.
```

## 6.3 Estrategia de Blogs por País/Idioma

```
ESPAÑOL — Ecuador, Colombia, México, España, Argentina
  Blog veterinario: mascotas, salud animal, sintomas
  Blog finanzas: ahorro, crédito, inversión latam
  Blog tecnología: IA, automatización, herramientas

INGLÉS — USA, UK, Canada, Australia
  Blog insurance: auto, home, life, health insurance
  Blog legal: employment law, personal injury, immigration
  Blog finance: credit cards, loans, investing
  Blog SaaS: software reviews, comparisons, tutorials

Cada idioma/país = BLOG_ID diferente + campo LANGUAGE en pipeline
No se necesita cambiar ningún workflow, solo agregar filas con los datos correctos.
```

## 6.4 Escalar a Decenas de Miles de Artículos

### Limitaciones actuales y cómo superarlas

**Limitación 1: Google Sheets se pone lento con >5,000 filas**
```
Solución: Sistema de rotación de hojas
  - CONTENT_PIPELINE: solo filas activas (< 200)
  - PUBLISHED_ARCHIVE_YYYY_MM: posts publicados del mes
  - Script mensual: mover PUBLISHED de hace 30+ días al archivo
  
Implementación: workflow mensual 15_ARCHIVER
  Cron: 1er día del mes → mueve STATUS=PUBLISHED de hace 30 días al archivo
```

**Limitación 2: Un solo proyecto Google Cloud**
```
Solución: múltiples proyectos con credenciales rotativas
  Cada proyecto: 10,000 unidades/día Blogger API
  Con 10 proyectos: 100,000 operaciones/día
  
Campo en CONTENT_PIPELINE: CREDENTIAL_SET (A, B, C...)
01 rota entre credential sets según el BLOG_ID
```

**Limitación 3: DeepSeek tiene rate limits**
```
DeepSeek free: 50 RPM (requests per minute)
Con 1 artículo/20min: uso real = 3/hora → sin problema
Con escala masiva: usar múltiples API keys o OpenAI como fallback
```

**Limitación 4: Un solo n8n**
```
Para >1000 artículos/día: considerar múltiples instancias n8n
o migrar orquestación a una cola (Redis/BullMQ)
Pero para el objetivo de libertad financiera: un solo n8n es más que suficiente
```

---

# PARTE 7 — MÉTRICAS Y MONITOREO MÍNIMO

## 7.1 Lo que SÍ monitorear (sin dashboards complejos)

Revisar 1 vez al día en Google Sheets:

```
=COUNTIF(CONTENT_PIPELINE!B:B,"PUBLISHED")   → artículos publicados hoy
=COUNTIF(CONTENT_PIPELINE!B:B,"FAILED")       → fallos (> 5 = revisar)
=COUNTIF(CONTENT_PIPELINE!B:B,"PENDING")      → queue disponible
=COUNTIF(CONTENT_PIPELINE!C:C,"TRUE")         → locks activos (debe ser 0 o 1)
=SUM(CONTENT_PIPELINE!K:K)                    → tokens totales usados
```

## 7.2 Alertas críticas (sin complejidad)

**Una sola alerta de Telegram cuando:**
- FAILED_COUNT > 5 en las últimas 2 horas
- PENDING_COUNT = 0 (pipeline vacío, necesita alimentarse)
- LOCK activo por > 40 minutos (watchdog falló)

**Implementación:** Un nodo de Telegram al final de 05_LOCK_WATCHDOG cuando libera > 3 zombies.

---

# PARTE 8 — ESTRUCTURA DEFINITIVA DEL REPOSITORIO

```
luis-claude-code-n8n/
├── workflows/
│   ├── production/
│   │   ├── 01_MASTER_SCHEDULER.json
│   │   ├── 02_AI_CONTENT_GENERATOR.json
│   │   ├── 04_BLOGGER_PUBLISHER.json
│   │   └── 05_LOCK_WATCHDOG.json
│   ├── monetization/
│   │   ├── 06_AFFILIATE_INJECTOR.json          (fase 2)
│   │   └── 07_ADSENSE_OPTIMIZER.json           (fase 2)
│   ├── distribution/
│   │   ├── 08_SOCIAL_DISTRIBUTOR.json          (fase 3)
│   │   └── 09_TELEGRAM_BROADCASTER.json        (fase 3)
│   ├── seo/
│   │   ├── 10_INTERLINK_BUILDER.json           (fase 4)
│   │   └── 11_META_OPTIMIZER.json              (fase 4)
│   ├── multimedia/
│   │   ├── 12_REEL_GENERATOR.json              (fase 5)
│   │   └── 13_IMAGE_GENERATOR.json             (fase 5)
│   └── maintenance/
│       └── 15_ARCHIVER.json                    (fase 2)
├── sheets/
│   ├── CONTENT_PIPELINE_template.csv           (estructura de columnas)
│   └── NICHE_CONFIG_template.csv               (config de nichos)
├── scripts/
│   └── bulk_fill_pipeline.py                   (script para cargar 1000+ títulos)
├── docs/
│   ├── ARQUITECTURA_MAESTRA.md                 (este documento)
│   ├── DEPLOY.md                               (instrucciones de deploy)
│   └── NICHOS_Y_KEYWORDS.md                    (estrategia SEO por nicho)
└── README.md
```

---

# PARTE 9 — PRÓXIMOS PASOS CONCRETOS

## Esta semana (prioridad absoluta):

```
DÍA 1:
  □ Eliminar workflows TEMP/peligrosos en n8n UI
  □ Importar 4 workflows nuevos
  □ Verificar credenciales Google Sheets + DeepSeek + Blogger
  □ Ajustar schema de CONTENT_PIPELINE si hay diferencias
  □ Test manual: 1 fila PENDING → verificar STATUS=PUBLISHED

DÍA 2:
  □ Activar los 4 workflows
  □ Observar 3 ciclos automáticos (1 hora)
  □ Verificar que los 3 posts aparecen en Blogger
  □ Alimentar pipeline con 100 títulos/keywords

DÍA 3-7:
  □ Pipeline corriendo 24/7 sin intervención
  □ Revisar FAILED una vez al día
  □ Alimentar pipeline cuando PENDING < 50
  □ Monitorear tokens usados vs presupuesto DeepSeek
```

## Próxima semana:
```
  □ Añadir segundo blog (segundo BLOG_ID en CONTENT_PIPELINE)
  □ Añadir primer nicho de alto RPM (seguros/finanzas en inglés)
  □ Implementar 06_AFFILIATE_INJECTOR
  □ Crear NICHE_CONFIG sheet con configuraciones por nicho
```

---

*Documento vivo — actualizar versión y fecha con cada cambio arquitectural.*
*Versión 1.0 — Mayo 2026*
