# 🚨 TAREAS PRIORITARIAS - PROYECTO VETERINARIA 2027
## Estado Crítico: 7 de julio de 2026

---

## 🔴 PRIORIDAD 1: DIAGNÓSTICO Y REPARACIÓN DE ERRORES (URGENTE)

### Situación Actual
La mayoría de flujos veterinarios están en estado **ERROR** según logs de n8n:
- FLUJO VETERINARIO LUIS BLOGGER
- Veterinario ECUADOR Y MUNDO
- Veterinario QUITO/CUENCA/Guayaquil
- CAMARONES DE ACUARIO
- GECKO LEOPARDO
- BULLDOGS FLUJO
- CASOS ESTUDIOS
- ACUARIOS BIOTOPO
- HURONES, REPTILES, PEZ BETTA/PLATY/GUPPY
- RENALES, TECNOLOGÍA, ALIMENTOS PERROS/GATOS
- ANSIEDAD Y ESTRES, PRIMEROS AUXILIOS, MASCOTAS EXÓTICAS

### Posibles Causas
1. **Date Gates mal inyectados** - Código JavaScript con errores de sintaxis o fechas incorrectas
2. **Credenciales expiradas** - API Keys JWT, OAuth2 de Google Sheets, Blogger
3. **Sheet IDs incorrectos** - Formato `__rl` no procesado correctamente
4. **Nodos rotos** - Referencias a recursos eliminados o movidos
5. **Timeouts** - Flujos que exceden tiempo límite de ejecución

### Acciones Inmediatas Requeridas
```bash
# 1. Obtener detalles de cada flujo con error
curl -X GET "https://vmi3096105.contaboserver.net/api/v1/workflows/JDJKp1yYSFFu4BtV" \
  -H "X-N8N-API-KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"

# 2. Ver última ejecución fallida
curl -X GET "https://vmi3096105.contaboserver.net/api/v1/executions?workflowId=JDJKp1yYSFFu4BtV&limit=1" \
  -H "X-N8N-API-KEY: ..."

# 3. Exportar backup antes de modificar
curl -X GET "https://vmi3096105.contaboserver.net/api/v1/workflows/JDJKp1yYSFFu4BtV/export" \
  -H "X-N8N-API-KEY: ..." > backup_flujo_veterinario_luis.json
```

### Checklist de Reparación
- [ ] Verificar que Date Gate tenga sintaxis JavaScript válida
- [ ] Confirmar que credenciales de Google Sheets y Blogger estén activas
- [ ] Validar que Sheet IDs y Tab Names sean correctos
- [ ] Revisar que Blog ID sea `2772493032989228627` en todos los flujos
- [ ] Ejecutar test manual de cada flujo reparado
- [ ] Monitorear siguientes 5 ejecuciones automáticas

---

## 🟠 PRIORIDAD 2: RESOLVER CONFLICTO ESTRATÉGICO

### Conflicto Identificado
| Aspecto | Enfoque Z.ai | Enfoque Qwen | Decisión Usuario |
|---------|-------------|--------------|------------------|
| Estrategia temporal | 3 bloques de 6 meses (solo 10 activos) | Activar TODOS inmediatamente | ❓ PENDIENTE |
| Publicación diaria | Bloque 1 publica, 2/3 pausados | 5 artículos/día distribuidos | ❓ PENDIENTE |
| Anti-duplicados | No implementado | Sistema con ESTADO en Sheets | ❓ PENDIENTE |

### Decisión Asumida (basada en últimos mensajes del usuario)
✅ **ACTIVAR TODOS LOS FLUJOS VETERINARIOS INMEDIATAMENTE**
✅ **DISTRIBUIR FRECUENCIAS PARA 5 ARTÍCULOS/DÍA TOTAL**
✅ **IMPLEMENTAR SISTEMA ANTI-DUPLICADOS**

### Acciones Derivadas
1. **Eliminar Date Gates** de todos los flujos (o desactivarlos)
2. **Reconfigurar Schedule Triggers** con frecuencias escalonadas:
   - Grupo A (Core): Cada 3 días → ~3.3 artículos/día
   - Grupo B (High-Ticket): Cada 4 días → ~2.5 artículos/día
   - Grupo C (Especies): Cada 6 días → ~1.7 artículos/día
   - Grupo D (Secundarios): Cada 7 días → ~1.4 artículos/día
   - **Total estimado:** ~8.9 artículos/día (ajustar a 5 exactos)

3. **Activar flujos actualmente INACTIVOS** (Bloques 2 y 3)

---

## 🟡 PRIORIDAD 3: IMPLEMENTAR SISTEMA ANTI-DUPLICADOS

