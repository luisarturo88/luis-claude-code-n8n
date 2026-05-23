# Guía de Configuración - SEO Clusters + Popups + Funnel

## Resumen de archivos

| Archivo | Qué hace |
|---------|----------|
| `workflows/1-seo-cluster-internal-linker.json` | Enlaza automáticamente posts del mismo cluster en Blogger |
| `workflows/2-popup-offer-manager.json` | Webhook que devuelve la config del popup según el visitante |
| `workflows/3-funnel-cta-injector.json` | Agrega cajas CTA de systeme.io al final de cada post |
| `blogger-popup-script.js` | Script JavaScript a instalar en el tema de Blogger |

---

## PASO 1 - Importar workflows en n8n (Contabo)

1. Entra a tu n8n → menú lateral → **Workflows**
2. Clic en **Import from file**
3. Importa en este orden:
   - `1-seo-cluster-internal-linker.json`
   - `2-popup-offer-manager.json`
   - `3-funnel-cta-injector.json`

---

## PASO 2 - Configurar credencial de Google Blogger

### En tu panel de Google Cloud:
1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. Crea un proyecto → habilita **Blogger API v3**
3. Crea credenciales OAuth 2.0 (tipo: Aplicación web)
4. Agrega tu URL de n8n como URI de redireccionamiento:
   `https://TU-N8N.com/rest/oauth2-credential/callback`

### En n8n:
1. Configuración → Credenciales → Nueva credencial
2. Tipo: **Google API**
3. Scopes a agregar: `https://www.googleapis.com/auth/blogger`
4. Guarda con el nombre: `Google Blogger API`
5. En los 3 workflows, selecciona esta credencial en cada nodo HTTP que conecte con Blogger

---

## PASO 3 - Obtener tu Blog ID de Blogger

1. Entra a [blogger.com](https://www.blogger.com) → tu blog
2. Mira la URL del panel: `https://www.blogger.com/blog/posts/XXXXXXXXXXX`
3. Ese número largo es tu **BLOG_ID**

---

## PASO 4 - Configurar los workflows

### Workflow 1 (Cluster Linker):
Abre el nodo **"Configuracion"** y edita:
- `BLOG_ID`: Tu número de blog
- `LABEL_PILAR`: La etiqueta que usas para marcar posts pilar (ej: `pilar`)
- `SYSTEME_FUNNEL_URL`: Tu URL principal de funnel
- `MAX_INTERNAL_LINKS`: Cuántos links internos agregar (recomendado: 4)

**Estructura de labels recomendada en Blogger:**
```
Post pilar → labels: ["pilar", "seo"]
Post cluster → labels: ["seo", "keyword-research"]
Post cluster → labels: ["seo", "link-building"]
```
Todos los posts con la label `seo` se enlazarán entre sí.

### Workflow 2 (Popup Manager):
Abre el nodo **"Ofertas Configuradas"** y edita los 3 grupos de variables:
- `scroll40_*` → Popup cuando leen 40%+ (dar algo de valor: guía, recurso gratis)
- `exit_*` → Popup de salida (oferta con urgencia/descuento)
- `universal_*` → Popup de newsletter/suscripción (aparece a los 8 segundos)

### Workflow 3 (CTA Injector):
Abre el nodo **"Configuracion Funnels"** y edita:
- `BLOG_ID`: Tu número de blog
- URLs y textos para posts de tipo `pilar`, `cluster` y `general`

---

## PASO 5 - Activar el Webhook (Workflow 2)

1. Activa el Workflow 2 (toggle ON en la esquina superior derecha)
2. Abre el nodo **"Webhook Popup"**
3. Copia la **URL de producción** (Production URL)
4. Abre el archivo `blogger-popup-script.js`
5. Reemplaza la línea:
   ```javascript
   const N8N_WEBHOOK_URL = 'https://TU-N8N-CONTABO.com/webhook/popup-config';
   ```
   con tu URL real.

---

## PASO 6 - Instalar el script en Blogger

1. Ve a **Blogger → Tema → Editar HTML**
2. Usa Ctrl+F para buscar `</body>`
3. Justo ANTES de `</body>`, pega todo el contenido de `blogger-popup-script.js` entre etiquetas:
   ```html
   <script>
   /* Pega aquí el contenido de blogger-popup-script.js */
   </script>
   </body>
   ```
4. Guarda el tema

---

## PASO 7 - Ejecutar los workflows

### Orden recomendado:
1. **Workflow 3 primero** (CTA Injector) - agrega cajas de conversión
2. **Workflow 1 segundo** (Cluster Linker) - agrega enlaces internos
3. **Workflow 2** siempre activo (es un webhook que responde en tiempo real)

Para ejecutar manualmente: abre el workflow → clic en **"Ejecutar workflow"** → nodo "Ejecutar Ahora"

---

## Comportamiento de los popups

| Popup | Trigger | Cookie (no molestar) |
|-------|---------|----------------------|
| Scroll 40% | Usuario leyó 40% del artículo | 3 días |
| Exit intent | El cursor sale de la página por arriba | 3 días |
| Universal | 8 segundos en cualquier post | 3 días |

**Nota**: Los 3 popups NO se muestran simultáneamente. El sistema muestra máximo 1 popup por sesión visual (el que se active primero cierra la posibilidad de los otros).

---

## Solución de problemas

| Problema | Solución |
|----------|----------|
| Los posts no se actualizan | Verifica que el BLOG_ID sea correcto y el token OAuth esté activo |
| El popup no aparece | Revisa en consola del navegador los errores. Verifica que el webhook esté activo (workflow 2 ON) |
| Se duplican los CTAs | El filtro detecta `<div class="funnel-cta"` - si tienes ese div manualmente elimínalo |
| Error 401 en Blogger API | El token OAuth expiró. Ve a Credenciales en n8n y reconecta |
