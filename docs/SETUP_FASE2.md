# Setup Rápido — Fase 2: Monetización

## Lo que hay que hacer ANTES de activar los nuevos workflows

---

### 1. Agregar columnas nuevas a CONTENT_PIPELINE

En tu Google Sheet, agregar estas columnas después de las existentes:

| Columna | Nombre | Valor por defecto |
|---|---|---|
| Q | `AFFILIATE_INJECTED` | FALSE |
| R | `SOCIAL_DISTRIBUTED` | FALSE |
| S | `INTERLINKS_ADDED` | FALSE |
| T | `ERROR_MESSAGE` | (vacío) |
| U | `RETRY_COUNT` | 0 |
| V | `TELEGRAM_SENT` | FALSE |

### 2. Crear hoja AFFILIATE_LINKS en el mismo Spreadsheet

Columnas (fila 1 = cabeceras):
```
KEYWORD | PRODUCT_NAME | AMAZON_URL | TYPE | NICHE | COMMISSION | ACTIVE
```

Tipos posibles en la columna TYPE:
- `product` → producto Amazon (usa KEYWORD para buscar en texto)
- `keyword` → inyecta link cuando esa keyword aparece en el texto
- `telegram` → link de tu canal Telegram (PRODUCT_NAME = nombre del canal)
- `lead_magnet` → link de descarga gratuita
- `hotmart` → producto digital en Hotmart/Gumroad

Llena con tu tag de Amazon Associates real. Formato URL:
```
https://www.amazon.com/dp/ASIN?tag=TU_TAG_AMAZON
```

### 3. Crear hoja NICHE_CONFIG en el mismo Spreadsheet

Copiar el contenido de `sheets/NICHE_CONFIG_template.csv`.
**IMPORTANTE:** En la columna `BLOG_ID` poner el ID numérico real de cada blog en Blogger.

### 4. Crear credencial de Telegram en n8n

1. Crear bot en Telegram: hablar con @BotFather → `/newbot`
2. Guardar el TOKEN del bot
3. En n8n → Settings → Credentials → New → Telegram
4. Nombre: `Telegram Bot production`
5. Token: el que dio BotFather

Obtener el CHAT_ID de tu canal:
1. Añadir el bot como administrador al canal
2. Enviar un mensaje al canal
3. Visitar: `https://api.telegram.org/botTOKEN/getUpdates`
4. Buscar `"chat":{"id":` — ese número negativo es tu CHAT_ID

### 5. Editar 08_TELEGRAM_BROADCASTER

Después de importar el workflow:
- Buscar el nodo "Construir Mensaje Telegram"
- Cambiar `'<!-- TELEGRAM_CHAT_ID -->'` por tu CHAT_ID real

### 6. Editar 07_MONETIZATION_INJECTOR

En el nodo "Construir Bloques de Monetización":
- Reemplazar `<!-- HOTMART_URL -->` con tu link de Hotmart
- Reemplazar `<!-- WHATSAPP_URL -->` con `https://wa.me/TUTELEFONO`
- Reemplazar `<!-- NEWSLETTER_URL -->` con tu formulario de email

---

## Orden de importación y activación

1. Importar `02_AI_CONTENT_GENERATOR.json` (reemplaza el anterior)
2. Importar `06_AFFILIATE_INJECTOR.json`
3. Importar `07_MONETIZATION_INJECTOR.json`
4. Importar `08_TELEGRAM_BROADCASTER.json`
5. Importar `25_TITLE_FACTORY.json`

Activar en orden:
1. `25_TITLE_FACTORY` (alimenta el pipeline)
2. `06_AFFILIATE_INJECTOR`
3. `07_MONETIZATION_INJECTOR`
4. `08_TELEGRAM_BROADCASTER`
5. Los 4 workflows de Fase 1 (si no están ya activos)

---

## Flujo completo post-Fase 2

```
TITLE_FACTORY (cada 6h)
  → Genera 25 títulos por nicho activo
  → Inserta en CONTENT_PIPELINE con STATUS=PENDING

MASTER_SCHEDULER (cada 20 min)
  → Toma una fila PENDING
  → Llama 02_AI_CONTENT_GENERATOR (genera HTML con CTAs integrados)
  → Llama 04_BLOGGER_PUBLISHER (publica en Blogger)
  → STATUS = PUBLISHED

AFFILIATE_INJECTOR (cada 25 min)
  → Toma posts PUBLISHED sin afiliados
  → Inyecta links Amazon reales + Telegram + Lead Magnet
  → STATUS: AFFILIATE_INJECTED = TRUE

MONETIZATION_INJECTOR (cada 30 min)
  → Toma posts con afiliados inyectados
  → Agrega bloques Hotmart + WhatsApp + Newsletter al post
  → STATUS: SOCIAL_DISTRIBUTED = TRUE

TELEGRAM_BROADCASTER (cada 22 min)
  → Toma posts completamente monetizados
  → Publica en tu canal de Telegram
  → STATUS: TELEGRAM_SENT = TRUE

LOCK_WATCHDOG (cada 30 min)
  → Libera cualquier zombie lock > 35 min
```

## Costo adicional de Fase 2

| Workflow | Costo extra | Notas |
|---|---|---|
| 06_AFFILIATE_INJECTOR | $0 (API Google = gratis) | Solo lectura/escritura Blogger |
| 07_MONETIZATION_INJECTOR | $0 | HTML hardcodeado |
| 08_TELEGRAM_BROADCASTER | $0 | Bot API de Telegram es gratis |
| 25_TITLE_FACTORY | ~$0.01/ejecución | DeepSeek 25 títulos ≈ 500 tokens |

**Total adicional: < $0.50 USD/día para 72 artículos/día**
