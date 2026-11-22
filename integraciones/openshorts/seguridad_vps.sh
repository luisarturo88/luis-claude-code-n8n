#!/usr/bin/env bash
# SOLO LEE. Revisa si los puertos abiertos estan protegidos. No cambia nada.
red() { sed -E 's/eyJ[A-Za-z0-9_.-]{20,}/[TOKEN-OCULTO]/g; s/[A-Za-z0-9_\/+=-]{36,}/[CLAVE-OCULTA]/g'; }
{
echo "=== FIREWALL ==="; (ufw status verbose 2>&1 | head -25); iptables -S INPUT 2>&1 | head -8
echo "=== QUIEN USA 8001/8002/8080/18789 ==="; ss -tlnp 2>/dev/null | grep -E ':(8001|8002|8080|18789)\b' | awk '{print $4, $6}'
echo "=== SERVICIOS DE VOZ ==="; systemctl cat n8n-tts.service n8n-stt.service 2>/dev/null | grep -E '^(ExecStart|WorkingDirectory|\[Unit\]|Description)'
echo "=== MEMORIA: TOP 8 PROCESOS ==="; ps -eo pmem,rss,comm --sort=-rss | head -9
echo "=== ESPACIO DOCKER ==="; docker system df 2>&1
echo "=== ULTIMOS ERRORES N8N (20 lineas) ==="; docker logs --tail 20 n8n-n8n-1 2>&1 | cut -c1-200
} 2>&1 | red
