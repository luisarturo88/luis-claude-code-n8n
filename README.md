# luis-claude-code-n8n

Configuración de Claude Code para los flujos n8n de veterinarioluis.com.

## Plugins (instalación automática vía `.claude/settings.json`)
| Lista de Luis | Repo | Plugin |
|---|---|---|
| 4.2 affaan-m/ECC y 4.5 everything-claude-code (mismo proyecto) | affaan-m/ECC | `ecc@ecc` |
| 4.4 bradautomates/claude-video | bradautomates/claude-video | `watch@claude-video` |

Pendientes (nombre/repo por confirmar): Agent Reach, rea-video, motion-maxxing, Higgsfield MCP, hypit, Remotion, Content Strategy, Frontend Design, Sellbird, Omnirote, Codebase Memory.

Para /watch hacen falta `ffmpeg` y `yt-dlp` en la máquina (Contabo).

## Prompts
- `prompts/claude-luisn8n-adsense.md` — tarea para Claude Code: SEO y aprobación de AdSense del blog luisn8n.online (seguros de mascotas).

## Agent Reach (YouTube, Reddit, X…)
Repo: `Panniantong/Agent-Reach`. Se instala en la máquina donde se use (no en n8n): seguir `docs/install.md` del repo.
