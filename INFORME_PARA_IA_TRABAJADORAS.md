# 📄 Informe Ejecutivo para IA Trabajadoras - Automatización Veterinaria 2027

**Fecha de Generación:** Julio 2025  
**Responsable del Proyecto:** Equipo de Automatización + IA  
**Blog Destino:** [veterinarioluis.com](https://draft.blogger.com/blog/posts/2772493032989228627) (Blog ID: `2772493032989228627`)  
**Comunidad WhatsApp:** https://chat.whatsapp.com/IkpYnlrPyEx8Y2NTyaFB6P

---

## 🎯 OBJETIVO PRINCIPAL

Posicionar el blog **veterinarioluis.com** publicando **5 artículos diarios** de alto nivel clínico, sin duplicados, con monetización integrada y conversión a comunidad de WhatsApp.

---

## 📊 ESTADO ACTUAL DEL SISTEMA

### Flujos n8n Identificados
- **Total flujos veterinarios:** ~30 activos
- **Flujos no veterinarios a desactivar:** 4 (Seguro social, Bancarrota, Abogados familia, Anti-estrés general)
- **Tasa de fallo actual:** 81.4% (requiere actualización de prompts y lógica anti-duplicados)

### Google Sheets Mapeados
| Nombre del Sheet | ID | Estado de Conexión |
|---|---|---|
| VETERINARIO BLOG OFICIAL | `13zYYocI1qa5JKrn1xAj1e2T_mpU11spVKlW-ZCHMlcM` | ✅ Conectado (parcial) |
| Veterinario luis arturo garcia | `1KkClLscmdwlZAyM4HKoA8WvukQMSoYOpB8jeBrSoN0s` | ✅ Conectado |
| VETERINARIA NICHOS_HIGH_TICKET | `1dtc4KTy7awk5QMA_UfsDgey8W3B8Hh_qQZg3RELcRF8` | ✅ Conectado (parcial) |
| NUEVOS NICHOS VETERINARIOS | `1euIPpzZc8FG6zz1c6vR4m0uHAaAGeaEoDRaNg_ufriQ` | ⚠️ Revisar conexiones |
| 50 MIL TITULOS DE ARTICULOS VETERINARIOS | Por identificar | ❌ Sin flujo |
| Fabrica_Blog_Veterinario_Luis_Garcia | Por identificar | ❌ Sin flujo |

---

## 🛠️ TAREAS PRIORITARIAS PARA LAS IA TRABAJADORAS

### TAREA 1: Desactivar Flujos No Veterinarios (CRÍTICO)
**Acción requerida:**
1. Acceder a la interfaz de n8n
2. Buscar y DESACTIVAR los siguientes flujos:
   - `♿ Seguro social denegado`
   - `💸 Bancarrota Chapter 7`
   - `ABOGADOS FAMILIA USA SIN REPETICION DE TEMAS`
   - `1 FLUJO ANTI ESTRES MILLONARIO`

**Justificación:** Estos flujos consumen recursos y no contribuyen al objetivo de posicionamiento veterinario.

---

### TAREA 2: Verificar Blog ID en Todos los Flujos Veterinarios
**Acción requerida:**
1. Para cada flujo veterinario (~30 flujos):
   - Abrir el flujo en n8n
   - Localizar el nodo "Blogger - Publicar Artículo"
   - Verificar que el campo `Blog ID` sea exactamente: `2772493032989228627`
   - Si es diferente, actualizarlo

**Nota:** Algunos flujos pueden estar apuntando a blogs de nicho separados. Todos deben consolidarse en el blog maestro.

---

### TAREA 3: Actualizar System Prompt en Todos los Flujos (CRÍTICO)
**Acción requerida:**
1. En cada flujo veterinario, localizar el nodo "AI Agent" o "LLM Chain"
2. Reemplazar completamente el campo `System Message` con el siguiente prompt:

```text
Eres un Médico Veterinario experto en redacción científica y divulgación médica de alto nivel. Tu tarea es generar artículos profesionales para el blog "Veterinario Luis García".

## REQUISITOS OBLIGATORIOS DE ESTRUCTURA Y CONTENIDO:

1. **CASO CLÍNICO INTEGRADO**: 
   - Inicia o intercala en el artículo un caso clínico real o hipotético detallado.
   - Ejemplo: "Caso Clínico: Paciente canino, Macho, 5 años, raza Labrador, presentado con cuadro de vómitos crónicos y pérdida de peso..."
   - Describe signos clínicos, diagnóstico diferencial, pruebas realizadas y tratamiento.

2. **GLOSARIO MÉDICO VETERINARIO**:
   - Debes usar términos técnicos profesionales (ej: *nefropatía, prurito, disnea, profilaxis, etiología, pronóstico reservado, hemograma, bioquímica sérica*).
   - INMEDIATAMENTE después de usar el término, explica su significado entre paréntesis o en una frase accesible para el dueño de la mascota.
   - Ejemplo: "El paciente presenta *poliuria* (aumento anormal en la producción de orina) y *polidipsia* (sed excesiva y aumento en la ingesta de agua)."

3. **BIBLIOGRAFÍA CIENTÍFICA APA**:
   - Intercala citas de libros y revistas veterinarias reales dentro de los párrafos.
   - Formato: "(Apellido, Año)" o "Según la WSAVA (2023)..."
   - Libros de referencia obligatoria: 
     - *Manual de Medicina Interna Veterinaria* (Nelson & Couto)
     - *Enfermedades Infecciosas en Perros y Gatos* (Greene)
     - *Tratado de Medicina Felina* (August)
     - *Merck Veterinary Manual*
   - Al final del artículo, incluye una sección "📚 Bibliografía Consultada" con 3-5 referencias completas en formato APA.

4. **MONETIZACIÓN Y AFILIADOS**:
   - Inserta estratégicamente 2-3 recomendaciones de productos de Amazon/Hotmart relacionados con el tema.
   - Usa un tono de recomendación profesional: "Para el manejo en casa, recomendamos [Producto] que ayuda a [beneficio clínico]."
   - Incluye el enlace de afiliado correspondiente (usar datos de la hoja de afiliados).

5. **OPTIMIZACIÓN SEO, AEO Y RICH SNIPPETS**:
   - Usa etiquetas HTML: <h1>, <h2>, <h3> correctamente jerarquizadas.
   - Incluye una sección de "❓ Preguntas Frecuentes (FAQ)" al final con 3-5 preguntas relevantes.
   - Genera un bloque JSON-LD de tipo `Article` o `FAQPage` para rich snippets (insertar al final antes de cerrar body).
   - Longitud: 1500-2500 palabras mínimo.

6. **TONO HUMANO (Human Level)**:
   - Escribe con empatía, como si estuvieras hablando con un dueño preocupado pero informado.
   - Evita frases robóticas como "En conclusión", "Es importante destacar". Usa transiciones naturales.
   - Usa storytelling en el caso clínico para generar conexión emocional.

7. **LLAMADO A LA ACCIÓN - COMUNIDAD WHATSAPP**:
   - AL FINAL DEL ARTÍCULO, inserta este bloque destacado:
   
   ---
   🩺 **¿Necesitas orientación veterinaria personalizada?**
   Únete a nuestra **Comunidad Exclusiva de WhatsApp** donde compartimos casos, consejos y respondemos dudas en tiempo real.
   👉 **[HAZ CLIC AQUÍ PARA UNIRTE](https://chat.whatsapp.com/IkpYnlrPyEx8Y2NTyaFB6P)**
   ---

8. **IMÁGENES**:
   - Sugiere 2-3 imágenes temáticas con descripciones ALT optimizadas para SEO.
   - Si el flujo tiene nodo de imagen (Pexels/Pixabay), asegura que el prompt de búsqueda use términos veterinarios precisos.

## FORMATO DE SALIDA:
- El artículo debe estar en HTML limpio, listo para publicar en Blogger.
- No incluyas markdown (```) alrededor del HTML.
- Asegúrate de que el título sea atractivo y contenga palabras clave principales.

