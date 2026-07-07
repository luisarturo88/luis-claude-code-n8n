# 📋 Plan de Acción: Flujos Veterinaria 2027 - Consolidación y Optimización

## 🎯 Objetivo Principal
Consolidar todo el tráfico en el blog maestro **veterinarioluis.com** (Blog ID: `2772493032989228627`), publicando **5 artículos diarios** sin duplicados, con contenido de alto nivel clínico, monetizado y optimizado.

---

## ✅ FASE 1: Limpieza y Filtrado de Flujos

### 🔴 FLUJOS A DESACTIVAR (NO VETERINARIA)
Desactiva manualmente en n8n los siguientes flujos que NO pertenecen a la temática veterinaria:

| Nombre del Flujo | Acción | Justificación |
|---|---|---|
| `♿ Seguro social denegado` | **DESACTIVAR** | Temática legal/discapacidad, no veterinaria |
| `💸 Bancarrota Chapter 7` | **DESACTIVAR** | Temática legal/financiera USA, no veterinaria |
| `ABOGADOS FAMILIA USA SIN REPETICION DE TEMAS` | **DESACTIVAR** | Temática legal, no veterinaria |
| `1 FLUJO ANTI ESTRES MILLONARIO` | **DESACTIVAR** | Temática general autoayuda, no veterinaria específica |

### 🟢 FLUJOS VETERINARIOS A MANTENER Y OPTIMIZAR
Estos son los flujos que trabajaremos. Todos deben apuntar al blog maestro `2772493032989228627`:

#### Grupo A: Flujos Principales (Google Sheets Maestros)
1.  `FLUJO VETERINARIO LUIS BLOGGER` - Pestaña: `03_CLUSTERS_TRANSACCIONALES`
2.  `Veterinario ECUADOR Y MUNDO Luis Blogger copy` - Pestaña: `Temas Ecuador y Mundo`
3.  `mejorar articulos veterinario` - Refuerzo de contenido
4.  `Veterinario QUITO Luis Blogger copy` - Pestaña: `CLUSTER CIUDADES`
5.  `Veterinario CUENCA Luis Blogger copy` - Nichos nuevos
6.  `Veterinario Guayaquil Luis Blogger` - Geolocalizado

#### Grupo B: Flujos de Nichos High-Ticket (Alto Valor)
7.  `FLUJO VETERINARIO MILLONARIO - RENALES Y URINARIOS EN GATOS`
8.  `FLUJO VETERINARIO MILLONARIO - TECNOLOGÍA` (Smart Pet Tech)
9.  `FLUJO VETERINARIO MILLONARIO - ANSIEDAD Y ESTRES`
10. `8 FLUJO VETERINARIA + CASOS ESTUDIOS (LISTO)` - Nutrición
11. `FLUJO VETERINARIO MILLONARIO - PRIMEROS AUXILIOS MASCOTAS`

#### Grupo C: Flujos de Especies Específicas
12. `ACUARIOS BIOTOPO SIN REPETICION DE TEMAS` (y copias)
13. `CAMARONES DE ACUARIO` (y copias)
14. `GECKO LEOPARDO SIN REPETICION DE TEMAS` (y copias)
15. `REPTILES SIN REPETICION DE TEMAS`
16. `LOROS SIN REPETICION DE TEMAS` (y copias)
17. `HURONES SIN REPETICION DE TEMAS`
18. `BULLDOGS FLUJO` (y copias)
19. `BOVINOS SIN REPETICION DE TEMAS` (Abogados bovinos - verificar si es veterinaria bovina)
20. `ALIMENTOS PARA GATOS SIN REPETICION DE TEMAS`
21. `ALIMENTOS PARA PERROS SIN REPETICION DE TEMAS`
22. `PEZ BETTA SIN REPETICION DE TEMAS` (y variantes)
23. `PEZ PLATY SIN REPETICION DE TEMAS` (y variantes)
24. `PEZ Guppy REPETICION DE TEMAS` (y variantes)

#### Grupo D: Flujos en Desarrollo / Borradores
25. `FLUJO VETERINARIO MILLONARIO - MASCOTAS EXÓTICAS`
26. `FLUJO VETERINARIO MILLONARIO - 10 NICHOS MASCOTAS`
27. `6C Generador de Temas Veterinarios (Fase 2)`
28. `FLUJO_VET_PRIMERA_PERSONA_V3`
29. `Difusión Automática Blog VETERINARIO LUIS BLOGGER`
30. `Difusión Automática Blog BULLDOG BLOGGER`

---

## ✍️ FASE 2: Actualización del System Prompt (OBLIGATORIO PARA TODOS)

Cada flujo veterinario debe tener su nodo de IA (Agent/LLM) configurado con el siguiente **System Prompt Maestro**. Copia y pega esto en el campo `System Message` de cada agente:

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

## 📅 FASE 3: Distribución de Publicaciones (5 Artículos/Día)

Para evitar duplicados y saturación, configura los **Cron Triggers** de cada flujo con esta distribución:

| Grupo | Cantidad Flujos | Frecuencia Sugerida | Horarios Sugeridos (UTC) | Total Diario Estimado |
|---|---|---|---|---|
| **Grupo A (Principales)** | 6 | Cada 3 días | 08:00, 12:00, 16:00 | ~2 art/día |
| **Grupo B (High-Ticket)** | 5 | Cada 4 días | 10:00, 14:00 | ~1.25 art/día |
| **Grupo C (Especies)** | 13 | Cada 6 días | 09:00, 11:00, 15:00, 17:00 | ~2.1 art/día |
| **Grupo D (Desarrollo)** | 6 | Cada 7 días (solo test) | 18:00 | ~0.8 art/día |

**Total estimado:** ~6 artículos/día (ajustable bajando frecuencia de Grupo C).

