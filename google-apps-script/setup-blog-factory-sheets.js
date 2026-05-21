/**
 * ============================================================
 * BLOG FACTORY — Google Apps Script v2
 * Sheet ID: 14NYqDn77J9nsTjD8ZsvxzDe1lggNwmC6kUZcE3LNbJI
 *
 * Este script crea las pestañas FALTANTES y genera los temas
 * usando DeepSeek AI con la misma estructura de 36 columnas
 * que ya tienen las pestañas BOV, HUR, ORL, FAM, REA, FASE1.
 *
 * INSTRUCCIONES:
 * 1. Abre tu Google Sheet
 * 2. Extensiones → Apps Script
 * 3. Pega este código
 * 4. Cambia DEEPSEEK_API_KEY por tu clave real
 * 5. Guarda (Ctrl+S)
 * 6. Ejecuta "paso1_crearPestanasFaltantes"
 * 7. Ejecuta "paso2_generarTodosLosTemas"
 * ============================================================
 */

// ⚠️ PON TU CLAVE DE DEEPSEEK AQUÍ
const DEEPSEEK_API_KEY = 'sk-PEGA_TU_CLAVE_DEEPSEEK_AQUI';

const SHEET_ID    = '14NYqDn77J9nsTjD8ZsvxzDe1lggNwmC6kUZcE3LNbJI';
const TEMAS_META  = 1500;   // meta de artículos por blog
const LOTE_SIZE   = 50;     // temas por llamada a DeepSeek

// ============================================================
// COLUMNAS EXACTAS (igual que BOV, HUR, ORL, FAM, REA)
// ============================================================
const HEADERS = [
  'ID_UNICO','TITULO','KEYWORD_PRINCIPAL','KEYWORD','CLUSTER','PILAR',
  'PRIORIDAD','ESTADO','PUBLICADO','BLOGGER_POST_ID','BLOGGER_URL',
  'URL_FINAL','POST_STATUS','SCHEDULED_AT','LOCK_TIMESTAMP',
  'EXECUTION_ID','RETRY_COUNT','LAST_ERROR','UPDATED_AT',
  'kind','id','status','blog','published','updated','url','selfLink',
  'title','content','author','replies','labels','readerComments',
  'LAST_PUBLICATION_CHECK','ERROR','DEBUG'
];

