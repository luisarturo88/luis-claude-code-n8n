/**
 * ============================================================
 * BLOG FACTORY — Google Apps Script
 * Sheet ID: 14NYqDn77J9nsTjD8ZsvxzDe1lggNwmC6kUZcE3LNbJI
 * ============================================================
 * INSTRUCCIONES:
 * 1. Abre tu Google Sheet
 * 2. Extensiones → Apps Script
 * 3. Pega este código completo
 * 4. Cambia DEEPSEEK_API_KEY por tu clave real
 * 5. Ejecuta "paso1_crearPestanas" primero
 * 6. Luego ejecuta "paso2_generarTodosLosTemas" (tarda ~15 min)
 * ============================================================
 */

// ⚠️ CAMBIA ESTO POR TU CLAVE DE DEEPSEEK
const DEEPSEEK_API_KEY = 'sk-PEGA_TU_CLAVE_DEEPSEEK_AQUI';

const SHEET_ID = '14NYqDn77J9nsTjD8ZsvxzDe1lggNwmC6kUZcE3LNbJI';
const TEMAS_POR_BLOG = 1500;
const LOTE_DEEPSEEK  = 50;   // temas por llamada a DeepSeek

// ============================================================
// CONFIGURACIÓN MAESTRA DE TODOS LOS BLOGS
// ============================================================
const BLOGS = [
  // === ANIMALES ===
  { tab:'Perros-Alimentacion', nombre:'Alimentación para perros',       nicho:'animales', tema:'alimentación natural, dieta BARF, recetas caseras, nutrición canina, alimentos prohibidos para perros', productos:['dieta-natural','snack-barf','vital-pet'] },
  { tab:'Gatos-Alimentacion',  nombre:'Alimentación para gatos',        nicho:'animales', tema:'alimentación natural felina, dieta cruda, recetas caseras para gatos, alimentos peligrosos para gatos', productos:['entiende-gato','dieta-natural'] },
  { tab:'Bulldogs',            nombre:'Bulldogs Vet',                   nicho:'animales', tema:'bulldog inglés y francés: salud, respiración, alimentación, enfermedades comunes, reproducción', productos:['adiestramiento','mascotas-sanas'] },
  { tab:'Pastor-Aleman',       nombre:'Pastor alemán',                  nicho:'animales', tema:'pastor alemán: adiestramiento, salud, displasia, alimentación, cachorro, temperamento', productos:['adiestramiento','mascotas-sanas'] },
  { tab:'Razas-Perro',         nombre:'Razas de perro',                 nicho:'animales', tema:'comparativas de razas, características físicas, temperamento, cuidados específicos por raza', productos:['adiestramiento','mascotas-sanas'] },
  { tab:'Hurones',             nombre:'Hurones',                        nicho:'animales', tema:'cuidado de hurones, alimentación, enfermedades, comportamiento, primer hurón, vacunas, jaula', productos:['mascotas-sanas'] },
  { tab:'Mastin-Tibetano',     nombre:'Mastín tibetano',                nicho:'animales', tema:'mastín tibetano: características, precio, cuidado, alimentación, salud, temperamento', productos:['mascotas-sanas'] },
  { tab:'Vet-Bovinos',         nombre:'Vet bovinos',                    nicho:'animales', tema:'salud bovina: enfermedades, vacunas, parasitología, reproducción, nutrición de ganado', productos:['mascotas-sanas'] },
  { tab:'Geckos-Leopardo',     nombre:'Geckos leopardo',                nicho:'animales', tema:'gecko leopardo: terrario, alimentación, enfermedades, reproducción, morfo, cuidados', productos:['mascotas-sanas'] },
  { tab:'Reptiles',            nombre:'Reptiles',                       nicho:'animales', tema:'cuidado de reptiles: serpientes, iguanas, camaleones, tortugas, alimentación, terrarios', productos:['mascotas-sanas'] },
  { tab:'Guacamayos',          nombre:'Guacamayos',                     nicho:'animales', tema:'guacamayo: alimentación, enfermedades, hablar, jaula, reproducción, cuidado diario', productos:['mascotas-sanas'] },
  { tab:'Loros',               nombre:'Loros',                          nicho:'animales', tema:'loros y cotorras: enseñar a hablar, alimentación, enfermedades, jaula, comportamiento', productos:['mascotas-sanas'] },
  { tab:'Patos',               nombre:'Patos',                          nicho:'animales', tema:'patos domésticos: alimentación, cuidado, enfermedades, reproducción, estanque casero', productos:['mascotas-sanas'] },
  { tab:'Periquitos',          nombre:'Periquitos',                     nicho:'animales', tema:'periquito australiano: alimentación, enfermedades, enseñar a hablar, jaula, reproducción', productos:['mascotas-sanas'] },
  { tab:'Chinchillas',         nombre:'Chinchillas exóticas',           nicho:'animales', tema:'chinchilla: jaula, alimentación, enfermedades, baño de arena, reproducción, cuidados', productos:['mascotas-sanas'] },
  { tab:'Seguros-Mascotas',    nombre:'Seguros de mascotas',            nicho:'animales', tema:'seguros para mascotas: comparativas, coberturas, precios, recomendaciones por especie', productos:['mascotas-sanas'] },
  { tab:'Vet-LuisGarcia',      nombre:'Blog Vet Luis García',           nicho:'animales', tema:'medicina veterinaria general: diagnósticos, tratamientos, primeros auxilios, bienestar animal', productos:['mascotas-sanas'] },
  // === LEYES ===
  { tab:'Abog-BienesRaices',   nombre:'Abogados bienes raíces USA',     nicho:'leyes',    tema:'abogados inmobiliarios USA: contratos, compraventa, disputas, HOA, arrendamiento, foreclosure', productos:[] },
  { tab:'Abog-Accidente',      nombre:'Abogados accidente Orlando',     nicho:'leyes',    tema:'accidentes de auto en Orlando: compensación, seguro, abogado, negligencia, proceso legal FL', productos:[] },
  { tab:'Abog-Familia',        nombre:'Abogados familia USA',           nicho:'leyes',    tema:'derecho de familia USA: divorcio, custodia, pensión, adopción, violencia doméstica, VAWA', productos:[] },
  { tab:'Litigios',            nombre:'Litigios USA',                   nicho:'leyes',    tema:'litigios civiles USA: demandas, contratos, disputas comerciales, mediación, arbitraje', productos:[] },
  { tab:'Impuestos-USA',       nombre:'Impuestos en USA',               nicho:'leyes',    tema:'impuestos USA para hispanos: declaración, ITIN, deducciones, IRS, LLC, 1099, W-2', productos:[] },
  { tab:'Multas-Laborales',    nombre:'Multas y permisos laborales',    nicho:'leyes',    tema:'derechos laborales USA: horas extra, multas, permisos, trabajadores indocumentados, OSHA', productos:[] },
  { tab:'Abog-AccidenteUSA',   nombre:'Abogados accidente USA',         nicho:'leyes',    tema:'accidentes de auto USA: demanda, compensación, medical bills, sin seguro, abogado sin pago', productos:[] },
  // === SALUD ===
  { tab:'Hipertension',        nombre:'Hipertensión arterial',          nicho:'salud',    tema:'hipertensión: síntomas, causas, dieta, medicamentos, ejercicio, presión normal, crisis hipertensiva', productos:['101-recetas-diabeticos'] },
  { tab:'Esclerosis',          nombre:'Esclerosis múltiple',            nicho:'salud',    tema:'esclerosis múltiple: síntomas, diagnóstico, tratamientos, brotes, calidad de vida, dieta', productos:['101-recetas-diabeticos'] },
  { tab:'Baumanometros',       nombre:'Baumanómetros digitales',        nicho:'salud',    tema:'tensiómetros digitales: comparativas, calibración, uso correcto, mejor marca, error de medición', productos:[] },
  { tab:'Tensiometro',         nombre:'Tensiómetro',                    nicho:'salud',    tema:'tensiómetros de brazo y muñeca: guía de compra, precisión, uso, cómo tomar la presión', productos:[] },
  { tab:'Anti-Estres',         nombre:'Técnicas anti estrés',           nicho:'salud',    tema:'estrés y ansiedad: técnicas de relajación, meditación, respiración, mindfulness, burnout', productos:[] }
];

