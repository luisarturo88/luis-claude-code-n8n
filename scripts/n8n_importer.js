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
function sanitizeForApi(wf) {
  const clean = {
    name:        wf.name,
    nodes:       wf.nodes       || [],
    connections: wf.connections || {},
    settings:    wf.settings    || {}
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

  // 3. Eliminar workflows basura
  const TRASH_PATTERNS = [
    'TEMP_READ_PIPELINE',
    'Sheet Reset Row',
    'TEMP_UPDATE_ROW',
    '00_DEBUG',
    '99_SEED',
    'FIX_BLOG_ID',
  ];
  console.log('\n── LIMPIANDO WORKFLOWS BASURA ──');
  let deleted = 0;
  for (const w of existingList) {
    const isTrash = TRASH_PATTERNS.some(p => w.name.includes(p));
    if (!isTrash) continue;
    if (w.active) await apiCall('POST', `/api/v1/workflows/${w.id}/deactivate`);
    const del = await apiCall('DELETE', `/api/v1/workflows/${w.id}`);
    if (del.ok || del.status === 404) {
      console.log(`  🗑 ELIMINADO: ${w.name} [${w.id}]`);
      deleted++;
      delete existing[w.name];
    } else {
      console.log(`  ⚠ No se pudo eliminar ${w.name}: HTTP ${del.status}`);
    }
  }
  if (deleted === 0) console.log('  (ningún workflow basura encontrado)');

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

  // 6. Activar en orden
  console.log('\n── ACTIVANDO WORKFLOWS ──');
  await new Promise(r => setTimeout(r, 2000));

  const allWf = await getAllWorkflows();

  const activateOrder = [
    '05_LOCK', '25_TITLE', '02_AI', '04_BLOGGER',
    '06_AFFILIATE', '07_MONETIZ', '08_TELEGRAM',
    '09_DIGITAL', '10_SOCIAL', '15_INTERLINK', '01_MASTER'
  ];

  for (const pattern of activateOrder) {
    const wf = allWf.find(w => w.name.includes(pattern));
    if (!wf) { console.log(`  SKIP: ${pattern}`); continue; }
    if (wf.active) { console.log(`  ✓ YA ACTIVO: ${wf.name} [${wf.id}]`); continue; }

    const actRes = await apiCall('POST', `/api/v1/workflows/${wf.id}/activate`);
    const ok = actRes.ok || actRes.body?.active === true;
    console.log(`  ${ok ? '✓ ACTIVADO' : '✗ FALLÓ'}: ${wf.name} [${wf.id}]`);
    if (!ok) console.log(`    ${JSON.stringify(actRes.body).slice(0,200)}`);
  }

  // 7. KICKSTART — disparar WF25 y WF01 para producción inmediata
  console.log('\n── KICKSTART DE PRODUCCIÓN ──');
  await new Promise(r => setTimeout(r, 3000));

  const kickAllWf = await getAllWorkflows();
  const wf25kick  = kickAllWf.find(w => w.name.includes('25_TITLE') && w.active);
  const wf01kick  = kickAllWf.find(w => w.name.includes('01_MASTER') && w.active);

  // Disparar WF25 (Title Factory) para poblar CONTENT_PIPELINE si está vacío
  if (wf25kick) {
    const r25 = await apiCall('POST', `/api/v1/workflows/${wf25kick.id}/run`, {});
    if (r25.ok || r25.status === 200) {
      console.log(`  ✓ WF25 disparado — generando títulos en CONTENT_PIPELINE...`);
      console.log('  → Esperando 50 segundos para que DeepSeek complete...');
      await new Promise(r => setTimeout(r, 50000));
      console.log('  ✓ Espera completada');
    } else {
      console.log(`  ⚠ WF25 no se pudo disparar: HTTP ${r25.status} — ${JSON.stringify(r25.body).slice(0,150)}`);
    }
  } else {
    console.log('  ⚠ WF25 no activo — pipeline podría estar vacío');
  }

  // Disparar WF01 manualmente para primer artículo inmediato
  if (wf01kick) {
    const r01 = await apiCall('POST', `/api/v1/workflows/${wf01kick.id}/run`, {});
    if (r01.ok || r01.status === 200) {
      console.log(`  ✓ WF01 disparado — primera publicación en curso...`);
    } else {
      console.log(`  ⚠ WF01: HTTP ${r01.status} — ${JSON.stringify(r01.body).slice(0,150)}`);
      console.log('  → El cron de 20 min tomará el relevo automáticamente');
    }
  }

  // 8. Estado final
  console.log('\n── ESTADO FINAL ──');
  await new Promise(r => setTimeout(r, 2000));

  const finalRes = await apiCall('GET', '/api/v1/workflows?active=true&limit=50');
  const activeWfs = finalRes.body.data || [];
  console.log(`\nWorkflows ACTIVOS: ${activeWfs.length}`);
  for (const w of activeWfs) console.log(`  ✓ ${w.name}`);

  const criticalOk = ['01_MASTER', '02_AI', '04_BLOGGER', '05_LOCK']
    .every(p => activeWfs.some(w => w.name.includes(p)));

  console.log('\n── PRODUCCIÓN ──');
  console.log(`  Importados: ${Object.keys(ids).length}`);
  console.log(`  Activos:    ${activeWfs.length}`);
  console.log(`  Estado:     ${criticalOk ? '✓ LISTA — 1 artículo cada 20 min' : '✗ INCOMPLETA — revisar panel'}`);

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
