# Setup — Blog Factory SEO Clusters + DeepSeek

## Importar en tu n8n (Contabo)

1. n8n → Workflows → **Import from file**
2. Selecciona: `workflows/blog-factory-seo-clusters-deepseek.json`

---

## ⚖️ Las 2 Leyes (ya están en el código)

### Ley 1 — DeepSeek NO modifica el contenido
- DeepSeek **no recibe** el texto del artículo
- Solo recibe: título del post, tema/labels, datos del pilar, color de marca
- Solo puede **generar 2 bloques HTML nuevos**
- El código de inyección usa solo `append` en posiciones fijas — nunca `.replace()` sobre el artículo original

### Ley 2 — Si ya existe, skip total
- Antes de llamar a DeepSeek se revisa si el post ya tiene `<!-- CLUSTER_BLOCK -->` y `<!-- CTA_BLOCK -->`
- Si ambos existen → el post **se salta completamente** (no se llama a DeepSeek)
- Si falta uno → solo se genera el que falta
- La inyección tiene un segundo chequeo: si el marcador ya está en el contenido, no inserta nada

---

## Configurar (nodo ⚙️ CONFIG)

| Campo | Qué poner |
|-------|-----------|
| `BLOG_ID` | ID numérico de tu blog (en la URL del panel de Blogger) |
| `LABEL_PILAR` | Etiqueta que usas para posts pilar, ej: `pilar` |
| `DEEPSEEK_API_KEY` | Tu API key de platform.deepseek.com |
| `SYSTEME_URL` | URL de tu funnel en systeme.io |
| `BRAND_COLOR` | Hex de tu color principal, ej: `#2563eb` |
| `BRAND_NAME` | Nombre de tu blog/marca |
| `MAX_CLUSTER_POR_GRUPO` | 5 a 10 (máx posts cluster procesados por grupo) |

---

## Credencial de Blogger (nodo comunitario)

En los nodos `📋 Blogger: Listar Posts` y `📤 Blogger: Actualizar Post`:
1. Tipo de credencial: **Blogger OAuth2** (`bloggerOAuth2Api`)
2. Scope requerido: `https://www.googleapis.com/auth/blogger`
3. Si no aparece el tipo, instala el nodo Blogger desde la tienda de n8n

---

## Estructura de labels en Blogger

```
Post PILAR:   labels → ["pilar", "seo"]
Post CLUSTER: labels → ["seo", "keyword-research"]
Post CLUSTER: labels → ["seo", "link-building"]
```

El workflow detecta automáticamente: posts que tengan `pilar` + una label temática = pilar del cluster. Posts que solo tengan la label temática (sin `pilar`) = cluster posts.

---

## Qué procesa en cada ejecución (con 1500 posts)

- Agrupa todos los posts por label temática
- Por cada grupo: toma **1 pilar + máx 10 cluster** (aleatorio cada vez)
- Filtra los que ya tienen ambos bloques (Ley 2) → solo procesa lo nuevo
- Llama a DeepSeek solo para los que necesitan actualización

Con el tiempo, todos los posts van siendo cubiertos en sucesivas ejecuciones dominicales.

---

## Qué genera DeepSeek para cada post

**Bloque cluster → pilar** (solo en cluster posts, al 65% del artículo):
- Caja con borde izquierdo del color de marca
- Imagen cuadrada 78×78px CSS (gradient + emoji temático del nicho)
- Texto con 2 emojis del nicho que invitan a leer el pilar
- Link "Ver guía completa: [título pilar] →"
- Marcado con `<!-- CLUSTER_BLOCK -->..<!-- /CLUSTER_BLOCK -->`

**Cajón CTA de ventas** (en TODOS los posts, al final):
- Fondo gradient del color de marca
- Imagen cuadrada 88×88px con emoji del nicho
- Título con emoji de urgencia/valor específico del nicho
- 2 bullets de beneficios con emojis del tema
- Botón redondeado → tu funnel de systeme.io
- Marcado con `<!-- CTA_BLOCK -->..<!-- /CTA_BLOCK -->`
