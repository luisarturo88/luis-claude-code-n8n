# Prompt para Claude Code (copia y pega todo lo de abajo)

---

Soy Luis Arturo García, médico veterinario (NO programador). Mi n8n está en producción en mi VPS de Contabo y genera ingresos: https://vmi3096105.contaboserver.net. Quiero **potenciarlo sin dañarlo**, como ponerle turbo, amortiguación y llantas mejores a una camioneta que ya funciona. **Funciona = no se toca.** Yo solo te paso lo que me pidas (resultados de comandos); tú decides el resto y trabajas en automático.

## 1. Lo que YA tengo (no reinventar)

### Repos de GitHub (todos de `luisarturo88`)
| Repo | Qué tiene instalado | Para qué sirve |
|---|---|---|
| `dr-garcia-videos` | `render.py` + `covers.py` (ffmpeg, edge-tts voz es-EC-LuisNeural, Pillow), GitHub Action `render.yml`, `assets/luis.png`. Secreto: `PEXELS_API_KEY` | **Fábrica de videos gratis.** n8n le manda un JSON de escenas, GitHub renderiza el MP4 + portadas y lo deja en un Release. Lo usan mis fábricas de shorts/videos. Cuesta $0. |
| `luisarturo88-n8n-agentes-comunicacion` | Carpetas `ordenes/ propuestas/ asignaciones/ resultados/ errores/ contexto/`, locks `.lock`, `optimize_blogger_colab.py` | **Enjambre de IAs** (Z.ai, Qwen, DeepSeek, Claude) que coordinan trabajo por GitHub y reparan flujos; flujos n8n SWARM Mensajero/Trabajador. El script de Colab optimiza entradas de Blogger (JSON-LD, meta, H2). |
| `luis-claude-code-n8n` | `.mcp.json` (servidor `ruflo`), `.claude/settings.json`, y `integraciones/openshorts/` + skill `.claude/skills/openshorts/` | **Mi base para Claude Code.** Aquí vive el kit de OpenShorts (clips verticales) aislado del n8n. |

### n8n: 143 flujos, **39 ACTIVOS** (104 inactivos). Los activos (INTOCABLES), por grupo
- **Blogs/SEO:** Veterinario Guayaquil Luis, FLUJO VETERINARIO LUIS BLOGGER, Veterinario ECUADOR Y MUNDO, HURONES Blog Automático, HURONES temas embudo, SEO/AEO enriquecer entradas, AUTOMATIZA IA (publicación+aviso, ideas, silos, completar imágenes, v2), banco de imágenes (Canva→Drive), imágenes para artículo, reponer TUTORIALES.
- **Video:** FÁBRICA HURONES (2 cortos+1 largo/día), FÁBRICA SHORTS perros y gatos, SHORTS SÍNTOMAS, VIDEO LARGO 10 MIN, CASOS CLÍNICOS storytelling, TUTORIALES CASA.
- **Redes:** Publicador Redes 3/día (FB+IG+TikTok+LinkedIn), DIFUSIÓN Shorts (FB+IG+Threads+LinkedIn), DIFUSIÓN artículos, FACEBOOK programar videos de Drive, Publicador Facebook Pages, sub-flujos "Facebook publicar video por URL" y "Meta token de página", TikTok Conexión.
- **IA gratis (sub-flujos reutilizables):** IA GRATIS llamar 1 modelo, Cascada Gemini, IA GRATIS segura.
- **Negocio/clientes:** Chatbot HuronExpert (ebooks+leads), Registro de clínicas (prueba 7 días), Teleconsultas chat web, GAN 0 casos clínicos grandes especies, Recibir entregas de IAs→Drive.
- **Otros:** Pitazos Cripto (Telegram), Trading (2 sub-flujos).
- **Credenciales existentes (solo reutilizar por ID, jamás modificar):** YouTube x2 (incl. "hurones"), TikTok x2, Facebook Graph x3 + Facebook/Instagram/Threads, LinkedIn x2, X, Telegram x3 (incl. @DrLuisArturoGarciaBot), Gmail, Drive, Sheets, Blogger, Canva, DeepSeek, Gemini x2, Cohere, OpenAI x3, HuggingFace, Supabase, Notion, WhatsApp Business, Vapi, Google TTS y otras.