## NOTA CRÍTICA:
Si el tema es sobre una patología, SIEMPRE menciona cuándo es una emergencia veterinaria que requiere atención inmediata.
```

---

### TAREA 4: Configurar Cron Triggers con Frecuencias Escalonadas
**Objetivo:** Publicar ~5 artículos/día en total, no 5 por flujo.

**Configuración sugerida por grupo:**

| Grupo | Flujos | Frecuencia | Ejemplo Cron | Horarios UTC |
|---|---|---|---|---|
| **A (Principales)** | 6 flujos | Cada 3 días | `0 8 */3 * *` | 08:00, 12:00, 16:00 |
| **B (High-Ticket)** | 5 flujos | Cada 4 días | `0 10 */4 * *` | 10:00, 14:00 |
| **C (Especies)** | 13 flujos | Cada 6 días | `0 9 */6 * *` | 09:00, 11:00, 15:00, 17:00 |
| **D (Desarrollo)** | 6 flujos | Cada 7 días | `0 18 */7 * *` | 18:00 |

**Acción requerida:**
1. Clasificar cada flujo veterinario en uno de los 4 grupos
2. Actualizar el nodo "Cron Trigger" con la frecuencia correspondiente
3. Escalonar horarios para evitar publicaciones simultáneas

---

### TAREA 5: Implementar Lógica Anti-Duplicados
**Requisito previo:** Cada Google Sheet debe tener estas columnas:
- `ID_UNICO` (ej: N001, VET_001)
- `TITULO`
- `ESTADO` (valores: PENDIENTE, EN_PROCESO, PUBLICADO, DUPLICADO, ERROR)
- `URL_BLOGGER` (vacío hasta publicar)
- `FECHA_PUBLICACION` (vacío hasta publicar)

**Secuencia de nodos requerida en cada flujo:**
```
Cron Trigger 
  → Google Sheets Read (leer todas las filas)
  → Code Node (filtrar solo ESTADO = 'PENDIENTE' o 'SIN_USAR')
  → Google Sheets Update (marcar como 'EN_PROCESO' inmediatamente)
  → AI Agent (generar artículo)
  → Blogger (publicar como BORRADOR)
  → Google Sheets Update (marcar como 'PUBLICADO', agregar URL y fecha)
  → Code Node (manejo de errores: marcar como 'ERROR' si falla)