### Configuración Cron Ejemplo:
- Flujo 1: `0 8 */3 * *` (Cada 3 días a las 8 AM)
- Flujo 2: `0 12 */3 * *` (Cada 3 días a las 12 PM)
- Flujo 3: `0 10 */4 * *` (Cada 4 días a las 10 AM)
- ... y así sucesivamente, escalonando horarios.

---

## 🛡️ FASE 4: Sistema Anti-Duplicados

Cada flujo debe implementar esta lógica ANTES de generar el artículo:

1.  **Leer Google Sheet**: Obtener fila con estado `PENDIENTE` o `SIN_USAR`.
2.  **Marcar como `EN_PROCESO`**: Inmediatamente al leer, actualizar la fila para bloquearla.
3.  **Verificar en Blogger (Opcional pero recomendado)**:
    - Usar nodo "Blogger" -> "Get Many Posts" para buscar títulos similares.
    - Si existe un título con >80% similitud, marcar como `DUPLICADO` y saltar a la siguiente fila.
4.  **Generar Artículo**: Con el System Prompt actualizado.
5.  **Publicar en Blogger**: Como `BORRADOR` inicialmente para revisión, o `PUBLICADO` si hay confianza total.
6.  **Actualizar Google Sheet**: Cambiar estado a `PUBLICADO`, agregar URL del post y fecha.

### Columnas Requeridas en cada Google Sheet:
- `ID_UNICO` (ej: N001, VET_001)
- `TITULO`
- `ESTADO` (PENDIENTE, EN_PROCESO, PUBLICADO, DUPLICADO, ERROR)
- `URL_BLOGGER` (vacío hasta publicar)
- `FECHA_PUBLICACION` (vacío hasta publicar)
- `NOTAS` (para errores o comentarios)

---

## 🚀 FASE 5: Creación de Flujos Faltantes

Identifica pestañas en los Google Sheets que NO tengan flujo asignado. Para cada una:

1.  **Exportar un flujo modelo** (ej: `FLUJO VETERINARIO MILLONARIO - RENALES Y URINARIOS EN GATOS`).
2.  **Modificar en el JSON**:
    - Cambiar `name` del flujo.
    - Actualizar nodo "Google Sheets" -> `Sheet ID` y `Range` (pestaña nueva).
    - Actualizar nodo "Blogger" -> `Blog ID` a `2772493032989228627`.
    - Actualizar nodo "AI Agent" -> Pegar el **System Prompt Maestro**.
    - Ajustar nodo "Cron Trigger" con frecuencia escalonada.
3.  **Importar el nuevo flujo** en n8n.
4.  **Activar y probar** con una ejecución manual.

### Pestañas Huérfanas Potenciales (Verificar):
- En `50 MIL TITULOS DE ARTICULOS VETERINARIOS`: ¿Hay pestañas con temas generados?
- En `NUEVOS NICHOS VETERINARIOS`: Pestañas como `TECNOLOGÍA` ya tienen flujo, ¿hay otras?
- En `VETERINARIO BLOG OFICIAL`: ¿Todas las pestañas están cubiertas?
- En `Fabrica_Blog_Veterinario_Luis_Garcia`: Si hay datos, crear flujo.

---

## 🌍 FASE 6: Geolocalización USA y Tráfico Internacional

Para atraer tráfico de USA y otros países:

1.  **Usar las bases de datos de veterinarias en USA** mencionadas:
    - Crear un flujo específico que lea estas hojas.
    - Generar artículos enfocados en problemas comunes en USA (ej: "Heartworm prevention in Florida", "Lyme disease in Northeast US dogs").
    - Incluir términos en inglés técnico si el blog lo permite, o mantener español pero mencionar ubicaciones USA.

2.  **Configurar nodo de idioma/región**:
    - En el prompt, añadir: "El artículo debe ser relevante para dueños de mascotas en [PAÍS/REGIÓN], mencionando climatología, enfermedades endémicas y regulaciones locales."

3.  **Hreflang y SEO Internacional**:
    - Si el blog tiene versiones en otros idiomas, asegurar etiquetas hreflang.
    - Si es solo español, enfocar en "Español en USA" (hispanohablantes).

---

## 📝 Checklist de Implementación

- [ ] **Desactivar** flujos no veterinarios (4 flujos listados arriba).
- [ ] **Verificar** que todos los flujos veterinarios apunten al Blog ID `2772493032989228627`.
- [ ] **Actualizar** el System Prompt en los ~30 flujos veterinarios activos.
- [ ] **Reconfigurar** los Cron Triggers con frecuencias escalonadas.
- [ ] **Implementar** lógica anti-duplicados en cada flujo (lectura/escritura de estado).
- [ ] **Crear** flujos faltantes para pestañas huérfanas.
- [ ] **Probar** 1 flujo de cada grupo con ejecución manual.
- [ ] **Revisar** artículos en borrador en Blogger para validar calidad.
- [ ] **Activar** todos los flujos optimizados.
- [ ] **Monitorear** durante 7 días la cantidad de publicaciones diarias (meta: 5/día).

---

## 📂 Archivos Adjuntos para Importación

Se incluyen plantillas JSON listas para importar:
- `plantilla_flujo_veterinario_maestro.json`: Flujo base con todos los nodos configurados.
- `script_actualizacion_prompts.py`: Script para automatizar la actualización de prompts vía API (si hay acceso).
- `lista_ids_flujos_veterinarios.txt`: Listado de IDs de flujos a mantener.

---

**Fecha de Inicio**: Inmediato  
**Responsable**: Equipo de Automatización + IA  
**Blog Destino**: https://draft.blogger.com/blog/posts/2772493032989228627  
**Comunidad**: https://chat.whatsapp.com/IkpYnlrPyEx8Y2NTyaFB6P
