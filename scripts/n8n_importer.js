/**
 * n8n_importer.js
 * Ejecutar DENTRO del contenedor n8n via:
 *   docker exec -e N8N_API_KEY=KEY CONTAINER node /tmp/n8n_importer.js
 */
'use strict';
const http = require('http');
const fs   = require('fs');
const path = require('path');

const API_KEY   = process.env.N8N_API_KEY || '';
const BASE_DIR  = process.env.WF_DIR      || '/tmp/n8n_bootstrap';
const BOT_TOKEN = process.env.BOT_TOKEN   || '';
const CHAT_ID   = process.env.CHAT_ID     || '';

if (!API_KEY) { console.error('ERROR: N8N_API_KEY no definida'); process.exit(1); }

// ── Solo los campos que n8n API v1 acepta en POST/PUT ──────────────────────────
// Cualquier campo extra causa: "request/body must NOT have additional properties"
const VALID_SETTINGS = new Set([
  'executionOrder', 'saveManualExecutions', 'callerPolicy',
  'executionTimeout', 'timezone', 'saveDataSuccessExecution',
  'saveDataErrorExecution'
]);

function sanitizeForApi(wf) {
  const rawSettings = wf.settings || {};
  const settings = {};
  for (const [k, v] of Object.entries(rawSettings)) {
    if (VALID_SETTINGS.has(k)) settings[k] = v;
  }
  const clean = {
    name:        wf.name,
    nodes:       wf.nodes       || [],
    connections: wf.connections || {},
    settings
  };
  if (wf.staticData && Object.keys(wf.staticData).length > 0) {
    clean.staticData = wf.staticData;
  }
  return clean;
}

// ── HTTP helper ────────────────────────────────────────────────────────────────
function apiCall(method, apiPath, bodyObj) {
  return new Promise((resolve) => {
    const bodyBuf = bodyObj !== undefined
      ? Buffer.from(JSON.stringify(bodyObj))
      : null;
    const req = http.request({
      hostname: 'localhost', port: 5678, path: apiPath, method,
      headers: {
        'X-N8N-API-KEY': API_KEY,
        'Content-Type':  'application/json',
        ...(bodyBuf ? { 'Content-Length': bodyBuf.length } : {})
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve({ ok: res.statusCode < 400, status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ ok: res.statusCode < 400, status: res.statusCode, body: data.slice(0, 400) });
        }
      });
    });
    req.on('error', e => resolve({ ok: false, status: 0, body: { error: e.message } }));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

// ── Telegram helper ────────────────────────────────────────────────────────────
function telegramSend(text) {
  if (!BOT_TOKEN || !CHAT_ID || CHAT_ID === '0') return Promise.resolve();
  const https = require('https');
  const body  = JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' });
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.telegram.org', port: 443, method: 'POST',
      path: `/bot${BOT_TOKEN}/sendMessage`,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, () => resolve());
    req.on('error', () => resolve());
    req.write(body); req.end();
  });
}