```

**Código para el nodo "Code - Filtrar Pendientes":**
```javascript
const rows = $input.all();
const pendingRow = rows.find(row => 
  row.json.ESTADO === 'PENDIENTE' || 
  row.json.ESTADO === 'SIN_USAR' ||
  row.json.ESTADO === 'PTE'
);

if (!pendingRow) {
  throw new Error('No hay temas pendientes en esta hoja');
}

return [pendingRow];
```

---

### TAREA 6: Crear Flujos para Pestañas Huérfanas
**Acción requerida:**
1. Revisar todos los Google Sheets listados arriba
2. Identificar pestañas que NO tengan un flujo asignado
3. Para cada pestaña huérfana:
   - Importar el archivo `plantilla_flujo_veterinario_maestro.json` en n8n
   - Actualizar variables de entorno:
     - `GOOGLE_SHEET_ID` = ID del sheet correspondiente
     - `GOOGLE_SHEET_RANGE` = Nombre exacto de la pestaña
   - Configurar Cron Trigger con frecuencia escalonada (ver Tarea 4)
   - Activar el flujo

**Pestañas huérfanas potenciales a verificar:**
- En `50 MIL TITULOS DE ARTICULOS VETERINARIOS`: ¿Hay pestañas con temas generados?
- En `NUEVOS NICHOS VETERINARIOS`: ¿Todas las pestañas tienen flujo?
- En `Fabrica_Blog_Veterinario_Luis_Garcia`: Si hay datos, crear flujo

---

### TAREA 7: Geolocalización para Tráfico USA (OPCIONAL AVANZADO)
**Objetivo:** Atraer tráfico internacional usando las bases de datos de veterinarias en USA mencionadas.

**Acción requerida:**
1. Identificar las hojas de cálculo con datos de veterinarias en USA
2. Crear 1-2 flujos específicos que:
   - Lean temas geolocalizados (ej: "Heartworm prevention in Florida")
   - Generen artículos mencionando ubicaciones, climatología y enfermedades endémicas de USA
   - Mantengan el idioma español (para hispanohablantes en USA) o inglés si el blog lo permite

---

## ✅ CHECKLIST DE VERIFICACIÓN

Cada IA trabajadora debe reportar el completion de estas tareas:

- [ ] **Tarea 1:** 4 flujos no veterinarios DESACTIVADOS
- [ ] **Tarea 2:** ~30 flujos veterinarios verificados con Blog ID `2772493032989228627`
- [ ] **Tarea 3:** System Prompt actualizado en TODOS los flujos veterinarios
- [ ] **Tarea 4:** Cron Triggers configurados con frecuencias escalonadas
- [ ] **Tarea 5:** Lógica anti-duplicados implementada (lectura/escritura de ESTADO en Google Sheets)
- [ ] **Tarea 6:** Flujos huérfanos creados desde plantilla
- [ ] **Tarea 7 (opcional):** Flujo de geolocalización USA creado
- [ ] **Pruebas:** Ejecución manual exitosa en 1 flujo de cada grupo (A, B, C, D)
- [ ] **Validación:** Artículos en borrador revisados en Blogger (verificar presencia de: caso clínico, glosario, citas APA, WhatsApp CTA, afiliados)
- [ ] **Activación:** Todos los flujos veterinarios ACTIVADOS

---

## 📁 ARCHIVOS DE SOPORTE DISPONIBLES

En el directorio `/workspace` encontrarás:

1. **`plantilla_flujo_veterinario_maestro.json`**  
   Plantilla JSON lista para importar en n8n. Contiene todos los nodos configurados con el system prompt correcto, lógica anti-duplicados y Blog ID actualizado.

2. **`guia_actualizacion_manual.sh`**  
   Script bash que genera instrucciones paso a paso para ejecutar en terminal. Útil para referencia rápida durante la implementación manual.

3. **`PLAN_ACCION_VETERINARIA_2027.md`**  
   Plan detallado con clasificación de flujos por grupo, ejemplos de configuración cron y estrategias de implementación.

4. **`INFORME_MAESTRO_VETERINARIA_2027.md`**  
   Auditoría completa del estado actual de flujos y sheets.

---

## 🚨 MANEJO DE ERRORES COMUNES

### Error: "No hay temas pendientes en esta hoja"
**Causa:** Todas las filas están en estado PUBLICADO, EN_PROCESO o DUPLICADO.  
**Solución:** Revisar el Google Sheet y agregar nuevos temas con estado PENDIENTE.

### Error: "Blog ID no encontrado"
**Causa:** El Blog ID en el nodo Blogger es incorrecto o las credenciales OAuth expiraron.  
**Solución:** Verificar que el Blog ID sea `2772493032989228627` y reconectar la credencial de Blogger.

### Error: "Rate limit exceeded" en Google Sheets API
**Causa:** Demasiadas solicitudes concurrentes.  
**Solución:** Espaciar más los Cron Triggers o implementar colas de espera entre nodos.

### Error: "Contenido duplicado detectado"
**Causa:** El título ya existe en Blogger o en el mismo Google Sheet.  
**Solución:** Mejorar la verificación anti-duplicados comparando títulos con fuzzy matching (>80% similitud).

---

## 📈 MÉTRICAS DE ÉXITO

Después de implementar todas las tareas, monitorear durante 7 días:

| Métrica | Objetivo | Cómo medir |
|---|---|---|
| **Artículos publicados/día** | 5 ± 1 | Contar posts nuevos en Blogger |
| **Tasa de fallo de flujos** | < 10% | Revisar dashboard de ejecuciones en n8n |
| **Duplicados detectados** | 0 | Verificar columna ESTADO en Google Sheets |
| **Presencia de WhatsApp CTA** | 100% de artículos | Auditoría manual de 10 artículos aleatorios |
| **Presencia de citas APA** | 100% de artículos | Auditoría manual de 10 artículos aleatorios |
| **Presencia de caso clínico** | 100% de artículos | Auditoría manual de 10 artículos aleatorios |

---

## 📞 CONTACTO Y REPORTES

Cada IA trabajadora debe reportar:
1. Tareas completadas (lista numerada)
2. Errores encontrados y cómo se resolvieron
3. Flujos modificados (nombre y ID)
4. Capturas de pantalla de ejecuciones exitosas (si es posible)

**Formato de reporte:**
```
[IA_WORKER_X] - Reporte de Progreso
=====================================
Fecha: [YYYY-MM-DD HH:MM]
Tareas completadas:
  1. [Descripción]
  2. [Descripción]
  
Errores encontrados:
  - [Error]: [Solución aplicada]
  
Flujos modificados:
  - [Nombre del flujo] (ID: [workflow_id])
  
Próximos pasos:
  - [Tarea pendiente]
```

---

**¡Manos a la obra! El éxito del posicionamiento de veterinarioluis.com depende de la ejecución precisa de estas tareas.** 🚀
