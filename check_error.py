import requests

# Configuración
BASE_URL = "https://vmi3096105.contaboserver.net/mcp-server/http"
HEADERS = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmOGM1MTJmNy1mNTVhLTQwYjYtYWU1Ni00MDM0OWNlMDlmMjkiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6Ijg0ZTY2NzRlLTE3ZDYtNDc4Ny1iMzIzLTkyZDZiNmNhOTUxNiIsImlhdCI6MTc4MzI2ODUzMX0.A6yAUHdoPLCKFRRS0462fTrZe2EuaD2dgc57ZrNUlPQ",
    "Content-Type": "application/json"
}

# Obtener últimas ejecuciones con error
workflows_to_check = [
    "okzgGVjjgsjZlovC",  # ABOGADOS FAMILIA USA
    "4Dcz8FqZUFsZOcje",  # ABOGADOS BIENES RAICES
    "FymOv28Xw2R7kV4X",  # ABOGADOS ACCIDENTE ORLANDO
    "cECi6nubp8gfjFdW",  # LITIGIOS USA FIXED
    "lxKKhQ1tVJ24Ml5X"   # LITIGIOS LEAD CAPTURE
]

print("=== REVISIÓN DE WORKFLOWS Y EJECUCIONES ===\n")

for wf_id in workflows_to_check:
    print(f"\n🔍 Workflow ID: {wf_id}")
    
    # Obtener detalles del workflow
    try:
        resp = requests.get(f"{BASE_URL}/api/v1/workflows/{wf_id}", headers=HEADERS, timeout=10)
        if resp.status_code == 200:
            wf_data = resp.json()
            print(f"   Nombre: {wf_data.get('name', 'N/A')}")
            print(f"   Activo: {wf_data.get('active', False)}")
        else:
            print(f"   Error al obtener workflow: {resp.status_code}")
    except Exception as e:
        print(f"   Excepción: {str(e)}")
    
    # Obtener últimas ejecuciones
    try:
        resp_exec = requests.get(f"{BASE_URL}/api/v1/executions?workflowId={wf_id}&limit=5&status=error", headers=HEADERS, timeout=10)
        if resp_exec.status_code == 200:
            execs = resp_exec.json().get('data', [])
            if execs:
                print(f"   Últimas ejecuciones con error ({len(execs)} encontradas):")
                for ex in execs[:3]:
                    ex_id = ex.get('id', 'N/A')
                    started_at = ex.get('startedAt', 'N/A')
                    print(f"      - Ejecución #{ex_id} | Fecha: {started_at}")
                    
                    # Obtener detalles del error
                    try:
                        detail_resp = requests.get(f"{BASE_URL}/api/v1/executions/{ex_id}", headers=HEADERS, timeout=10)
                        if detail_resp.status_code == 200:
                            detail = detail_resp.json()
                            # Buscar el nodo con error
                            result_data = detail.get('resultData', {})
                            run_data = result_data.get('runData', {})
                            for node_name, node_runs in run_data.items():
                                for run in node_runs:
                                    if run.get('error'):
                                        error_msg = run['error'].get('message', 'Sin mensaje')
                                        error_desc = run['error'].get('description', '')
                                        print(f"         ❌ Nodo '{node_name}': {error_msg}")
                                        if error_desc:
                                            print(f"            Detalle: {error_desc}")
                    except Exception as e:
                        print(f"         No se pudo obtener detalle: {str(e)}")
            else:
                print(f"   ✅ No hay ejecuciones con error recientes")
        else:
            print(f"   Error al obtener ejecuciones: {resp_exec.status_code}")
    except Exception as e:
        print(f"   Excepción en ejecuciones: {str(e)}")

print("\n=== FIN DE REVISIÓN ===")