// ============================================================
// BLOGS FALTANTES — Solo los que NO tienen pestaña aún
// (BOV, HUR, ORL, FAM, REA, FASE1 ya existen)
// ============================================================
const BLOGS_FALTANTES = [
  // === ANIMALES ===
  {
    tab:'PER-Alimentacion', prefix:'PER', nombre:'Alimentación para perros', blogId:'6910813708926842116', nicho:'animales',
    tema:'alimentación natural para perros, dieta BARF, recetas caseras, nutrición canina, alimentos prohibidos',
    clusters:['dieta-barf','alimentacion-natural','alimentos-toxicos','recetas-caseras','nutricion-cachorros','suplementos-caninos'],
    pilar:'guia-alimentacion-natural-perros'
  },
  {
    tab:'GAT-Alimentacion', prefix:'GAT', nombre:'Alimentación para gatos', blogId:'6617865557052467517', nicho:'animales',
    tema:'alimentación natural para gatos, dieta cruda felina, recetas caseras gatos, alimentos peligrosos para gatos',
    clusters:['dieta-felina','alimentos-toxicos-gatos','recetas-caseras-gatos','nutricion-gatitos','alimentacion-natural'],
    pilar:'guia-alimentacion-natural-gatos'
  },
  {
    tab:'BUL-Bulldogs', prefix:'BUL', nombre:'Bulldogs Vet', blogId:'7132652999311318625', nicho:'animales',
    tema:'bulldog inglés y francés: salud, problemas respiratorios, alimentación, enfermedades, reproducción, cuidados',
    clusters:['salud-bulldog','adiestramiento','alimentacion-bulldog','enfermedades-comunes','reproduccion-bulldog','cachorro-bulldog'],
    pilar:'guia-cuidado-bulldog'
  },
  {
    tab:'PAS-PastorAleman', prefix:'PAS', nombre:'Pastor alemán', blogId:'7273203559821314231', nicho:'animales',
    tema:'pastor alemán: adiestramiento, displasia de cadera, enfermedades, alimentación, cachorro, temperamento y carácter',
    clusters:['adiestramiento-pastor','salud-pastor-aleman','alimentacion','displasia-cadera','cachorro-pastor','comportamiento'],
    pilar:'guia-pastor-aleman'
  },
  {
    tab:'RAZ-RazasPerro', prefix:'RAZ', nombre:'Razas de perro', blogId:'7970072706943429023', nicho:'animales',
    tema:'comparativa de razas de perros: características, temperamento, cuidados, tamaño, enfermedades específicas por raza',
    clusters:['razas-pequenas','razas-grandes','razas-medianas','razas-hipoalergenicas','razas-guardia','razas-familia'],
    pilar:'directorio-razas-perros'
  },
  {
    tab:'MAS-MastinTibetano', prefix:'MAS', nombre:'Mastín tibetano', blogId:'1030958178929697769', nicho:'animales',
    tema:'mastín tibetano: características, precio, alimentación, cuidado, salud, temperamento, cachorro',
    clusters:['caracteristicas-mastin','salud-mastin','alimentacion-mastin','adiestramiento','precio-mastin','cachorro-mastin'],
    pilar:'guia-mastin-tibetano'
  },
  {
    tab:'GEK-Geckos', prefix:'GEK', nombre:'Geckos leopardo', blogId:'7061935825690274620', nicho:'animales',
    tema:'gecko leopardo: terrario, alimentación, enfermedades, reproducción, morfo, temperatura, humedad, cuidados',
    clusters:['terrario-gecko','alimentacion-gecko','enfermedades-gecko','reproduccion-gecko','morphs-gecko','mantenimiento'],
    pilar:'guia-gecko-leopardo'
  },
  {
    tab:'REP-Reptiles', prefix:'REP', nombre:'Reptiles', blogId:'5870777650335706589', nicho:'animales',
    tema:'cuidado de reptiles: serpientes, iguanas, camaleones, tortugas, alimentación, terrarios, enfermedades',
    clusters:['serpientes','iguanas','camaleones','tortugas','alimentacion-reptiles','enfermedades-reptiles'],
    pilar:'guia-reptiles-mascotas'
  },
  {
    tab:'GUA-Guacamayos', prefix:'GUA', nombre:'Guacamayos', blogId:'2381883842356306082', nicho:'animales',
    tema:'guacamayos: alimentación, enfermedades, enseñar a hablar, jaula, reproducción, cuidado diario, plumas',
    clusters:['alimentacion-guacamayo','enfermedades-guacamayo','hablar','jaula-guacamayo','reproduccion','cuidado-diario'],
    pilar:'guia-cuidado-guacamayos'
  },
  {
    tab:'LOR-Loros', prefix:'LOR', nombre:'Loros', blogId:'932323301748607096', nicho:'animales',
    tema:'loros y cotorras: enseñar a hablar, alimentación, enfermedades, jaula, comportamiento, reproducción',
    clusters:['loros-cotorras','ensenar-hablar','alimentacion-loro','enfermedades-loro','jaula','comportamiento-loro'],
    pilar:'guia-cuidado-loros'
  },
  {
    tab:'PAT-Patos', prefix:'PAT', nombre:'Patos', blogId:'8117586046258831070', nicho:'animales',
    tema:'patos domésticos: alimentación, cuidado, enfermedades, reproducción, estanque casero, crianza',
    clusters:['patos-domesticos','alimentacion-patos','enfermedades-patos','reproduccion-patos','estanque-casero','crianza'],
    pilar:'guia-cuidado-patos'
  },
  {
    tab:'PEQ-Periquitos', prefix:'PEQ', nombre:'Periquitos', blogId:'5154298280010659457', nicho:'animales',
    tema:'periquito australiano: alimentación, enfermedades, enseñar a hablar, jaula, reproducción, cuidados diarios',
    clusters:['alimentacion-periquito','enfermedades-periquito','ensenar-hablar','jaula-periquito','reproduccion','cuidados'],
    pilar:'guia-periquito-australiano'
  },
  {
    tab:'CHI-Chinchillas', prefix:'CHI', nombre:'Chinchillas exóticas', blogId:'1437877554925595070', nicho:'animales',
    tema:'chinchilla como mascota: jaula, alimentación, baño de arena, enfermedades, reproducción, cuidados',
    clusters:['jaula-chinchilla','alimentacion-chinchilla','bano-arena','enfermedades','reproduccion','cuidados-diarios'],
    pilar:'guia-cuidado-chinchillas'
  },
  {
    tab:'SEG-SegurosM', prefix:'SEG', nombre:'Seguros de mascotas', blogId:'1287626644093713914', nicho:'animales',
    tema:'seguros para mascotas: comparativas, coberturas, precios, recomendaciones por especie, qué cubre y qué no',
    clusters:['seguros-perros','seguros-gatos','comparativas-seguros','coberturas','precios','recomendaciones'],
    pilar:'guia-seguros-mascotas'
  },
  {
    tab:'VET-LuisGarcia', prefix:'VET', nombre:'Blog Vet Luis García', blogId:'2772493032989228627', nicho:'animales',
    tema:'medicina veterinaria: diagnósticos, síntomas, tratamientos, primeros auxilios, bienestar animal, emergencias',
    clusters:['primeros-auxilios','diagnosticos','enfermedades-comunes','emergencias-veterinarias','prevencion','bienestar'],
    pilar:'guia-veterinaria-general'
  },
  // === LEYES ===
  {
    tab:'LIT-Litigios', prefix:'LIT', nombre:'Litigios USA', blogId:'3388695765945711848', nicho:'leyes',
    tema:'litigios civiles USA: demandas, contratos, disputas comerciales, mediación, arbitraje, daños y perjuicios',
    clusters:['litigios-civiles','contratos','disputas-comerciales','mediacion','arbitraje','danos-perjuicios'],
    pilar:'Leads'
  },
  {
    tab:'IMP-Impuestos', prefix:'IMP', nombre:'Impuestos en USA', blogId:'1977134253598268505', nicho:'leyes',
    tema:'impuestos USA para hispanos: declaración, ITIN, deducciones, IRS, LLC, 1099, W-2, extensiones, multas IRS',
    clusters:['declaracion-impuestos','ITIN','deducciones','LLC-impuestos','IRS-multas','tax-return'],
    pilar:'AdSense — Alto CPC (Finanzas/Impuestos)'
  },
  {
    tab:'MUL-Laborales', prefix:'MUL', nombre:'Multas y permisos laborales', blogId:'7904190967942615231', nicho:'leyes',
    tema:'derechos laborales USA: horas extra, multas empleador, permisos, trabajadores indocumentados, OSHA, FLSA',
    clusters:['derechos-laborales','horas-extra','multas-empleador','trabajadores-inmigrantes','OSHA','FLSA'],
    pilar:'Leads'
  },
  {
    tab:'ACC-AccidenteUSA', prefix:'ACC', nombre:'Abogados accidente USA', blogId:'4771412328831507137', nicho:'leyes',
    tema:'abogados accidentes auto USA: compensación, seguro, negligencia, proceso legal, sin pago hasta ganar',
    clusters:['accidentes-auto','compensacion','seguro-accidente','negligencia-medica','proceso-legal','demanda'],
    pilar:'Leads'
  },
  // === SALUD ===
  {
    tab:'HIP-Hipertension', prefix:'HIP', nombre:'Hipertensión arterial', blogId:'6257184429407355034', nicho:'salud',
    tema:'hipertensión arterial: síntomas, causas, medicamentos, dieta, ejercicio, cifras normales, crisis hipertensiva',
    clusters:['sintomas-hipertension','dieta-hipertension','medicamentos','ejercicio','cifras-presion','crisis-hipertensiva'],
    pilar:'guia-hipertension-arterial'
  },
  {
    tab:'ESC-Esclerosis', prefix:'ESC', nombre:'Esclerosis múltiple', blogId:'2524001519825376565', nicho:'salud',
    tema:'esclerosis múltiple: síntomas, diagnóstico, tipos, tratamientos, brotes, vida cotidiana, dieta',
    clusters:['sintomas-EM','diagnostico','tipos-esclerosis','tratamientos','brotes','vida-con-EM'],
    pilar:'guia-esclerosis-multiple'
  },
  {
    tab:'BAU-Baumanometros', prefix:'BAU', nombre:'Baumanómetros digitales', blogId:'8052591155706275029', nicho:'salud',
    tema:'baumanómetros y tensiómetros digitales: comparativas, cómo usar, marcas, calibración, error de medición',
    clusters:['comparativas','como-usar','mejores-marcas','calibracion','tension-arterial','recomendaciones'],
    pilar:'guia-baumanometros-digitales'
  },
  {
    tab:'TEN-Tensiometro', prefix:'TEN', nombre:'Tensiómetro', blogId:'7021059855008053005', nicho:'salud',
    tema:'tensiómetros de brazo y muñeca: guías de compra, precisión, uso correcto, cómo tomar la presión en casa',
    clusters:['tensiometro-brazo','tensiometro-muneca','como-tomar-presion','precision','guia-compra','uso-correcto'],
    pilar:'guia-tensiometros'
  },
  {
    tab:'ANT-Estres', prefix:'ANT', nombre:'Técnicas anti estrés', blogId:'5549247981721112976', nicho:'salud',
    tema:'manejo del estrés y ansiedad: meditación, respiración, mindfulness, burnout, técnicas de relajación, yoga',
    clusters:['meditacion','respiracion','mindfulness','burnout','relajacion','yoga-estres'],
    pilar:'guia-antistres'
  }
];