const HEADERS = [
  'num_articulo','titulo','keyword','intencion','formato',
  'producto_relacionado','estado','fecha_publicacion',
  'url_publicada','fecha_generacion','notas'
];

// Colores por nicho
const COLORS = {
  animales: { header: '#1a7a4a', light: '#eafaf1', text: '#FFFFFF' },
  leyes:    { header: '#1a2a6c', light: '#eaf0fb', text: '#FFFFFF' },
  salud:    { header: '#c0392b', light: '#fdf0f0', text: '#FFFFFF' }
};

// ============================================================
// PASO 1: CREAR TODAS LAS PESTAÑAS CON ENCABEZADOS
// Ejecuta esta función primero (tarda ~30 segundos)
// ============================================================
function paso1_crearPestanas() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const existingSheets = ss.getSheets().map(s => s.getName());

  let creados = 0;
  let existentes = 0;

  BLOGS.forEach(blog => {
    let sheet = ss.getSheetByName(blog.tab);

    if (!sheet) {
      sheet = ss.insertSheet(blog.tab);
      creados++;
    } else {
      existentes++;
    }

    // Configurar encabezados si la hoja está vacía
    if (sheet.getLastRow() === 0) {
      _configurarPestana(sheet, blog);
    }
  });

  SpreadsheetApp.flush();

  const msg = `✅ Completado:\n• Pestañas creadas: ${creados}\n• Ya existían: ${existentes}\n\nAhora ejecuta "paso2_generarTodosLosTemas"`;
  Logger.log(msg);
  SpreadsheetApp.getUi().alert('✅ Pestañas Creadas', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

function _configurarPestana(sheet, blog) {
  const color = COLORS[blog.nicho] || COLORS.animales;

  // Escribir encabezados
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);

  // Formato del encabezado
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setBackground(color.header)
             .setFontColor(color.text)
             .setFontWeight('bold')
             .setFontSize(10);

  // Congelar la fila de encabezado
  sheet.setFrozenRows(1);

  // Anchos de columnas
  sheet.setColumnWidth(1, 60);   // num_articulo
  sheet.setColumnWidth(2, 400);  // titulo
  sheet.setColumnWidth(3, 200);  // keyword
  sheet.setColumnWidth(4, 100);  // intencion
  sheet.setColumnWidth(5, 100);  // formato
  sheet.setColumnWidth(6, 150);  // producto_relacionado
  sheet.setColumnWidth(7, 80);   // estado
  sheet.setColumnWidth(8, 180);  // fecha_publicacion
  sheet.setColumnWidth(9, 300);  // url_publicada
  sheet.setColumnWidth(10, 150); // fecha_generacion
  sheet.setColumnWidth(11, 200); // notas

  // Nombre del blog como nota en A1
  sheet.getRange('A1').setNote(`Blog: ${blog.nombre}\nNicho: ${blog.nicho}\nMeta: ${TEMAS_POR_BLOG} artículos`);
}

