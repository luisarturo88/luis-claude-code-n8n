# OpenShorts para n8n (aislado)

Convierte videos largos en clips 9:16 para YouTube Shorts, Reels, TikTok y Facebook. Código de [mutonby/openshorts](https://github.com/mutonby/openshorts) (MIT), fijado al commit `60e7714` que revisé.

**Aislamiento:** proyecto compose propio, API solo en `127.0.0.1:8100`, tope de 2 CPU / 6 GB, no toca n8n ni sus flujos.

## Instalar (en el VPS, requiere Docker)
```bash
git clone <este repo> && cd luis-claude-code-n8n/integraciones/openshorts
cp .env.example .env     # pon GEMINI_API_KEY (gratis)
./instalar.sh            # primera build: 10-20 min
```
Requisitos: 8 GB+ de RAM libres recomendados y ~15 GB de disco. Sin GPU tarda 5-8 min por video de 8 min. Si el VPS va justo, baja `OPENSHORTS_MEM`/`OPENSHORTS_CPUS` en `.env`.

## Conectar con n8n
Importa `n8n-plantilla-OPENSHORTS.json` (flujo nuevo, sin activar). Si n8n corre en Docker, usa `http://host.docker.internal:8100` (añade `extra_hosts: host.docker.internal:host-gateway` solo si ya es parte de tu compose; si no, une ambos a una red docker compartida). **No expongas el puerto 8100 a internet:** la API self-host no pide login.

El webhook de "clips listos" debe ser una URL pública y solo funciona con ese flujo activado.

## Revertir
`docker compose down -v` y borra los flujos `OPENSHORTS - `. Nada más cambió.

## Publicar a redes
OpenShorts publica vía [Upload-Post](https://www.upload-post.com) (10 publicaciones/mes gratis). Pon tu clave en el dashboard/`.env`. Dashboard opcional: levanta el servicio frontend del repo original solo si lo necesitas.

## Otras herramientas (NO instaladas, solo opciones)
- **Upload-Post** (API de publicación multired) — ya integrada arriba.
- Un programador open source de redes (p. ej. Postiz) si quieres calendario visual; evalúalo aparte, consume más RAM.

## Realismo sobre ganar dinero
Esto automatiza la producción, no garantiza ingresos. YouTube/TikTok/Facebook exigen mínimos de audiencia para monetizar y penalizan contenido reutilizado de otros. Usa tus propios videos o con licencia.