// ============================================================
// COLORES POR NICHO (igual que las pestañas existentes)
// ============================================================
const COLORES = {
  animales: { header:'#1a7a4a', alt:'#e8f8f0', font:'#FFFFFF' },
  leyes:    { header:'#1a2a6c', alt:'#eaf0fb', font:'#FFFFFF' },
  salud:    { header:'#c0392b', alt:'#fdf0f0', font:'#FFFFFF' }
};

// ============================================================
// PASO 1 — CREAR PESTAÑAS FALTANTES
// Tarda ~20 segundos. Ejecuta esto primero.
// ============================================================
function paso1_crearPestanasFaltantes() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const existingNames = ss.getSheets().map(s => s.getName());

  let creadas = 0;
  let omitidas = 0;

  BLOGS_FALTANTES.forEach(blog => {
    if (existingNames.includes(blog.tab)) {
      omitidas++;
      return;
    }
    const sheet = ss.insertSheet(blog.tab);
    _configurarPestana(sheet, blog);
    creadas++;
    Logger.log(`✅ Creada: ${blog.tab}`);
  });

  SpreadsheetApp.flush();

  const msg = `✅ Listo:\n• Pestañas nuevas: ${creadas}\n• Ya existían (omitidas): ${omitidas}\n\nTotal blogs ahora: ${ss.getSheets().length} pestañas\n\nAhora ejecuta "paso2_generarTodosLosTemas"`;
  Logger.log(msg);
  SpreadsheetApp.getUi().alert('✅ Pestañas Creadas', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

function _configurarPestana(sheet, blog) {
  const c = COLORES[blog.nicho] || COLORES.animales;

  // Escribir encabezados (exactamente iguales a las pestañas existentes)
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);

  // Formato visual del encabezado
  const hr = sheet.getRange(1, 1, 1, HEADERS.length);
  hr.setBackground(c.header)
    .setFontColor(c.font)
    .setFontWeight('bold')
    .setFontSize(9)
    .setFontFamily('Arial');

  // Congelar fila 1
  sheet.setFrozenRows(1);

  // Anchos de columnas clave
  sheet.setColumnWidth(1, 110);   // ID_UNICO
  sheet.setColumnWidth(2, 420);   // TITULO
  sheet.setColumnWidth(3, 200);   // KEYWORD_PRINCIPAL
  sheet.setColumnWidth(4, 200);   // KEYWORD
  sheet.setColumnWidth(5, 160);   // CLUSTER
  sheet.setColumnWidth(6, 160);   // PILAR
  sheet.setColumnWidth(7, 70);    // PRIORIDAD
  sheet.setColumnWidth(8, 100);   // ESTADO
  sheet.setColumnWidth(9, 80);    // PUBLICADO

  // Nota descriptiva en la celda A1
  sheet.getRange('A1').setNote(
    `Blog: ${blog.nombre}\nID Blogger: ${blog.blogId}\nNicho: ${blog.nicho}\nMeta: ${TEMAS_META} artículos`
  );
}