### Diseño Propuesto

#### Opción A: Columna ESTADO en cada Google Sheet
```
ESTADO = PENDIENTE → EN_PROCESO → PUBLICADO/ERROR
```

**Flujo de nodos requerido:**
1. Google Sheets Read → Lee filas con ESTADO = "PENDIENTE" o "SIN_USAR"
2. Code → Filtra primera fila disponible
3. Google Sheets Update → Marca como "EN_PROCESO" (lock)
4. [Generación de contenido]
5. Blogger Publish → Obtiene URL final
6. Google Sheets Update → Marca como "PUBLICADO" con URL y fecha

#### Opción B: Hoja Centralizada "TITULOS_PUBLICADOS"
- Crear nueva pestaña en sheet maestro
- Antes de publicar, consultar si título ya existe
- Usar hash del título para comparación rápida

#### Opción C: Verificación vía Blogger API
- Llamar a `blogs/{blogId}/posts` antes de generar
- Buscar por título o slug similar
- Abortar si existe duplicado

### Implementación Recomendada
**Combinar Opción A + C:**
- Usar columna ESTADO como primer filtro
- Verificación Blogger como seguridad adicional

### Código para Nodo Code (Anti-Duplicados)
```javascript
// Verificar si hay títulos pendientes
const sheetData = $input.first().json;
const pendingItems = sheetData.filter(row => 
  row.ESTADO === 'PENDIENTE' || row.ESTADO === 'SIN_USAR'
);

if (pendingItems.length === 0) {
  // No hay items pendientes, detener flujo
  return [];
}

// Tomar el primero disponible
const itemToProcess = pendingItems[0];

// Marcar como EN_PROCESO inmediatamente
const updatePayload = {
  range: `${itemToProcess.row}`,
  data: {
    ESTADO: 'EN_PROCESO',
    PROCESANDO_DESDE: new Date().toISOString()
  }
};

// Retornar item para continuar flujo
return [{ json: itemToProcess }];
```

---

## 🟢 PRIORIDAD 4: DESACTIVAR FLUJOS NO VETERINARIOS

### Flujos a Desactivar Inmediatamente
| Nombre del Flujo | ID | Motivo |
|-----------------|----|--------|
| Seguro social denegado | (ver en UI) | Temática legal/discapacidad |
| Bancarrota Chapter 7 | (ver en UI) | Legal/financiero USA |
| ABOGADOS FAMILIA USA SIN REPETICION | (ver en UI) | Legal |
| 1 FLUJO ANTI ESTRES MILLONARIO | UCXNMMBg1NZPmH5v | Autoayuda general (no vet) |

### Comando de Desactivación
```bash
curl -X PUT "https://vmi3096105.contaboserver.net/api/v1/workflows/{ID}" \
  -H "X-N8N-API-KEY: ..." \
  -H "Content-Type: application/json" \
  -d '{"active": false}'
```

---

## 🔵 PRIORIDAD 5: CREAR FLUJOS PARA TABS HUÉRFANAS

### Tabs Confirmadas Sin Flujo
| # | Sheet | Tab | Contenido | Prioridad |
|---|-------|-----|-----------|-----------|
| 1 | VETERINARIA NICHOS_HIGH_TICKET | NUTRICION | Artículos nutrición vet | ALTA |
| 2 | NUEVOS NICHOS VETERINARIOS | TECNOLOGÍA | Smart Pet Tech, GPS | ALTA |
| 3 | ARTICULOS CHINCHILLAS | Hoja 1 | Cuidado chinchillas | MEDIA |
| 4 | VETERINARIA NICHOS_HIGH_TICKET | P02, P04, P05+ | Por confirmar | MEDIA |
| 5 | VETERINARIO BLOG OFICIAL | NICHOS NUEVOS | Varios nichos | BAJA |

### Proceso de Creación
1. **Clonar flujo modelo** (recomendado: `9KrKde8O3cijCcBf` - CASOS ESTUDIOS)
2. **Modificar nodos Google Sheets:**
   - Cambiar Sheet ID
   - Cambiar Tab Name
3. **Verificar nodo Blogger:**
   - Blog ID = `2772493032989228627`
4. **Aplicar System Prompt estándar** (versión Qwen completa)
5. **Agregar lógica anti-duplicados** (ver Prioridad 3)
6. **Configurar Schedule Trigger** con frecuencia escalonada
7. **Activar flujo**

