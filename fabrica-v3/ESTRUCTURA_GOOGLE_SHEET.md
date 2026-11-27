# Estructura del Google Sheet · Fábrica V3

Sheet principal: `REGISTRY_BLOGS`  
ID: `1Vq8TuyqI22C3_Ffth-GsGdDRuXfHORpdAGOiowLxIpk`

---

## 1. Pestaña `NICHOS`

Aquí conviven las dos fábricas.

| Tipo de nicho | Identificación | Quién lo usa |
|---------------|----------------|--------------|
| Fábrica pequeña (manual) | **Sin color de fondo** | Solo el dueño |
| **Fábrica V3 (CEO)** | Prefijo **`V3-`** + **fondo verde** | Solo el CEO y sus agentes |

**Regla:** La Fábrica V3 nunca toca filas sin color. La fábrica pequeña nunca usa filas `V3-`.

---

## 2. Pestaña `CEO_V3` (tablero de decisiones del CEO)

**Encabezados (fila 1):**

```
FECHA | AGENTE | PRIORIDAD | RECOMENDACION | POR_QUE | IMPACTO_ESTIMADO | ACCION_SI_APRUEBO | APROBAR | ESTADO
```

| Columna | Uso |
|---------|-----|
| FECHA | Fecha del reporte/recomendación |
| AGENTE | CEO, Investigador, etc. |
| PRIORIDAD | Alta / Media / Baja |
| RECOMENDACION | Qué se propone |
| POR_QUE | Justificación breve |
| IMPACTO_ESTIMADO | Proyección (no promesa) |
| ACCION_SI_APRUEBO | Qué se ejecuta si se aprueba |
| **APROBAR** | El dueño escribe **SI** o **NO** |
| ESTADO | Pendiente / Aprobado / Rechazado / Ejecutado |

---

## 3. Pestaña `FABRICA` (ciclo de vida de los blogs V3)

Esta es la pestaña más importante para que el CEO gestione el estado de cada proyecto.

### Columnas recomendadas (fila 1)

```
BLOG_ID | NICHO_ID | NOMBRE_BLOG | SUPERFICIE | IDIOMA | PAIS | URL | META_ARTICULOS | ARTICULOS_PUBLICADOS | ESTADO | RITMO_MANTENIMIENTO | FECHA_INICIO | FECHA_COMPLETADO | ULTIMA_PUBLICACION | PROXIMA_PUBLICACION | NOTAS_CEO | ACTIVO
```

### Significado de cada columna

| Columna | Descripción | Quién la llena/actualiza |
|---------|-------------|---------------------------|
| **BLOG_ID** | Identificador único del blog | Sistema / CEO |
| **NICHO_ID** | Debe empezar con `V3-` | Investigador / CEO |
| **NOMBRE_BLOG** | Nombre legible | CEO |
| **SUPERFICIE** | `Blog` / `YouTube` / `App` | CEO |
| **IDIOMA** | es, en, etc. | CEO |
| **PAIS** | País prioritario | CEO |
| **URL** | URL del blog/canal cuando exista | Sistema |
| **META_ARTICULOS** | Número objetivo de artículos/videos que el CEO definió | **CEO** |
| **ARTICULOS_PUBLICADOS** | Cantidad real publicada hasta ahora | Sistema / flujos |
| **ESTADO** | `En producción` / `Completado` / `Mantenimiento` / `Pausado` / `Muerto` | **CEO** |
| **RITMO_MANTENIMIENTO** | Solo cuando ESTADO = Completado o Mantenimiento. Valores: `Semanal` / `Mensual` / `Semestral` / `Anual` / `Solo puntuales` | **CEO** |
| **FECHA_INICIO** | Cuándo se activó el proyecto | Sistema |
| **FECHA_COMPLETADO** | Cuándo se alcanzó la meta | Sistema / CEO |
| **ULTIMA_PUBLICACION** | Fecha del último artículo/video publicado | Sistema |
| **PROXIMA_PUBLICACION** | Próxima fecha programada (sobre todo en mantenimiento) | Sistema / CEO |
| **NOTAS_CEO** | Observaciones del CEO | CEO |
| **ACTIVO** | `SI` / `NO` (para filtrar rápido) | CEO |

### Lógica del ciclo de vida (cómo debe usarla el CEO)

1. **En producción**  
   - Se está trabajando activamente para llegar a `META_ARTICULOS`.  
   - Cuenta dentro de los máximo 3 proyectos intensivos de la semana.

2. **Completado**  
   - Se alcanzó `META_ARTICULOS`.  
   - El CEO cambia `ESTADO` a `Completado`.  
   - Define `RITMO_MANTENIMIENTO`.  
   - El proyecto **deja de competir** por los 3 cupos de producción intensiva.

3. **Mantenimiento**  
   - Estado posterior a Completado.  
   - Solo se publica según el ritmo definido (ideal: 1 artículo mensual).  
   - Consume muy pocos recursos.

4. **Pausado / Muerto**  
   - El CEO puede pausar o matar un proyecto que no rinde.

### Filtros útiles que el CEO (y los flujos) deben respetar

- Solo proyectos con `NICHO_ID` que empiece por `V3-`.
- Proyectos en `En producción` → candidatos a recibir trabajo intensivo.
- Proyectos en `Completado` o `Mantenimiento` → solo mantenimiento, no producción intensiva.
- `ACTIVO = SI` para ver solo los que siguen vivos.

---

## 4. Pestaña `V3_BORRADORES`

**Encabezados recomendados:**

```
FECHA | BLOG_ID | IDIOMA | TITULO | KEYWORD | PALABRAS | CALIDAD_OK | NOTAS | REQUIERE_REVISION_VET | HTML | APROBAR | ESTADO
```

- Aquí llegan los artículos generados por el Redactor.
- El dueño (o el flujo con su aprobación) pone `APROBAR = SI`.
- Solo entonces se publican.

---

## Resumen visual del flujo

```
Investigador genera nichos V3- (fondo verde)
        ↓
CEO elige máximo 3 y define META_ARTICULOS
        ↓
Se crea/actualiza fila en FABRICA → ESTADO = En producción
        ↓
Se producen artículos hasta alcanzar META_ARTICULOS
        ↓
CEO marca ESTADO = Completado + define RITMO_MANTENIMIENTO
        ↓
Pasa a mantenimiento (1 artículo mensual, semestral, etc.)
        ↓
Se libera cupo para un nuevo proyecto V3-
```

---

## Notas importantes

- La fábrica pequeña sigue usando sus propias filas (sin color) y su propia lógica de “completado”.
- La Fábrica V3 es completamente independiente gracias al prefijo `V3-` y a estas columnas de ciclo de vida.
- El CEO es quien decide la meta de artículos y el ritmo de mantenimiento de cada proyecto.
