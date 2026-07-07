#!/usr/bin/env python3
"""
SCRIPT PARA ELIMINAR DATE GATES Y ACTIVAR FLUJOS VETERINARIOS
Objetivo: Remover los nodos "DATE GATE" que bloquean la ejecucion
y activar todos los flujos veterinarios para publicar 5 articulos/dia
"""

import requests
import json

API_BASE = "https://vmi3096105.contaboserver.net/api/v1"
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmOGM1MTJmNy1mNTVhLTQwYjYtYWU1Ni00MDM0OWNlMDlmMjkiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiODRjZDhhMDYtYTU0Zi00YzhlLTllNjMtMTNhYTI1MWY1NzRjIiwiaWF0IjoxNzgzNDEwOTY4LCJleHAiOjE3ODU5ODg4MDB9.iYtQ-SbN6asJc02OSMjQ-7W3FynRGOD9RTgMqGqssls"

HEADERS = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}

# Flujos veterinarios identificados (del informe unificado)
VET_FLOWS = [
    "JDJKp1yYSFFu4BtV",  # FLUJO VETERINARIO LUIS BLOGGER
    "cabjTOjqu7Ks1r58",  # Veterinario ECUADOR Y MUNDO
    "930XCm4vY3TurOlL",  # Veterinario QUITO
    "cthc7GvuYZlPIDCI",  # Veterinario CUENCA
    "1zGqGSPhZITvCttw",  # RENALES Y URINARIOS
    "7554aQXudKBRWEkQ",  # TECNOLOGIA
    "9KrKde8O3cijCcBf",  # CASOS ESTUDIOS
    "CDQHp2kdQszHYKqN",  # PRIMERA PERSONA V3
    "bDEvev5P1BC9MAPA",  # mejorar articulos
    "IyUZcl96GcRjVZF5",  # 10 NICHOS MASCOTAS
    "HtFV0KcqD42VqZvr",  # ANSIEDAD Y ESTRES
    "dAc6Uw37UeNLTshk",  # PRIMEROS AUXILIOS
    "MwA6MSqZnsdNqv5Y",  # MASCOTAS EXOTICAS
    "FNSqMpwphHB1w3WL",  # BULLDOGS
    "AeGdjdxnXZThPmjE",  # LOROS
    "aqJQo8AEmxH4euHZ",  # HURONES
    "EjgZ8uVfHQqzQqbF",  # REPTILES
    "DS5gqoroBG3SAXKB",  # ALIMENTOS PERROS
    "aWuJN5aWVLfdrJAi",  # ALIMENTOS GATOS
    "QtenfTotJPqU72x2",  # KROMASOL
    "Xu385bbjE7JqapnW",  # ACUARIOS BIOTOPO
    "STiwKMm2UXn6jSfa",  # ACUARIOS copia
    "7rdIEIngthCHxiHV",  # PEZ BETTA
    "NiEeirlD1yI7zVhu",  # PEZ GUPPY
    "CZEzMQrOOA9UoWyn",  # PEZ PLATY
    "3TihmuY7TlK4NZSN",  # BOVINOS
    "bssm7ANnpogoMt0V",  # INFLAMACION BARRIGA
    "UCXNMMBg1NZPmH5v",  # ANTI ESTRES MILLONARIO
]

def get_workflow(wf_id):
    """Obtener workflow completo"""
    resp = requests.get(f"{API_BASE}/workflows/{wf_id}", headers=HEADERS)
    if resp.status_code == 200:
        return resp.json()
    print(f"ERROR obteniendo {wf_id}: {resp.status_code}")
    return None

