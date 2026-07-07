#!/bin/bash

# SCRIPT DE ACTUALIZACIÓN MASIVA - FLUJOS VETERINARIOS 2027
# Este script genera instrucciones detalladas para actualizar manualmente los flujos en n8n
# NOTA: La API pública de n8n no permite activación directa sin autenticación compleja

echo "=========================================="
echo "📋 GUÍA DE ACTUALIZACIÓN MANUAL - n8n"
echo "=========================================="
echo ""
echo "⚠️ IMPORTANTE: La API de n8n requiere autenticación compleja para activación masiva."
echo "Sigue estos pasos manuales en la interfaz de n8n:"
echo ""

# Lista de flujos veterinarios a mantener (extraída del informe)
declare -a VET_WORKFLOWS=(
  "FLUJO VETERINARIO LUIS BLOGGER"
  "Veterinario ECUADOR Y MUNDO Luis Blogger copy"
  "mejorar articulos veterinario"
  "Veterinario QUITO Luis Blogger copy"
  "Veterinario CUENCA Luis Blogger copy"
  "Veterinario Guayaquil Luis Blogger"
  "FLUJO VETERINARIO MILLONARIO - RENALES Y URINARIOS EN GATOS"
  "FLUJO VETERINARIO MILLONARIO - TECNOLOGÍA"
  "FLUJO VETERINARIO MILLONARIO - ANSIEDAD Y ESTRES"
  "8 FLUJO VETERINARIA + CASOS ESTUDIOS (LISTO)"
  "FLUJO VETERINARIO MILLONARIO - PRIMEROS AUXILIOS MASCOTAS"
  "ACUARIOS BIOTOPO SIN REPETICION DE TEMAS"
  "CAMARONES DE ACUARIO"
  "GECKO LEOPARDO SIN REPETICION DE TEMAS"
  "REPTILES SIN REPETICION DE TEMAS"
  "LOROS SIN REPETICION DE TEMAS"
  "HURONES SIN REPETICION DE TEMAS"
  "BULLDOGS FLUJO"
  "BOVINOS SIN REPETICION DE TEMAS"
  "ALIMENTOS PARA GATOS SIN REPETICION DE TEMAS"
  "ALIMENTOS PARA PERROS SIN REPETICION DE TEMAS"
  "PEZ BETTA SIN REPETICION DE TEMAS"
  "PEZ PLATY SIN REPETICION DE TEMAS"
  "PEZ Guppy REPETICION DE TEMAS"
  "FLUJO VETERINARIO MILLONARIO - MASCOTAS EXÓTICAS"
  "FLUJO VETERINARIO MILLONARIO - 10 NICHOS MASCOTAS"
  "6C Generador de Temas Veterinarios (Fase 2)"
  "FLUJO_VET_PRIMERA_PERSONA_V3"
  "Difusión Automática Blog VETERINARIO LUIS BLOGGER"
  "Difusión Automática Blog BULLDOG BLOGGER"
)

# Flujos NO veterinarios a DESACTIVAR
declare -a NON_VET_WORKFLOWS=(
  "♿ Seguro social denegado"
  "💸 Bancarrota Chapter 7"
  "ABOGADOS FAMILIA USA SIN REPETICION DE TEMAS"
  "1 FLUJO ANTI ESTRES MILLONARIO"
)

echo "🔴 PASO 1: DESACTIVAR FLUJOS NO VETERINARIOS"
echo "----------------------------------------------"
for workflow in "${NON_VET_WORKFLOWS[@]}"; do
  echo "  ❌ Desactivar: '$workflow'"
done
echo ""
echo "➡️ Acción: Ve a cada flujo en n8n, haz clic en el interruptor 'Active' para DESACTIVAR."
echo ""

echo "🟢 PASO 2: VERIFICAR BLOG ID EN TODOS LOS FLUJOS VETERINARIOS"
echo "---------------------------------------------------------------"
echo "Todos los flujos veterinarios deben apuntar al Blog ID: 2772493032989228627"
echo ""
echo "➡️ Acción para cada flujo veterinario:"
echo "  1. Abre el flujo en n8n"
echo "  2. Busca el nodo 'Blogger - Publicar Artículo' (o similar)"
echo "  3. Verifica que el campo 'Blog ID' sea: 2772493032989228627"
echo "  4. Si no es correcto, actualízalo"
echo ""

