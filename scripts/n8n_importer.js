/**
 * n8n_importer.js
 * Ejecutar DENTRO del contenedor n8n via:
 *   docker exec -e N8N_API_KEY=KEY CONTAINER node /tmp/n8n_importer.js
 */
'use strict';
const http = require('http');
const fs   = require('fs');
const path = require('path');

const API_KEY  = process.env.N8N_API_KEY || '';
const BASE_DIR = process.env.WF_DIR || '/tmp/n8n_bootstrap';
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const CHAT_ID   = process.env.CHAT_ID  || '';

if (!API_KEY) { console.error('ERROR: N8N_API_KEY no definida'); process.exit(1); }

// ── HTTP helper ────────────────────────────────────────────────────────────
function apiCall(method, apiPath, bodyObj) {
  return new Promise((resolve) => {
    const bodyBuf = bodyObj !== undefined ? Buffer.from(JSON.stringify(bodyObj)) : null;
    const req = http.request({
      hostname: 'localhost', port: 5678, path: apiPath, method,
      headers: {
        'X-N8N-API-KEY': API_KEY,
        'Content-Type': 'application/json',
        ...(bodyBuf ? { 'Content-Length': bodyBuf.length } : {})
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ ok: res.statusCode < 400, status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ ok: res.statusCode < 400, status: res.statusCode, body: data.slice(0, 300) }); }
      });
    });
    req.on('error', e => resolve({ ok: false, status: 0, body: { error: e.message } }));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

function apiFile(method, apiPath, filePath) {
  return new Promise((resolve) => {
    const bodyBuf = fs.readFileSync(filePath);
    const req = http.request({
      hostname: 'localhost', port: 5678, path: apiPath, method,
      headers: {
        'X-N8N-API-KEY': API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': bodyBuf.length
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ ok: res.statusCode < 400, status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ ok: res.statusCode < 400, status: res.statusCode, body: data.slice(0, 300) }); }
      });
    });
    req.on('error', e => resolve({ ok: false, status: 0, body: { error: e.message } }));
    req.write(bodyBuf);
    req.end();
  });
}