// ============================================================
// PASO 2: GENERAR TEMAS PARA TODOS LOS BLOGS
// ADVERTENCIA: Tarda ~15-20 minutos (usa DeepSeek API)
// Puedes también ejecutar "generarTemasBlog" individualmente
// ============================================================
function paso2_generarTodosLosTemas() {
  const ss = SpreadsheetApp.openById(SHEET_ID);

  for (const blog of BLOGS) {
    const sheet = ss.getSheetByName(blog.tab);
    if (!sheet) {
      Logger.log(`⚠️ Pestaña no encontrada: ${blog.tab} - ejecuta paso1 primero`);
      continue;
    }

    const temasExistentes = Math.max(0, sheet.getLastRow() - 1);
    if (temasExistentes >= TEMAS_POR_BLOG) {
      Logger.log(`✓ ${blog.nombre}: ya tiene ${temasExistentes} temas`);
      continue;
    }

    Logger.log(`▶ Generando temas para: ${blog.nombre} (${temasExistentes}/${TEMAS_POR_BLOG})`);

    let offset = temasExistentes;
    while (offset < TEMAS_POR_BLOG) {
      const cantidad = Math.min(LOTE_DEEPSEEK, TEMAS_POR_BLOG - offset);
      const temas = _llamarDeepSeek(blog, offset, cantidad);

      if (temas.length === 0) {
        Logger.log(`❌ Error generando lote offset=${offset} para ${blog.nombre}`);
        Utilities.sleep(3000);
        continue;
      }

      _escribirTemasEnSheet(sheet, temas, offset, blog);
      offset += temas.length;

      Logger.log(`  ✓ ${blog.nombre}: ${offset}/${TEMAS_POR_BLOG} temas`);
      Utilities.sleep(1500); // Pausa para no superar rate limit de DeepSeek
    }
  }

  SpreadsheetApp.getUi().alert('🎉 ¡Completado!', `Se generaron los temas para ${BLOGS.length} blogs en Google Sheets.`, SpreadsheetApp.getUi().ButtonSet.OK);
}

