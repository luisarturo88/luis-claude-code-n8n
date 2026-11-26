# luis-claude-code-n8n
## Paperclip (orquestador de agentes IA)

Cada sesión cloud clona automáticamente [paperclipai/paperclip](https://github.com/paperclipai/paperclip) en `~/paperclipai/paperclip` (variable `$PAPERCLIP_DIR`) mediante `.claude/hooks/session-start.sh`. Para ejecutarlo se necesita Node.js 24.11+: `npx paperclipai@latest onboard --yes`.