## 2. REGLAS INNEGOCIABLES ("la camioneta funciona")
1. **Cero cambios a los 39 flujos activos y sus sub-flujos:** no editar, renombrar, desactivar, ejecutar manualmente, borrar, ni cambiar sus horarios, hojas, credenciales o datos. Antes de empezar, guarda la lista (id+nombre+activo) y al terminar compárala: debe ser idéntica.
2. **Todo lo nuevo es ADITIVO:** flujos nuevos con prefijo `POTENCIA - ` u `OPENSHORTS - `, credenciales/hojas/carpetas nuevas con ese mismo prefijo. Para usar algo existente, **llámalo** (Execute Workflow a los sub-flujos de publicación/IA gratis), no lo copies ni lo modifiques.
3. **No escribir en hojas, colas ni carpetas que usan los flujos activos.** Usa hojas/colas propias `POTENCIA - ...`. Solo LEER lo existente.
4. **No tocar el servidor de n8n** (ni su Docker, ni sus puertos, ni su base de datos). Todo lo nuevo corre en contenedores aparte con tope de CPU/RAM y **fuera del horario pico** (mis flujos corren cada 5–20 min). Si el VPS va justo, reduce lo nuevo, nunca lo existente.
5. **Interruptor de seguridad:** cada flujo nuevo debe poder apagarse sin afectar nada más. Revertir = desactivar/borrar los `POTENCIA - `/`OPENSHORTS - ` y `docker compose down`.
6. **Antes de crear algo nuevo, revisa que no exista ya** (tengo 143 flujos). Nada de "mil flujos": solo lo que de verdad suma ingresos. Máximo los 3 de la sección 3.
7. **Secretos:** nunca imprimas ni guardes claves en repos. En `luisarturo88-n8n-agentes-comunicacion/contexto/` hay una API key de n8n en un repo PÚBLICO: no la uses, avísame que la revoque y trabaja con el MCP de n8n o una key nueva.
8. **Contenido:** solo mis videos/textos o con licencia (CC/permiso). Sin consejos médicos peligrosos. Respeta límites diarios por plataforma y varía títulos/portadas (las plataformas penalizan contenido repetitivo y pueden desmonetizar).
9. **Cambios en Git por rama de trabajo.** Sin push a `main` ni PR salvo que lo pida.

## 3. Potenciadores (en este orden; lo demás NO)
1. **`POTENCIA - Vigilante`** (solo lectura sobre lo existente): cada 30 min revisa las ejecuciones de los 39 activos vía API de n8n; si uno falla o deja de correr, me avisa por Telegram (@DrLuisArturoGarciaBot) con nombre y causa, y un resumen diario corto. **No reintenta ni arregla** flujos activos (un reintento puede duplicar publicaciones).
2. **`OPENSHORTS - Recortar largos`**: toma los videos largos que ya producen VIDEO LARGO 10 MIN, TUTORIALES CASA y CASOS CLÍNICOS (averigua dónde quedan con `get_workflow_details`, solo lectura), los pasa por OpenShorts (instalado aparte en `127.0.0.1:8100`, ver `integraciones/openshorts/`) en horario nocturno, 1 video a la vez, y publica los clips **automáticamente, sin pedirme aprobación**, reutilizando los sub-flujos existentes de publicación y una cola `POTENCIA - COLA`. Con tope diario, anti-duplicados y alerta al fallar.
3. **(Solo si 1 y 2 funcionan una semana)** `POTENCIA - Medidor`: reporte semanal en Telegram de qué videos/nichos rinden más (vistas, clics) para que lo mejor se alimente más.

## 4. Cómo trabajamos
- Primero dame **un solo comando de SSH de solo lectura**: `bash integraciones/openshorts/inventario_vps.sh` (no instala ni cambia nada, oculta claves). Yo te pego lo que imprime. Con eso decides si el VPS aguanta OpenShorts (necesita ~6 GB RAM y ~15 GB disco libres) y cómo conectarlo con n8n.
- Después, cuando necesites que yo ejecute algo, dame **un bloque listo para pegar** y espera mi respuesta. No uses jerga.
- Al terminar cada paso, resumen en español sencillo: qué creaste, qué NO tocaste, cómo revertir.

---