### Plantilla de Creación Rápida
```bash
# Exportar flujo modelo
curl -X GET "https://vmi3096105.contaboserver.net/api/v1/workflows/9KrKde8O3cijCcBf/export" \
  -H "X-N8N-API-KEY: ..." > plantilla_casos_estudios.json

# Modificar con script (reemplazar IDs)
node modificar_flujo.js --template plantilla_casos_estudios.json \
  --sheet-id "1dtc4KTy7awk5QMA_UfsDgey8W3B8Hh_qQZg3RELcRF8" \
  --tab-name "NUTRICION" \
  --output flujo_nutricion.json

# Importar nuevo flujo
curl -X POST "https://vmi3096105.contaboserver.net/api/v1/workflows" \
  -H "X-N8N-API-KEY: ..." \
  -H "Content-Type: application/json" \
  -d @flujo_nutricion.json
```

---

## 🟣 PRIORIDAD 6: ACTUALIZAR SYSTEM PROMPTS

### System Prompt Estándar (Versión Qwen Completa)
Todos los flujos deben incluir estos 8 elementos obligatorios:

1. ✅ **CASO CLÍNICO INTEGRADO** - Storytelling con paciente veterinario
2. ✅ **GLOSARIO MÉDICO VETERINARIO** - Términos técnicos explicados
3. ✅ **BIBLIOGRAFÍA CIENTÍFICA APA** - Citas de libros reales
4. ✅ **MONETIZACIÓN Y AFILIADOS** - Amazon/Hotmart estratégicos
5. ✅ **SEO, AEO, RICH SNIPPETS** - HTML estructurado + JSON-LD
6. ✅ **TONO HUMANO (Human Level)** - Empatía, no robótico
7. ✅ **CTA WHATSAPP** - `https://chat.whatsapp.com/IkpYnlrPyEx8Y2NTyaFB6P`
8. ✅ **IMÁGENES** - Prompts precisos para Pexels/Pixabay

### Flujos que Requieren Actualización
- Z.ai actualizó 25 flujos con versión corta
- Qwen diseñó versión completa pero NO la aplicó
- **Acción:** Aplicar versión completa a TODOS los flujos activos

### Comando de Actualización Masiva
```bash
# Script para actualizar prompts en múltiples flujos
node actualizar_prompts.js \
  --workflow-ids "JDJKp1yYSFFu4BtV,cabjTOjqu7Ks1r58,930XCm4vY3TurOlL,..." \
  --prompt-file system_prompt_qwen_completo.txt \
  --api-key "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📊 CRONOGRAMA DE EJECUCIÓN

| Día | Tarea | Responsable | Estado |
|-----|-------|-------------|--------|
| 7 jul | Diagnóstico errores (T1) | IA Disponible | ⏳ PENDIENTE |
| 7 jul | Reparar primeros 5 flujos | IA Disponible | ⏳ PENDIENTE |
| 8 jul | Desactivar flujos no-vet (T6) | IA Disponible | ⏳ PENDIENTE |
| 8 jul | Implementar anti-duplicados (T3) | IA Disponible | ⏳ PENDIENTE |
| 9 jul | Crear flujos huérfanos (T4) | IA Disponible | ⏳ PENDIENTE |
| 9 jul | Actualizar system prompts (T5) | IA Disponible | ⏳ PENDIENTE |
| 10 jul | Configurar frecuencias (T7) | IA Disponible | ⏳ PENDIENTE |
| 10 jul | Activar todos flujos vet | IA Disponible | ⏳ PENDIENTE |
| 11 jul | Test masivo y monitoreo | IA Disponible | ⏳ PENDIENTE |

---

## 🎯 MÉTRICAS DE ÉXITO

- ✅ **0 flujos en estado ERROR** después de reparaciones
- ✅ **5 artículos/día** publicados sin duplicados
- ✅ **100% flujos veterinarios activos**, 0 flujos no-vet activos
- ✅ **System Prompt completo** en todos los flujos
- ✅ **Anti-duplicados funcional** (0 títulos repetidos)
- ✅ **WhatsApp CTA presente** en 100% de artículos
- ✅ **Citas APA y glosario** en 100% de artículos

---

## 📞 CONTACTO Y RECURSOS

- **Blog Principal:** https://draft.blogger.com/blog/posts/2772493032989228627
- **Blog Público:** https://veterinarioluis.com
- **Comunidad WhatsApp:** https://chat.whatsapp.com/IkpYnlrPyEx8Y2NTyaFB6P
- **n8n UI:** https://vmi3096105.contaboserver.net
- **n8n API:** https://vmi3096105.contaboserver.net/api/v1
- **API Keys:** Ver sección 1 del INFORME UNIFICADO

---

*Documento generado para coordinación entre todas las IAs del proyecto veterinario 2027*
*Última actualización: 7 de julio de 2026*
*Autores: Consolidación de trabajo Z.ai + Qwen + DeepSeek*