// ── Telegram helper ────────────────────────────────────────────────────────
function telegramSend(text) {
  if (!BOT_TOKEN || !CHAT_ID || CHAT_ID === '0') return Promise.resolve();
  const https = require('https');
  const body = JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' });
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

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const line = '═'.repeat(50);
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
    console.error(`✗ n8n no responde (status ${health.status}): ${JSON.stringify(health.body).slice(0,200)}`);
    process.exit(1);
  }
  console.log('✓ n8n API OK');

  // 2. Obtener workflows existentes
  const listRes = await apiCall('GET', '/api/v1/workflows?limit=200');
  const existing = {};
  for (const w of (listRes.body.data || [])) existing[w.name] = w.id;
  console.log(`✓ Workflows existentes: ${Object.keys(existing).length}`);

  // 3. Importar en orden
  const order = [
    'production/05_LOCK_WATCHDOG.json',
    'production/02_AI_CONTENT_GENERATOR.json',
    'production/04_BLOGGER_PUBLISHER.json',
    'production/25_TITLE_FACTORY.json',
    'monetization/06_AFFILIATE_INJECTOR.json',
    'monetization/07_MONETIZATION_INJECTOR.json',
    'distribution/08_TELEGRAM_BROADCASTER.json',
    'distribution/09_DIGITAL_PRODUCT_LINKER.json',
    'seo/15_INTERLINK_BUILDER.json',
    'production/01_MASTER_SCHEDULER.json',
  ];

  const ids = {};
  console.log('\n── IMPORTANDO WORKFLOWS ──');

  for (const rel of order) {
    const filePath = path.join(BASE_DIR, rel);
    if (!fs.existsSync(filePath)) { console.log(`  SKIP: ${rel}`); continue; }

    let wfObj;
    try { wfObj = JSON.parse(fs.readFileSync(filePath, 'utf8')); }
    catch (e) { console.log(`  ERROR leyendo ${rel}: ${e.message}`); continue; }

    const name = wfObj.name;
    // Limpiar campos que PUT rechaza
    const cleanWf = { ...wfObj };
    delete cleanWf.id; delete cleanWf.createdAt; delete cleanWf.updatedAt; delete cleanWf.versionId;

    let res;
    if (existing[name]) {
      // Actualizar
      const cleanBuf = Buffer.from(JSON.stringify(cleanWf));
      res = await new Promise((resolve) => {
        const req = http.request({
          hostname: 'localhost', port: 5678,
          path: `/api/v1/workflows/${existing[name]}`,
          method: 'PUT',
          headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json', 'Content-Length': cleanBuf.length }
        }, (r) => {
          let d = ''; r.on('data', c => d += c);
          r.on('end', () => { try { resolve({ ok: r.statusCode < 400, body: JSON.parse(d) }); } catch { resolve({ ok: r.statusCode < 400, body: d }); } });
        });
        req.on('error', e => resolve({ ok: false, body: { error: e.message } }));
        req.write(cleanBuf); req.end();
      });
      const id = existing[name];
      ids[name] = id;
      console.log(`  ✓ UPDATE: ${name} [${id}]`);
    } else {
      // Crear nuevo
      const cleanBuf = Buffer.from(JSON.stringify(cleanWf));
      res = await new Promise((resolve) => {
        const req = http.request({
          hostname: 'localhost', port: 5678,
          path: '/api/v1/workflows',
          method: 'POST',
          headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json', 'Content-Length': cleanBuf.length }
        }, (r) => {
          let d = ''; r.on('data', c => d += c);
          r.on('end', () => { try { resolve({ ok: r.statusCode < 400, body: JSON.parse(d) }); } catch { resolve({ ok: r.statusCode < 400, body: d }); } });
        });
        req.on('error', e => resolve({ ok: false, body: { error: e.message } }));
        req.write(cleanBuf); req.end();
      });
      const id = res.body.id || '?';
      ids[name] = id;
      if (res.ok) {
        console.log(`  ✓ CREATE: ${name} [${id}]`);
      } else {
        console.log(`  ✗ ERROR: ${name} — ${JSON.stringify(res.body).slice(0, 150)}`);
      }
    }
  }

  // 4. Auto-cablear WF01 con IDs reales de WF02 y WF04
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
        if (node.type === 'n8n-nodes-base.executeWorkflow') {
          const nm = (node.name || '').toLowerCase();
          const wfIdParam = node.parameters && node.parameters.workflowId;
          if (typeof wfIdParam === 'object' && wfIdParam !== null) {
            if (nm.includes('02') || nm.includes('ai') || nm.includes('content')) {
              node.parameters.workflowId.value = wf02Id;
              changed++;
            } else if (nm.includes('04') || nm.includes('blogger') || nm.includes('publisher')) {
              node.parameters.workflowId.value = wf04Id;
              changed++;
            }
          }
        }
      }
      // Limpiar y guardar
      delete wf01.createdAt; delete wf01.updatedAt; delete wf01.versionId;
      const patchBuf = Buffer.from(JSON.stringify(wf01));
      const patchRes = await new Promise((resolve) => {
        const req = http.request({
          hostname: 'localhost', port: 5678,
          path: `/api/v1/workflows/${wf01Id}`,
          method: 'PUT',
          headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json', 'Content-Length': patchBuf.length }
        }, (r) => {
          let d = ''; r.on('data', c => d += c);
          r.on('end', () => resolve({ ok: r.statusCode < 400, status: r.statusCode }));
        });
        req.on('error', e => resolve({ ok: false, error: e.message }));
        req.write(patchBuf); req.end();
      });
      if (patchRes.ok) {
        console.log(`  ✓ WF01 [${wf01Id}] → WF02=[${wf02Id}] WF04=[${wf04Id}] (${changed} nodos)`);
      } else {
        console.log(`  ✗ Error patcheando WF01: status ${patchRes.status}`);
      }
    }
  } else {
    console.log('  ⚠ No se encontraron todos los IDs para cablear WF01');
    console.log(`    WF01=${wf01Name||'?'} WF02=${wf02Name||'?'} WF04=${wf04Name||'?'}`);
  }

  // 5. Activar todos los workflows
  console.log('\n── ACTIVANDO WORKFLOWS ──');
  const activatePatterns = [
    '05_LOCK', '25_TITLE', '02_AI', '04_BLOGGER',
    '06_AFFILIATE', '07_MONETIZ', '08_TELEGRAM',
    '09_DIGITAL', '15_INTERLINK', '01_MASTER'
  ];

  const allWfRes = await apiCall('GET', '/api/v1/workflows?limit=200');
  const allWf = allWfRes.body.data || [];

  for (const pattern of activatePatterns) {
    const wf = allWf.find(w => w.name.includes(pattern));
    if (!wf) { console.log(`  SKIP: ${pattern}`); continue; }

    const actRes = await apiCall('POST', `/api/v1/workflows/${wf.id}/activate`, {});
    const isActive = actRes.ok || actRes.body.active === true;
    console.log(`  ${isActive ? '✓' : '✗'} ${wf.name} [${wf.id}]`);
  }

  // 6. Resumen final
  console.log('\n── ESTADO FINAL ──');
  const finalRes = await apiCall('GET', '/api/v1/workflows?active=true&limit=50');
  const activeWfs = finalRes.body.data || [];
  console.log(`Workflows activos: ${activeWfs.length}`);
  for (const w of activeWfs) console.log(`  ✓ ${w.name}`);

  // 7. Telegram de confirmación
  if (BOT_TOKEN && CHAT_ID && CHAT_ID !== '0') {
    const msg = `🚀 <b>Fábrica SEO n8n — ACTIVA</b>\n\n✅ ${activeWfs.length} workflows activos\n✅ Crons corriendo\n\n🕐 ${new Date().toISOString().slice(0,16)}\n\n<i>Próximo artículo en 20 min.</i>`;
    await telegramSend(msg);
    console.log('\n✓ Confirmación enviada a Telegram');
  }

  console.log(`\n${'═'.repeat(50)}`);
  console.log('  BOOTSTRAP COMPLETADO');
  console.log(`${'═'.repeat(50)}\n`);
}

main().catch(e => { console.error('FATAL:', e.message, e.stack); process.exit(1); });
