#!/usr/bin/env bash
# SOLO LEE. No instala, no borra, no reinicia, no cambia nada. Oculta claves y tokens.
# Uso: bash inventario_vps.sh   -> copia TODO lo que imprime y pegaselo a Claude.
red() { sed -E 's/eyJ[A-Za-z0-9_.-]{20,}/[TOKEN-OCULTO]/g; s/[A-Za-z0-9_\/+=-]{36,}/[CLAVE-OCULTA]/g; s/(password|passwd|secret|token|key)=[^ ]+/\1=[OCULTO]/Ig'; }
sec() { echo; echo "=== $1 ==="; }
{
sec "SISTEMA";      uname -srm; . /etc/os-release 2>/dev/null && echo "$PRETTY_NAME"; uptime -p
sec "CPU/RAM/DISCO"; echo "CPUs: $(nproc)"; free -h; df -h / /var/lib/docker 2>/dev/null
sec "DOCKER VERSION"; docker --version 2>&1; docker compose version 2>&1 | head -1
sec "CONTENEDORES (nombre | imagen | puertos | estado)"
docker ps -a --format '{{.Names}} | {{.Image}} | {{.Ports}} | {{.Status}}' 2>&1
sec "CONSUMO ACTUAL POR CONTENEDOR"; docker stats --no-stream --format '{{.Name}} | CPU {{.CPUPerc}} | RAM {{.MemUsage}}' 2>&1
sec "REDES DOCKER"; docker network ls --format '{{.Name}} ({{.Driver}})' 2>&1
sec "PROYECTOS COMPOSE"; docker compose ls 2>&1
sec "VOLUMENES (solo nombres)"; docker volume ls --format '{{.Name}}' 2>&1 | head -40
sec "PUERTOS ESCUCHANDO"; ss -tlnH 2>/dev/null | awk '{print $4}' | sort -u
sec "PROXY / WEB"; for s in nginx caddy traefik apache2; do systemctl is-active "$s" 2>/dev/null | sed "s/^/$s: /"; done
sec "SERVICIOS ACTIVOS (systemd)"; systemctl list-units --type=service --state=running --no-legend 2>/dev/null | awk '{print $1}' | head -40
sec "TAREAS CRON"; crontab -l 2>&1 | grep -v '^#' | head -20
sec "HERRAMIENTAS"; for c in git node npm python3 pip3 ffmpeg yt-dlp curl jq; do printf '%s: ' "$c"; (command -v "$c" >/dev/null && "$c" --version 2>&1 | head -1) || echo "NO instalado"; done
sec "CARPETAS EN /opt /root /home (solo nombres)"; ls -1 /opt /root /home 2>/dev/null | head -60
sec "VERSION DE N8N"; docker ps --format '{{.Names}} {{.Image}}' 2>/dev/null | grep -i n8n
} 2>&1 | red | tee /tmp/inventario_vps.txt
echo; echo ">>> Listo. Copia todo lo de arriba y pegaselo a Claude. (Tambien queda en /tmp/inventario_vps.txt)"