// ============================================================
// GENERAR TEMAS PARA UN SOLO BLOG (útil para pruebas)
// Cambia el índice para elegir el blog (0 = primero)
// ============================================================
function generarTemasUnBlog() {
  const BLOG_INDEX = 0; // ← Cambia el índice del blog aquí
  const blog = BLOGS[BLOG_INDEX];
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(blog.tab);

  if (!sheet) {
    SpreadsheetApp.getUi().alert('Error', `Pestaña "${blog.tab}" no encontrada. Ejecuta paso1_crearPestanas primero.`, SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  const temasExistentes = Math.max(0, sheet.getLastRow() - 1);
  Logger.log(`Generando para: ${blog.nombre} | Existentes: ${temasExistentes}`);

  // Generar solo 1 lote (50 temas) como prueba
  const temas = _llamarDeepSeek(blog, temasExistentes, 50);
  if (temas.length > 0) {
    _escribirTemasEnSheet(sheet, temas, temasExistentes, blog);
    SpreadsheetApp.getUi().alert('✅', `Se generaron ${temas.length} temas para "${blog.nombre}"`, SpreadsheetApp.getUi().ButtonSet.OK);
  } else {
    SpreadsheetApp.getUi().alert('❌ Error', 'No se pudieron generar temas. Verifica la API key de DeepSeek.', SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// ============================================================
// FUNCIÓN INTERNA: Llamar a DeepSeek API
// ============================================================
function _llamarDeepSeek(blog, offset, cantidad) {
  const INTERVALO_MS = (60 * 24 * 60 * 60 * 1000) / TEMAS_POR_BLOG; // ~57.6 min
  const fechaInicio = new Date();
  fechaInicio.setDate(fechaInicio.getDate() + 1);
  fechaInicio.setHours(8, 0, 0, 0);

  const prompt = `Blog: "${blog.nombre}". Nicho: ${blog.nicho}. Tema central: ${blog.tema}.

Genera exactamente ${cantidad} títulos de artículos SEO únicos para este blog (artículos ${offset + 1} a ${offset + cantidad} de un total de ${TEMAS_POR_BLOG}).

REGLAS OBLIGATORIAS:
1. Keywords de cola larga muy específicas (3-5 palabras)
2. Intención: 80% comercial/transaccional + 20% informacional
3. Para blogs de mascotas usa la fórmula: síntoma + especie + solución/pregunta
4. Para blogs de leyes: situación específica + ubicación/estado + solución
5. Sin repetir temas del mismo lote
6. Varía formatos: preguntas, listas, guías, comparativas, "cómo...", "qué es...", "cuándo..."
7. Incluye el año 2025/2026 en algunos títulos para freshness

Responde SOLO con JSON válido (sin markdown):
{"temas":[{"titulo":"...","keyword":"...","intencion":"comercial","formato":"guia","producto_relacionado":"${blog.productos[0] || ''}"}]}`;

  const payload = {
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: 'Eres experto en SEO de contenidos en español. Generas títulos de artículos únicos y específicos para blogs de nicho. Respondes SIEMPRE en JSON válido sin markdown ni texto adicional.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 4000,
    temperature: 0.9
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch('https://api.deepseek.com/chat/completions', options);
    const code = response.getResponseCode();

    if (code !== 200) {
      Logger.log(`❌ DeepSeek HTTP ${code}: ${response.getContentText().substring(0, 200)}`);
      return [];
    }

    let rawContent = JSON.parse(response.getContentText()).choices[0].message.content;
    rawContent = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const data = JSON.parse(rawContent);
    const temas = data.temas || [];

    // Calcular fechas de publicación escalonadas
    return temas.map((t, idx) => {
      const numArticulo = offset + idx;
      const fechaPub = new Date(fechaInicio.getTime() + (numArticulo * INTERVALO_MS));
      return {
        num_articulo:        numArticulo + 1,
        titulo:              t.titulo || '',
        keyword:             t.keyword || '',
        intencion:           t.intencion || 'informacional',
        formato:             t.formato || 'guia',
        producto_relacionado: t.producto_relacionado || (blog.productos[0] || ''),
        estado:              'pendiente',
        fecha_publicacion:   fechaPub.toISOString(),
        url_publicada:       '',
        fecha_generacion:    '',
        notas:               ''
      };
    });

  } catch (e) {
    Logger.log(`❌ Error llamando a DeepSeek: ${e.message}`);
    return [];
  }
}

// ============================================================
// FUNCIÓN INTERNA: Escribir temas en la pestaña del Sheet
// ============================================================
function _escribirTemasEnSheet(sheet, temas, offset, blog) {
  if (temas.length === 0) return;

  const color = COLORS[blog.nicho] || COLORS.animales;
  const startRow = offset + 2; // +1 por header, +1 por índice base 1

  const rows = temas.map(t => HEADERS.map(h => t[h] || ''));
  sheet.getRange(startRow, 1, rows.length, HEADERS.length).setValues(rows);

  // Colorear filas alternadas
  for (let i = 0; i < rows.length; i++) {
    if (i % 2 === 0) {
      sheet.getRange(startRow + i, 1, 1, HEADERS.length)
           .setBackground(color.light);
    }
  }

  SpreadsheetApp.flush();
}

// ============================================================
// UTILIDAD: Ver el estado actual de todos los blogs
// ============================================================
function verEstado() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let informe = '📊 ESTADO DEL SHEET\n\n';

  BLOGS.forEach(blog => {
    const sheet = ss.getSheetByName(blog.tab);
    if (!sheet) {
      informe += `❌ ${blog.nombre}: pestaña no existe\n`;
      return;
    }
    const total = Math.max(0, sheet.getLastRow() - 1);
    const pct = Math.round((total / TEMAS_POR_BLOG) * 100);
    informe += `${pct >= 100 ? '✅' : '🔄'} ${blog.nombre}: ${total}/${TEMAS_POR_BLOG} (${pct}%)\n`;
  });

  Logger.log(informe);
  SpreadsheetApp.getUi().alert('Estado', informe, SpreadsheetApp.getUi().ButtonSet.OK);
}

// ============================================================
// UTILIDAD: Limpiar pestaña de un blog (para re-generar)
// ============================================================
function limpiarBlog() {
  const BLOG_INDEX = 0; // ← Cambia el índice
  const blog = BLOGS[BLOG_INDEX];
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(blog.tab);
  if (!sheet) return;

  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, HEADERS.length).clearContent();
  }
  Logger.log(`🧹 Limpiado: ${blog.nombre}`);
}

// ============================================================
// MENÚ PERSONALIZADO EN EL SHEET
// ============================================================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🏭 Blog Factory')
    .addItem('Paso 1: Crear Pestañas', 'paso1_crearPestanas')
    .addSeparator()
    .addItem('Paso 2: Generar Todos los Temas (DeepSeek)', 'paso2_generarTodosLosTemas')
    .addItem('Generar Temas — 1 Blog de Prueba', 'generarTemasUnBlog')
    .addSeparator()
    .addItem('Ver Estado de los Blogs', 'verEstado')
    .addToUi();
}