// ============================================================
// PASO 2 — GENERAR TEMAS PARA TODOS LOS BLOGS FALTANTES
// Llama a DeepSeek AI. Tarda ~20-30 min para todos los blogs.
// Puedes pausarlo y reanudarlo — detecta cuántos ya tiene.
// ============================================================
function paso2_generarTodosLosTemas() {
  const ss = SpreadsheetApp.openById(SHEET_ID);

  for (const blog of BLOGS_FALTANTES) {
    const sheet = ss.getSheetByName(blog.tab);
    if (!sheet) {
      Logger.log(`⚠️ Pestaña no encontrada: ${blog.tab} — ejecuta paso1 primero`);
      continue;
    }

    const existentes = Math.max(0, sheet.getLastRow() - 1);
    if (existentes >= TEMAS_META) {
      Logger.log(`✓ ${blog.nombre}: ya tiene ${existentes} temas`);
      continue;
    }

    Logger.log(`▶ Generando: ${blog.nombre} (${existentes}/${TEMAS_META})`);

    let offset = existentes;
    let erroresConsecutivos = 0;

    while (offset < TEMAS_META) {
      const cantidad = Math.min(LOTE_SIZE, TEMAS_META - offset);
      const temas = _llamarDeepSeek(blog, offset, cantidad);

      if (temas.length === 0) {
        erroresConsecutivos++;
        Logger.log(`⚠️ Error lote offset=${offset} (${erroresConsecutivos} consecutivos)`);
        if (erroresConsecutivos >= 3) {
          Logger.log(`❌ Demasiados errores en ${blog.nombre}, saltando al siguiente blog`);
          break;
        }
        Utilities.sleep(5000);
        continue;
      }

      erroresConsecutivos = 0;
      _escribirFilas(sheet, temas, blog);
      offset += temas.length;

      Logger.log(`  ✓ ${blog.nombre}: ${offset}/${TEMAS_META}`);
      Utilities.sleep(1500); // Respetar rate limit de DeepSeek
    }
  }

  SpreadsheetApp.getUi().alert(
    '🎉 Completado',
    `Se generaron los temas para ${BLOGS_FALTANTES.length} blogs.\nRevisa cada pestaña para verificar.`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

// ============================================================
// GENERAR TEMAS PARA UN SOLO BLOG (prueba rápida)
// Cambia BLOG_INDEX según el blog que quieras probar (0 = primero)
// ============================================================
function generarTemasUnBlog() {
  const BLOG_INDEX = 0; // ← Cambia este número
  const blog = BLOGS_FALTANTES[BLOG_INDEX];
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(blog.tab);

  if (!sheet) {
    SpreadsheetApp.getUi().alert('Error', `Ejecuta paso1_crearPestanasFaltantes primero.`, SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  const existentes = Math.max(0, sheet.getLastRow() - 1);
  const temas = _llamarDeepSeek(blog, existentes, 50);

  if (temas.length > 0) {
    _escribirFilas(sheet, temas, blog);
    SpreadsheetApp.getUi().alert('✅', `${temas.length} temas generados para "${blog.nombre}"`, SpreadsheetApp.getUi().ButtonSet.OK);
  } else {
    SpreadsheetApp.getUi().alert('❌ Error', 'No se pudo conectar con DeepSeek. Verifica tu API key en la línea 20.', SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// ============================================================
// FUNCIÓN INTERNA: Llamar a DeepSeek y obtener temas
// ============================================================
function _llamarDeepSeek(blog, offset, cantidad) {
  const clusterActual = blog.clusters[Math.floor(offset / (TEMAS_META / blog.clusters.length)) % blog.clusters.length];

  const prompt = `Blog: "${blog.nombre}" (nicho: ${blog.nicho}). Tema: ${blog.tema}.

Genera exactamente ${cantidad} artículos SEO para el cluster "${clusterActual}" (artículos ${offset+1}–${offset+cantidad} de ${TEMAS_META}).

REGLAS ESTRICTAS:
1. Títulos con fórmula emocional: [Situación/Síntoma] + [Especie/Contexto] + [Solución/Urgencia]
2. Keywords de cola larga (3-5 palabras), baja competencia
3. 80% intención comercial o transaccional + 20% informacional
4. Sin repetir temas anteriores — varía por ángulo, especie, síntoma o geografía
5. Para animales: incluye síntoma específico, especie o raza, acción concreta
6. Para leyes: incluye situación legal específica, estado USA, tipo de cliente hispano
7. Para salud: incluye síntoma + condición + acción práctica

Responde SOLO con JSON válido (sin markdown, sin texto extra):
{"temas":[{"titulo":"...","keyword":"...","cluster":"${clusterActual}","pilar":"${blog.pilar}","intencion":"comercial"}]}`;

  const payload = {
    model: 'deepseek-chat',
    messages: [
      { role:'system', content:'Eres experto en SEO de contenidos en español. Generas títulos de artículos únicos, específicos y altamente clickeables. Respondes siempre en JSON válido sin markdown.' },
      { role:'user', content: prompt }
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
    const resp = UrlFetchApp.fetch('https://api.deepseek.com/chat/completions', options);
    if (resp.getResponseCode() !== 200) {
      Logger.log(`❌ DeepSeek error ${resp.getResponseCode()}: ${resp.getContentText().slice(0,300)}`);
      return [];
    }

    let raw = JSON.parse(resp.getContentText()).choices[0].message.content;
    raw = raw.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
    const data = JSON.parse(raw);
    const temas = data.temas || [];

    // Intervalo de publicación: 1500 artículos en 60 días = ~57.6 min
    const INTERVALO_MS = (60 * 24 * 60 * 60 * 1000) / TEMAS_META;
    const inicio = new Date();
    inicio.setDate(inicio.getDate() + 1);
    inicio.setHours(8, 0, 0, 0);

    return temas.map((t, idx) => {
      const num = offset + idx + 1;
      const fechaPub = new Date(inicio.getTime() + ((offset + idx) * INTERVALO_MS));
      return {
        ID_UNICO:        `${blog.prefix}-${String(num).padStart(4,'0')}`,
        TITULO:          t.titulo || '',
        KEYWORD_PRINCIPAL: t.keyword || '',
        KEYWORD:         t.keyword || '',
        CLUSTER:         t.cluster || clusterActual,
        PILAR:           t.pilar || blog.pilar,
        PRIORIDAD:       num,
        ESTADO:          'READY',
        PUBLICADO:       'NO',
        BLOGGER_POST_ID: '',
        BLOGGER_URL:     '',
        URL_FINAL:       '',
        POST_STATUS:     '',
        SCHEDULED_AT:    fechaPub.toISOString(),
        LOCK_TIMESTAMP:  '',
        EXECUTION_ID:    '',
        RETRY_COUNT:     0,
        LAST_ERROR:      '',
        UPDATED_AT:      '',
        kind:'', id:'', status:'', blog:'', published:'', updated:'', url:'', selfLink:'',
        title:'', content:'', author:'', replies:'', labels:'', readerComments:'',
        LAST_PUBLICATION_CHECK:'', ERROR:'', DEBUG:''
      };
    });

  } catch(e) {
    Logger.log(`❌ Excepción: ${e.message}`);
    return [];
  }
}

// ============================================================
// FUNCIÓN INTERNA: Escribir filas en el sheet
// ============================================================
function _escribirFilas(sheet, temas, blog) {
  if (!temas.length) return;
  const c = COLORES[blog.nicho] || COLORES.animales;
  const startRow = sheet.getLastRow() + 1;
  const rows = temas.map(t => HEADERS.map(h => t[h] !== undefined ? t[h] : ''));
  sheet.getRange(startRow, 1, rows.length, HEADERS.length).setValues(rows);

  // Filas alternas con color suave
  for (let i = 0; i < rows.length; i++) {
    if (i % 2 === 0) {
      sheet.getRange(startRow + i, 1, 1, HEADERS.length).setBackground(c.alt);
    }
  }
  SpreadsheetApp.flush();
}

// ============================================================
// ESTADO GENERAL — Ver progreso de todos los blogs
// ============================================================
function verEstado() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const allSheets = ss.getSheets();
  let informe = `📊 ESTADO DEL SHEET (${allSheets.length} pestañas)\n\n`;
  informe += `=== EXISTENTES ===\n`;

  const tabsFaltantes = BLOGS_FALTANTES.map(b => b.tab);
  allSheets.forEach(s => {
    const nombre = s.getName();
    const total = Math.max(0, s.getLastRow() - 1);
    if (!tabsFaltantes.includes(nombre)) {
      informe += `✅ ${nombre}: ${total} artículos (sistema anterior)\n`;
    }
  });

  informe += `\n=== BLOGS NUEVOS ===\n`;
  BLOGS_FALTANTES.forEach(blog => {
    const sheet = ss.getSheetByName(blog.tab);
    if (!sheet) {
      informe += `❌ ${blog.nombre}: pestaña no creada\n`;
      return;
    }
    const total = Math.max(0, sheet.getLastRow() - 1);
    const pct = Math.round((total / TEMAS_META) * 100);
    const icon = pct >= 100 ? '✅' : (pct > 0 ? '🔄' : '⬜');
    informe += `${icon} ${blog.nombre}: ${total}/${TEMAS_META} (${pct}%)\n`;
  });

  Logger.log(informe);
  SpreadsheetApp.getUi().alert('Estado', informe, SpreadsheetApp.getUi().ButtonSet.OK);
}

// ============================================================
// MENÚ PERSONALIZADO
// ============================================================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🏭 Blog Factory')
    .addItem('Paso 1 — Crear Pestañas Faltantes', 'paso1_crearPestanasFaltantes')
    .addSeparator()
    .addItem('Paso 2 — Generar Temas (Todos los Blogs)', 'paso2_generarTodosLosTemas')
    .addItem('Generar Temas — 1 Blog de Prueba', 'generarTemasUnBlog')
    .addSeparator()
    .addItem('Ver Estado General', 'verEstado')
    .addToUi();
}