// ── Listar todos los workflows ─────────────────────────────────────────────────
async function getAllWorkflows() {
  const res = await apiCall('GET', '/api/v1/workflows?limit=250');
  return res.body.data || [];
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  const line = '═'.repeat(52);
  console.log(`\n${line}`);
  console.log('  N8N BOOTSTRAP IMPORTER');
  console.log(`  ${new Date().toISOString()}`);
  console.log(`${line}\n`);

  // 1. Verificar API key
  const health = await apiCall('GET', '/api/v1/workflows?limit=1');
  if (!health.ok && health.status === 401) {
    console.error('✗ API Key inválida. Genera una en n8n → Settings → API');
    process.exit(1);
  }
  if (!health.ok) {
    console.error(`✗ n8n no responde (${health.status}): ${JSON.stringify(health.body).slice(0,200)}`);
    process.exit(1);
  }
  console.log('✓ n8n API OK\n');

  // 2. Obtener workflows existentes
  const existingList = await getAllWorkflows();
  const existing = {};
  for (const w of existingList) existing[w.name] = w.id;
  console.log(`✓ Workflows existentes: ${Object.keys(existing).length}`);

  // 3. Eliminar workflows basura y deduplicar gestionados
  const TRASH_PATTERNS = [
    'TEMP_READ_PIPELINE',
    'Sheet Reset Row',
    'TEMP_UPDATE_ROW',
    '00_DEBUG',
    '99_SEED',
    'FIX_BLOG_ID',
  ];
  const MANAGED_NAMES = [
    '05_LOCK_WATCHDOG', '02_AI_CONTENT_GENERATOR', '04_BLOGGER_PUBLISHER',
    '25_TITLE_FACTORY', '06_AFFILIATE_INJECTOR', '07_MONETIZATION_INJECTOR',
    '08_TELEGRAM_BROADCASTER', '09_DIGITAL_PRODUCT_LINKER',
    '10_SOCIAL_MEDIA_DISTRIBUTOR', '15_INTERLINK_BUILDER', '01_MASTER_SCHEDULER',
  ];

  console.log('\n── LIMPIANDO WORKFLOWS BASURA Y DUPLICADOS ──');
  let deleted = 0;

  // Eliminar basura
  for (const w of existingList) {
    const isTrash = TRASH_PATTERNS.some(p => w.name.includes(p));
    if (!isTrash) continue;
    if (w.active) await apiCall('POST', `/api/v1/workflows/${w.id}/deactivate`);
    const del = await apiCall('DELETE', `/api/v1/workflows/${w.id}`);
    if (del.ok || del.status === 404) {
      console.log(`  🗑 ELIMINADO basura: ${w.name} [${w.id}]`);
      deleted++;
      delete existing[w.name];
    }
  }

  // Deduplicar: si hay múltiples con el mismo nombre gestionado, conservar el más reciente
  for (const managedName of MANAGED_NAMES) {
    const copies = existingList.filter(w => w.name === managedName);
    if (copies.length <= 1) continue;
    copies.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    for (const old of copies.slice(1)) {
      if (old.active) await apiCall('POST', `/api/v1/workflows/${old.id}/deactivate`);
      const del = await apiCall('DELETE', `/api/v1/workflows/${old.id}`);
      if (del.ok || del.status === 404) {
        console.log(`  🗑 DEDUP: ${old.name} [${old.id}] (copia antigua eliminada)`);
        deleted++;
      }
    }
    // Actualizar el mapa existing con el ID del más reciente
    existing[managedName] = copies[0].id;
  }

  if (deleted === 0) console.log('  (ningún workflow basura o duplicado encontrado)');

  // 4. Importar en orden
  const order = [
    'production/05_LOCK_WATCHDOG.json',
    'production/02_AI_CONTENT_GENERATOR.json',
    'production/04_BLOGGER_PUBLISHER.json',
    'production/25_TITLE_FACTORY.json',
    'monetization/06_AFFILIATE_INJECTOR.json',
    'monetization/07_MONETIZATION_INJECTOR.json',
    'distribution/08_TELEGRAM_BROADCASTER.json',
    'distribution/09_DIGITAL_PRODUCT_LINKER.json',
    'distribution/10_SOCIAL_MEDIA_DISTRIBUTOR.json',
    'seo/15_INTERLINK_BUILDER.json',
    'production/01_MASTER_SCHEDULER.json',
  ];

  const ids = {};
  console.log('\n── IMPORTANDO WORKFLOWS ──');

  for (const rel of order) {
    const filePath = path.join(BASE_DIR, rel);
    if (!fs.existsSync(filePath)) {
      console.log(`  SKIP (archivo no existe): ${rel}`);
      continue;
    }

    let wfObj;
    try {
      wfObj = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.log(`  ERROR leyendo ${rel}: ${e.message}`);
      continue;
    }

    const name    = wfObj.name;
    const payload = sanitizeForApi(wfObj);

    let wfId;
    if (existing[name]) {
      wfId = existing[name];
      // Desactivar antes de actualizar para evitar validación de sub-workflows
      const existingInfo = existingList.find(w => w.id === wfId);
      if (existingInfo && existingInfo.active) {
        await apiCall('POST', `/api/v1/workflows/${wfId}/deactivate`);
      }
      const res = await apiCall('PUT', `/api/v1/workflows/${wfId}`, payload);
      if (res.ok) {
        console.log(`  ✓ UPDATE: ${name} [${wfId}]`);
      } else {
        console.log(`  ✗ UPDATE FALLÓ: ${name} [${wfId}] HTTP ${res.status}`);
        console.log(`    ${JSON.stringify(res.body).slice(0, 300)}`);
        // Fallback: crear nuevo
        const res2 = await apiCall('POST', '/api/v1/workflows', payload);
        if (res2.ok) {
          wfId = res2.body.id;
          console.log(`  ✓ CREATE (fallback): ${name} [${wfId}]`);
        } else {
          console.log(`  ✗ CREATE FALLÓ: ${name} HTTP ${res2.status}: ${JSON.stringify(res2.body).slice(0,200)}`);
          continue;
        }
      }
    } else {
      const res = await apiCall('POST', '/api/v1/workflows', payload);
      if (res.ok) {
        wfId = res.body.id;
        console.log(`  ✓ CREATE: ${name} [${wfId}]`);
      } else {
        console.log(`  ✗ CREATE FALLÓ: ${name} HTTP ${res.status}: ${JSON.stringify(res.body).slice(0,250)}`);
        continue;
      }
    }

    ids[name] = wfId;
  }

  // 5. Cablear WF01 → WF02 y WF04
  console.log('\n── CABLEANDO SUB-WORKFLOWS ──');
  const wf01Name = Object.keys(ids).find(k => k.includes('01_MASTER'));
  const wf02Name = Object.keys(ids).find(k => k.includes('02_AI'));
  const wf04Name = Object.keys(ids).find(k => k.includes('04_BLOGGER'));

  if (wf01Name && wf02Name && wf04Name) {
    const wf01Id = ids[wf01Name];
    const wf02Id = ids[wf02Name];
    const wf04Id = ids[wf04Name];

    const wf01Res = await apiCall('GET', `/api/v1/workflows/${wf01Id}`);
    if (wf01Res.ok && wf01Res.body.nodes) {
      const wf01 = wf01Res.body;
      let changed = 0;

      for (const node of wf01.nodes) {
        if (node.type !== 'n8n-nodes-base.executeWorkflow') continue;
        const nm = (node.name || '').toLowerCase();
        if (!node.parameters) continue;
        const wfIdParam = node.parameters.workflowId;

        if (typeof wfIdParam === 'object' && wfIdParam !== null && '__rl' in wfIdParam) {
          if (nm.includes('02') || nm.includes('ai') || nm.includes('content')) {
            node.parameters.workflowId.value = wf02Id; changed++;
          } else if (nm.includes('04') || nm.includes('blogger') || nm.includes('publisher')) {
            node.parameters.workflowId.value = wf04Id; changed++;
          }
        } else if (typeof wfIdParam === 'string') {
          if (nm.includes('02') || nm.includes('ai') || nm.includes('content')) {
            node.parameters.workflowId = wf02Id; changed++;
          } else if (nm.includes('04') || nm.includes('blogger') || nm.includes('publisher')) {
            node.parameters.workflowId = wf04Id; changed++;
          }
        }
      }

      // CRÍTICO: usar sanitizeForApi para no enviar campos extras
      const patchPayload = sanitizeForApi(wf01);
      const patchRes = await apiCall('PUT', `/api/v1/workflows/${wf01Id}`, patchPayload);
      if (patchRes.ok) {
        console.log(`  ✓ WF01 [${wf01Id}] → WF02=[${wf02Id}] WF04=[${wf04Id}] (${changed} nodos)`);
      } else {
        console.log(`  ✗ Error patcheando WF01: HTTP ${patchRes.status}`);
        console.log(`    ${JSON.stringify(patchRes.body).slice(0, 300)}`);
      }
    }
  } else {
    console.log(`  ⚠ IDs faltantes: WF01=${wf01Name||'?'} WF02=${wf02Name||'?'} WF04=${wf04Name||'?'}`);
  }

  // 5b. Cablear WF04 → WF10 (Social Media Distributor)
  const wf10Name = Object.keys(ids).find(k => k.includes('10_SOCIAL'));
  if (wf04Name && wf10Name) {
    const wf04Id = ids[wf04Name];
    const wf10Id = ids[wf10Name];
    const wf04Res = await apiCall('GET', `/api/v1/workflows/${wf04Id}`);
    if (wf04Res.ok && wf04Res.body.nodes) {
      const wf04 = wf04Res.body;
      let changed = 0;
      for (const node of wf04.nodes) {
        if (node.type !== 'n8n-nodes-base.executeWorkflow') continue;
        const nm = (node.name || '').toLowerCase();
        if (!nm.includes('10') && !nm.includes('social')) continue;
        if (!node.parameters) continue;
        const wfIdParam = node.parameters.workflowId;
        if (typeof wfIdParam === 'object' && '__rl' in wfIdParam) {
          node.parameters.workflowId.value = wf10Id; changed++;
        } else {
          node.parameters.workflowId = wf10Id; changed++;
        }
      }
      const p = await apiCall('PUT', `/api/v1/workflows/${wf04Id}`, sanitizeForApi(wf04));
      if (p.ok) console.log(`  ✓ WF04 [${wf04Id}] → WF10=[${wf10Id}] (${changed} nodos)`);
      else console.log(`  ✗ Error cableando WF04→WF10: HTTP ${p.status}`);
    }
  }

  // 6. Activar en orden de dependencias
  // CRÍTICO: sub-workflows deben estar activos ANTES que sus padres
  // WF10 → WF04 (WF04 llama a WF10)
  // WF02 + WF04 → WF01 (WF01 llama a WF02 y WF04)
  console.log('\n── ACTIVANDO WORKFLOWS (orden de dependencias) ──');
  await new Promise(r => setTimeout(r, 2000));

  const allWf = await getAllWorkflows();

  // Orden: primero los que no tienen deps, luego los que sí
  // Usar IDs exactos del ids map para evitar activar workflows con nombres similares
  const activateSequence = [
    '05_LOCK_WATCHDOG',
    '25_TITLE_FACTORY',
    '02_AI_CONTENT_GENERATOR',      // debe activarse ANTES que WF01
    '06_AFFILIATE_INJECTOR',
    '07_MONETIZATION_INJECTOR',
    '08_TELEGRAM_BROADCASTER',
    '09_DIGITAL_PRODUCT_LINKER',
    '10_SOCIAL_MEDIA_DISTRIBUTOR',  // debe activarse ANTES que WF04
    '15_INTERLINK_BUILDER',
    '04_BLOGGER_PUBLISHER',         // debe activarse DESPUÉS de WF10, ANTES de WF01
    '01_MASTER_SCHEDULER',          // debe ser el ÚLTIMO
  ];

  for (const wfName of activateSequence) {
    // Preferir el ID exacto del import actual; fallback a búsqueda por nombre exacto
    const wfId = ids[wfName];
    let wf;
    if (wfId) {
      wf = allWf.find(w => w.id === wfId);
    }
    if (!wf) {
      // Buscar por nombre exacto (no prefijo) para evitar falsos positivos
      wf = allWf.find(w => w.name === wfName);
    }
    if (!wf) { console.log(`  SKIP (no encontrado): ${wfName}`); continue; }

    if (wf.active) {
      console.log(`  ✓ YA ACTIVO: ${wf.name} [${wf.id}]`);
      continue;
    }

    const actRes = await apiCall('POST', `/api/v1/workflows/${wf.id}/activate`);
    const ok = actRes.ok || actRes.body?.active === true;
    console.log(`  ${ok ? '✓ ACTIVADO' : '✗ FALLÓ'}: ${wf.name} [${wf.id}]`);
    if (!ok) console.log(`    ${JSON.stringify(actRes.body).slice(0,300)}`);

    // Breve pausa para que n8n registre el estado activo antes de activar dependientes
    if (ok) await new Promise(r => setTimeout(r, 500));
  }

  // 7. KICKSTART — disparar WF25 para poblar pipeline
  console.log('\n── KICKSTART DE PRODUCCIÓN ──');
  await new Promise(r => setTimeout(r, 3000));

  const kickAllWf = await getAllWorkflows();
  const wf25kick  = kickAllWf.find(w => w.id === ids['25_TITLE_FACTORY'] && w.active);
  const wf01kick  = kickAllWf.find(w => w.id === ids['01_MASTER_SCHEDULER'] && w.active);

  // Intentar disparar WF25 via webhook/test trigger si está disponible
  if (wf25kick) {
    // n8n API v1: POST /executions con workflowId
    const r25 = await apiCall('POST', `/api/v1/workflows/${wf25kick.id}/run`);
    if (r25.ok || r25.status === 200) {
      console.log(`  ✓ WF25 disparado [${wf25kick.id}] — generando títulos...`);
      console.log('  → Esperando 60s para que DeepSeek complete...');
      await new Promise(r => setTimeout(r, 60000));
      console.log('  ✓ Espera completada');
    } else {
      console.log(`  ⚠ WF25 kickstart HTTP ${r25.status} — cron de 2h disparará automáticamente`);
      console.log('  → ACCIÓN MANUAL: Panel n8n → 25_TITLE_FACTORY → Execute Workflow');
    }
  } else {
    if (ids['25_TITLE_FACTORY']) {
      console.log('  ⚠ WF25 existe pero no está activo — revisa el panel');
    } else {
      console.log('  ⚠ WF25 no importado — pipeline podría estar vacío');
    }
  }

  // Disparar WF01 si está activo
  if (wf01kick) {
    const r01 = await apiCall('POST', `/api/v1/workflows/${wf01kick.id}/run`);
    if (r01.ok || r01.status === 200) {
      console.log(`  ✓ WF01 disparado [${wf01kick.id}] — primer artículo en curso...`);
    } else {
      console.log(`  ⚠ WF01 kickstart HTTP ${r01.status} — cron de 20 min disparará automáticamente`);
    }
  } else {
    console.log('  ⚠ WF01 no activo — revisar errores de activación arriba');
    console.log('  → ACCIÓN MANUAL si WF01 falló: Panel n8n → 01_MASTER_SCHEDULER → activar manualmente');
  }

  // 8. Estado final
  console.log('\n── ESTADO FINAL ──');
  await new Promise(r => setTimeout(r, 2000));

  const finalRes = await apiCall('GET', '/api/v1/workflows?active=true&limit=50');
  const activeWfs = finalRes.body.data || [];
  console.log(`\nWorkflows ACTIVOS: ${activeWfs.length}`);
  for (const w of activeWfs) console.log(`  ✓ ${w.name}`);

  // Verificar por ID exacto (no patrón) para evitar falsos positivos con nombres similares
  const criticalNames = ['01_MASTER_SCHEDULER','02_AI_CONTENT_GENERATOR','04_BLOGGER_PUBLISHER','05_LOCK_WATCHDOG'];
  const criticalStatus = {};
  for (const n of criticalNames) {
    const id = ids[n];
    const active = id ? activeWfs.some(w => w.id === id) : false;
    criticalStatus[n] = { id, active };
    console.log(`  ${active ? '✓' : '✗'} ${n}${id ? ` [${id}]` : ' (no importado)'}`);
  }
  const criticalOk = criticalNames.every(n => criticalStatus[n].active);

  console.log('\n── PRODUCCIÓN ──');
  console.log(`  Importados: ${Object.keys(ids).length}`);
  console.log(`  Activos:    ${activeWfs.length}`);
  console.log(`  Estado:     ${criticalOk ? '✓ LISTA — 1 artículo cada 20 min' : '✗ INCOMPLETA — revisar panel'}`);
  if (!criticalOk) {
    for (const [n, s] of Object.entries(criticalStatus)) {
      if (!s.active) console.log(`  ✗ PROBLEMA: ${n} — no está activo`);
    }
  }

  // 8. Telegram
  if (BOT_TOKEN && CHAT_ID && CHAT_ID !== '0') {
    const msg = [
      `🚀 <b>Fábrica SEO — ${criticalOk ? '🟢 ACTIVA' : '🟡 PARCIAL'}</b>`,
      '',
      `✅ ${Object.keys(ids).length} workflows importados`,
      `✅ ${activeWfs.length} activos`,
      criticalOk ? '✅ Cron: 1 artículo/20 min' : '⚠ Revisar workflows en panel',
      '',
      `🕐 ${new Date().toISOString().slice(0,16).replace('T',' ')}`,
    ].join('\n');
    await telegramSend(msg);
    console.log('\n✓ Telegram notificado');
  }

  console.log(`\n${'═'.repeat(52)}`);
  console.log('  BOOTSTRAP COMPLETADO');
  console.log(`${'═'.repeat(52)}\n`);

  process.exit(criticalOk ? 0 : 2);
}

main().catch(e => {
  console.error('\nFATAL:', e.message);
  console.error(e.stack);
  process.exit(1);
});
