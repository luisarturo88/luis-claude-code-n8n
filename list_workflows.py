# Script para listar workflows usando el formato correcto
import json

config = {
  "mcpServers": {
    "n8n-mcp": {
      "type": "http",
      "url": "https://vmi3096105.contaboserver.net/mcp-server/http",
      "headers": {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmOGM1MTJmNy1mNTVhLTQwYjYtYWU1Ni00MDM0OWNlMDlmMjkiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6Ijg0ZTY2NzRlLTE3ZDYtNDc4Ny1iMzIzLTkyZDZiNmNhOTUxNiIsImlhdCI6MTc4MzI2ODUzMX0.A6yAUHdoPLCKFRRS0462fTrZe2EuaD2dgc57ZrNUlPQ"
      }
    }
  }
}

print("Configuración MCP lista:")
print(json.dumps(config, indent=2))
print("\nLos workflows que necesitamos revisar son:")
workflows = [
    ("okzgGVjjgsjZlovC", "ABOGADOS FAMILIA USA"),
    ("4Dcz8FqZUFsZOcje", "ABOGADOS BIENES RAICES"),
    ("FymOv28Xw2R7kV4X", "ABOGADOS ACCIDENTE ORLANDO"),
    ("cECi6nubp8gfjFdW", "LITIGIOS USA — FIXED v5 FINAL"),
    ("lxKKhQ1tVJ24Ml5X", "LITIGIOS_USA_LEAD_CAPTURE")
]

for wf_id, wf_name in workflows:
    print(f"  - {wf_id}: {wf_name}")