echo "🟡 PASO 3: ACTUALIZAR SYSTEM PROMPT EN CADA FLUJO"
echo "---------------------------------------------------"
echo "Copia el siguiente System Prompt y pégalo en el nodo 'AI Agent' de CADA flujo veterinario:"
echo ""
echo "--------------------------------------------------------------------------------"
cat << 'PROMPT_EOF'
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
PROMPT_EOF
echo "--------------------------------------------------------------------------------"
echo ""

echo "🔵 PASO 4: CONFIGURAR CRON TRIGGERS CON FRECUENCIAS ESCALONADAS"
echo "-----------------------------------------------------------------"
echo "Para lograr ~5 artículos/día sin saturación, configura los Cron Triggers así:"
echo ""
echo "GRUPO A (Principales - 6 flujos): Cada 3 días"
echo "  Ejemplo: 0 8 */3 * *  (8:00 AM UTC)"
echo "  Ejemplo: 0 12 */3 * * (12:00 PM UTC)"
echo ""
echo "GRUPO B (High-Ticket - 5 flujos): Cada 4 días"
echo "  Ejemplo: 0 10 */4 * * (10:00 AM UTC)"
echo "  Ejemplo: 0 14 */4 * * (2:00 PM UTC)"
echo ""
echo "GRUPO C (Especies - 13 flujos): Cada 6 días"
echo "  Ejemplo: 0 9 */6 * *  (9:00 AM UTC)"
echo "  Ejemplo: 0 11 */6 * * (11:00 AM UTC)"
echo ""
echo "GRUPO D (Desarrollo - 6 flujos): Cada 7 días (solo testing)"
echo "  Ejemplo: 0 18 */7 * * (6:00 PM UTC)"
echo ""

echo "🟣 PASO 5: IMPLEMENTAR LÓGICA ANTI-DUPLICADOS"
echo "-----------------------------------------------"
echo "Cada flujo debe tener esta secuencia de nodos:"
echo "  1. Google Sheets Read → Leer todas las filas"
echo "  2. Code Node → Filtrar solo ESTADO = 'PENDIENTE' o 'SIN_USAR'"
echo "  3. Google Sheets Update → Marcar como 'EN_PROCESO' inmediatamente"
echo "  4. AI Agent → Generar artículo"
echo "  5. Blogger → Publicar como BORRADOR"
echo "  6. Google Sheets Update → Marcar como 'PUBLICADO', agregar URL y fecha"
echo ""
echo "Columnas requeridas en cada Google Sheet:"
echo "  - ID_UNICO"
echo "  - TITULO"
echo "  - ESTADO (PENDIENTE, EN_PROCESO, PUBLICADO, DUPLICADO, ERROR)"
echo "  - URL_BLOGGER"
echo "  - FECHA_PUBLICACION"
echo ""

echo "🟤 PASO 6: IMPORTAR PLANTILLA PARA FLUJOS HUÉRFANOS"
echo "-----------------------------------------------------"
echo "Si detectas pestañas en Google Sheets sin flujo asignado:"
echo "  1. Importa el archivo: plantilla_flujo_veterinario_maestro.json"
echo "  2. Actualiza las variables de entorno:"
echo "     - GOOGLE_SHEET_ID = ID del sheet correspondiente"
echo "     - GOOGLE_SHEET_RANGE = Nombre de la pestaña"
echo "  3. Configura el Cron Trigger con frecuencia escalonada"
echo "  4. Activa el flujo"
echo ""

echo "=========================================="
echo "✅ CHECKLIST FINAL"
echo "=========================================="
echo ""
echo "  [ ] 4 flujos NO veterinarios DESACTIVADOS"
echo "  [ ] ~30 flujos veterinarios verificados con Blog ID correcto"
echo "  [ ] System Prompt actualizado en todos los flujos"
echo "  [ ] Cron Triggers configurados con frecuencias escalonadas"
echo "  [ ] Lógica anti-duplicados implementada (ESTADO en Google Sheets)"
echo "  [ ] Flujos huérfanos creados desde plantilla"
echo "  [ ] Prueba manual ejecutada en 1 flujo de cada grupo"
echo "  [ ] Artículos en borrador revisados en Blogger"
echo "  [ ] Todos los flujos ACTIVADOS"
echo ""
echo "=========================================="
echo "📅 Fecha de inicio: INMEDIATA"
echo "🎯 Blog destino: veterinarioluis.com (ID: 2772493032989228627)"
echo "💬 Comunidad WhatsApp: https://chat.whatsapp.com/IkpYnlrPyEx8Y2NTyaFB6P"
echo "=========================================="