def remove_date_gate_node(workflow):
    """Eliminar nodos DATE GATE y reconectar el flujo"""
    nodes = workflow.get('nodes', [])
    connections = workflow.get('connections', {})
    
    date_gate_nodes = []
    for node in nodes:
        if 'DATE GATE' in node.get('name', '').upper():
            date_gate_nodes.append(node['id'])
            print(f"  🚦 Encontrado DATE GATE: {node['name']} (ID: {node['id']})")
    
    if not date_gate_nodes:
        print("  ✅ No hay DATE GATEs que eliminar")
        return workflow, False
    
    # Eliminar nodos DATE GATE
    new_nodes = [n for n in nodes if n['id'] not in date_gate_nodes]
    
    # Reconectar: buscar que nodo estaba despues del DATE GATE
    # y conectarlo directamente al trigger
    for dg_id in date_gate_nodes:
        # Encontrar conexiones SALIENTES del DATE GATE
        for src_id, conns in connections.items():
            if src_id == dg_id:
                # Este nodo tiene salidas - necesitamos saber a donde van
                for output_idx, outputs in conns.items():
                    for conn in outputs:
                        target_node = conn.get('node')
                        print(f"    → El DATE GATE enviaba datos a: {target_node}")
                        
                        # Ahora buscamos el trigger y lo conectamos directamente
                        for node in new_nodes:
                            if 'trigger' in node.get('type', '').lower() or 'Schedule' in node.get('name', ''):
                                trigger_id = node['id']
                                if trigger_id not in connections:
                                    connections[trigger_id] = {}
                                if 'main' not in connections[trigger_id]:
                                    connections[trigger_id]['main'] = {}
                                
                                # Conectar trigger -> target_node
                                connections[trigger_id]['main']['0'] = [{
                                    'node': target_node,
                                    'type': 'main',
                                    'index': 0
                                }]
                                print(f"    ✅ Reconectado: Trigger → {target_node}")
    
    # Eliminar conexiones ENTRANTES/SALIENTES de nodos eliminados
    clean_connections = {}
    for src_id, conns in connections.items():
        if src_id not in date_gate_nodes:
            clean_conns = {}
            for output_idx, outputs in conns.items():
                # outputs puede ser lista de dicts o dict anidado
                if isinstance(outputs, list):
                    clean_outputs = [c for c in outputs if isinstance(c, dict) and c.get('node') not in date_gate_nodes]
                elif isinstance(outputs, dict):
                    clean_outputs = {k: v for k, v in outputs.items() 
                                    if not (isinstance(v, dict) and v.get('node') in date_gate_nodes)}
                else:
                    clean_outputs = outputs
                if clean_outputs:
                    clean_conns[output_idx] = clean_outputs
            if clean_conns:
                clean_connections[src_id] = clean_conns
    
    workflow['nodes'] = new_nodes
    workflow['connections'] = clean_connections
    return workflow, True

def update_workflow(wf_id, workflow):
    """Actualizar workflow en n8n"""
    # Limpiar campos read-only
    read_only = ['id', 'createdAt', 'updatedAt', 'versionId', 'activeVersionId', 
                 'triggerCount', 'shared', 'activeVersion', 'tags', 'pinData', 
                 'meta', 'staticData', 'versionCounter', 'isArchived']
    payload = {k: v for k, v in workflow.items() if k not in read_only}
    payload['active'] = True  # Activar siempre
    
    resp = requests.patch(f"{API_BASE}/workflows/{wf_id}", 
                         headers=HEADERS, 
                         json=payload)
    if resp.status_code == 200:
        print(f"  ✅ Workflow actualizado y ACTIVADO")
        return True
    else:
        print(f"  ❌ Error actualizando: {resp.status_code} - {resp.text[:200]}")
        return False

def main():
    print("="*60)
    print("🔧 SCRIPT PARA ELIMINAR DATE GATES Y ACTIVAR FLUJOS")
    print("="*60)
    
    success_count = 0
    error_count = 0
    
    for wf_id in VET_FLOWS:
        print(f"\n📋 Procesando: {wf_id}")
        
        workflow = get_workflow(wf_id)
        if not workflow:
            error_count += 1
            continue
        
        print(f"  Nombre: {workflow.get('name', 'N/A')}")
        print(f"  Activo: {workflow.get('active', False)}")
        
        # Eliminar DATE GATEs
        fixed_workflow, was_modified = remove_date_gate_node(workflow)
        
        if was_modified:
            # Actualizar workflow
            if update_workflow(wf_id, fixed_workflow):
                success_count += 1
            else:
                error_count += 1
        else:
            # Solo activar si no habia DATE GATEs
            print("  ℹ️  Sin cambios estructurales, solo activando...")
            if update_workflow(wf_id, workflow):
                success_count += 1
            else:
                error_count += 1
    
    print("\n" + "="*60)
    print(f"✅ RESUMEN: {success_count} exitosos, {error_count} errores")
    print("="*60)

if __name__ == "__main__":
    main()
