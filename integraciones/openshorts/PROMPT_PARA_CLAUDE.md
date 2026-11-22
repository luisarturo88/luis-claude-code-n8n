# Prompt para Claude Code (copia y pega todo lo de abajo)

---

Contexto: tengo n8n en producción (https://vmi3096105.contaboserver.net) con flujos ACTIVOS (blog veterinarioluis.com, enjambre de agentes). Instalé **OpenShorts** (clips verticales para Shorts/Reels/TikTok) como servicio APARTE en el mismo VPS, en `integraciones/openshorts/` del repo `luis-claude-code-n8n`. Escucha solo en `127.0.0.1:8100` (API: `/api/process`, `/api/status/{job_id}`, `/api/social/post`; MCP en `/mcp`). Hay un skill en `.claude/skills/openshorts/` — léelo antes de llamar a la API.

## REGLAS INNEGOCIABLES (proteger lo que ya funciona)

1. **No modifiques, desactives, actives, renombres, borres ni ejecutes ningún flujo existente.** Antes de cualquier cambio en n8n, lista los flujos (`search_workflows`) y apunta cuáles están activos. Esa lista es intocable.
2. **Solo crea flujos NUEVOS**, con nombre que empiece por `OPENSHORTS - `, siempre **inactivos** al crearlos. Base: `integraciones/openshorts/n8n-plantilla-OPENSHORTS.json`. Paths de webhook nuevos y únicos (`openshorts-*`); nunca reutilices `swarm-orden` ni `swarm-worker`.
3. **No cambies credenciales existentes.** Si falta una clave (Gemini, Upload-Post, etc.), pídemela; crea credenciales nuevas con nombre `OPENSHORTS - ...`. No imprimas ni guardes claves en el repo.
4. **No toques el servidor ni Docker de n8n.** OpenShorts corre en su propio proyecto compose (`openshorts`) con límite de CPU/RAM. Si hay poco disco/RAM, detente y avísame; no libres recursos tocando n8n.
5. **Lee `contexto/INFORME_UNIFICADO_VETERINARIA.md` (repo del enjambre) antes de proponer nada relacionado con los flujos veterinarios.** Esos flujos no se mezclan con OpenShorts.
6. **Publicar es paso humano:** el nodo de publicación queda DESACTIVADO. Nunca publiques en redes sin que yo lo apruebe en ese mensaje. Primero genera clips y muéstramelos.
7. **Probar sin riesgo:** ejecuta solo los flujos `OPENSHORTS - ` nuevos con un video de prueba corto. Un video, no lotes. Si algo falla, no "arregles" otros flujos: reporta.
8. **Cambios por rama y revisables:** commits en la rama de trabajo, sin push a `main` y sin PR salvo que lo pida.
9. **Sé honesto con el dinero:** no prometas ingresos. Solo usa videos míos o con licencia (CC/permiso); no re-subas contenido ajeno.

## Qué quiero que hagas

1. Verifica que OpenShorts responde (`curl http://127.0.0.1:8100/health/ready`).
2. Importa la plantilla como flujo NUEVO e inactivo; ajusta `openshorts_base` según cómo llegue n8n al servicio (`host.docker.internal:8100` o la red docker).
3. Prueba con un video corto mío; muéstrame los clips y títulos.
4. Propón (sin activar) un flujo de calendario: video largo → clips → mi aprobación → publicación programada.
5. Entrégame resumen: qué creaste, qué NO tocaste, y cómo revertir (borrar flujos `OPENSHORTS - ` y `docker compose down`).

---
