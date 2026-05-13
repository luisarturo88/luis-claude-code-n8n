/**
 * diagnose.js — Diagnóstico completo del sistema n8n
 * Ejecutar: docker exec -e N8N_API_KEY=KEY CONTAINER node /tmp/diagnose.js
 */
'use strict';
const http = require('http');

const API_KEY = process.env.N8N_API_KEY || '';
if (!API_KEY) { console.error('N8N_API_KEY requerida'); process.exit(1); }

function apiCall(method, apiPath) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost', port: 5678, path: apiPath, method,
      headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ ok: res.statusCode < 400, status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ ok: res.statusCode < 400, status: res.statusCode, body: data.slice(0, 500) }); }
      });
    });
    req.on('error', e => resolve({ ok: false, body: { error: e.message } }));
    req.end();
  });
}

async function main() {
  const SEP = '═'.repeat(60);
  console.log(`\n${SEP}`);
  console.log('  DIAGNÓSTICO FÁBRICA SEO n8n');
  console.log(`  ${new Date().toISOString()}`);
  console.log(`${SEP}\n`);

  // 1. Workflows activos/inactivos
  const wfRes = await apiCall('GET', '/api/v1/workflows?limit=200');
  const wfs = wfRes.body.data || [];
  const active   = wfs.filter(w => w.active);
  const inactive = wfs.filter(w => !w.active);

  const CORE = ['01_MASTER', '02_AI', '04_BLOGGER', '05_LOCK', '25_TITLE'];
  console.log(`── WORKFLOWS CORE (${active.length} activos / ${wfs.length} total) ──`);
  for (const pattern of CORE) {
    const found = active.find(w => w.name.includes(pattern));
    console.log(`  ${found ? '✓' : '✗ FALTA'} ${pattern}${found ? ` [${found.id}]` : ''}`);
  }
  if (inactive.length > 0 && inactive.length <= 10) {
    console.log(`\n  INACTIVOS (${inactive.length}):`);
    inactive.slice(0, 10).forEach(w => console.log(`    ✗ [${w.id}] ${w.name}`));
  }

  // 2. Últimas 25 ejecuciones con workflow name
  const exRes = await apiCall('GET', '/api/v1/executions?limit=25&includeData=false');
  const execs = exRes.body.data || [];
  console.log(`\n── ÚLTIMAS EJECUCIONES (${execs.length}) ──`);
  if (execs.length === 0) {
    console.log('  ⚠ NINGUNA ejecución — el scheduler nunca disparó');
    console.log('  → Causa probable: workflows inactivos O pipeline vacío');
  } else {
    execs.slice(0, 20).forEach(e => {
      const ts = new Date(e.startedAt || e.createdAt).toISOString().slice(11,19);
      const dur = e.stoppedAt ? Math.round((new Date(e.stoppedAt) - new Date(e.startedAt))/1000) + 's' : '?';
      const icon = e.status === 'success' ? '✓' : (e.status === 'error' ? '✗' : '⟳');
      const wfName = (e.workflowData?.name || e.workflowId || '?').slice(0, 40);
      console.log(`  ${icon} [${ts}] ${wfName} — ${e.status || 'running'} (${dur})`);
    });
  }

  // 3. Detalle de errores recientes
  const errExecs = execs.filter(e => e.status === 'error');
  if (errExecs.length > 0) {
    console.log(`\n── ERRORES RECIENTES (${errExecs.length} de ${execs.length}) ──`);
    for (const e of errExecs.slice(0, 4)) {
      const wfName = e.workflowData?.name || e.workflowId || '?';
      const ts = new Date(e.startedAt || e.createdAt).toISOString().slice(11,19);
      console.log(`\n  [${ts}] WF: ${wfName}`);
      // Obtener detalle de la ejecución
      const det = await apiCall('GET', `/api/v1/executions/${e.id}`);
      if (det.ok) {
        const exec = det.body;
        // Buscar el nodo que falló
        const data = exec.data;
        if (data && data.resultData && data.resultData.error) {
          const err = data.resultData.error;
          console.log(`  Error: ${err.message || JSON.stringify(err).slice(0,200)}`);
          if (err.node) console.log(`  Nodo: ${err.node.name || err.node}`);
          if (err.stack) console.log(`  Stack: ${err.stack.slice(0,300)}`);
        } else if (data && data.resultData && data.resultData.runData) {
          // Buscar nodos con errores en runData
          const runData = data.resultData.runData;
          for (const [nodeName, nodeRuns] of Object.entries(runData)) {
            for (const run of (nodeRuns || [])) {
              if (run.error) {
                console.log(`  Nodo FALLÓ: ${nodeName}`);
                console.log(`  Mensaje: ${run.error.message || JSON.stringify(run.error).slice(0,300)}`);
                break;
              }
            }
          }
        } else {
          console.log(`  (Sin detalle de error disponible)`);
        }
      }
    }
  }

  // 4. TODAS las credenciales configuradas
  const credRes = await apiCall('GET', '/api/v1/credentials?limit=100');
  const creds = credRes.body.data || [];
  console.log(`\n── CREDENCIALES CONFIGURADAS (${creds.length} total) ──`);

  if (creds.length === 0) {
    console.log('  🔴 NINGUNA credencial configurada — sistema no puede funcionar');
  } else {
    // Agrupar por tipo
    const byType = {};
    for (const c of creds) {
      const t = c.type || 'unknown';
      if (!byType[t]) byType[t] = [];
      byType[t].push(c.name);
    }
    for (const [type, names] of Object.entries(byType)) {
      console.log(`  [${type}]`);
      names.forEach(n => console.log(`    ✓ ${n}`));
    }
  }

  // Verificar credenciales críticas (buscar por tipo, no solo por nombre)
  console.log('\n  — Verificación crítica —');
  const checks = [
    { label: 'Google Sheets',         type: 'googleSheetsOAuth2Api' },
    { label: 'Google Blogger OAuth2', type: 'googleOAuth2Api' },
    { label: 'DeepSeek API',          type: 'httpHeaderAuth', namePart: 'deepseek' },
    { label: 'Facebook Page Token',   type: 'httpHeaderAuth', namePart: 'facebook' },
    { label: 'Twitter OAuth1',        type: 'oAuth1Api' },
  ];
  let allCredOk = true;
  for (const chk of checks) {
    let found;
    if (chk.namePart) {
      found = creds.find(c => c.type === chk.type && c.name.toLowerCase().includes(chk.namePart));
    } else {
      found = creds.find(c => c.type === chk.type);
    }
    const ok = !!found;
    if (!ok) allCredOk = false;
    console.log(`  ${ok ? '✓' : '✗ FALTA'} ${chk.label}${found ? ` → "${found.name}"` : ''}`);
  }

  // 5. Estado del pipeline (Google Sheets)
  console.log(`\n── ESTADO DEL PIPELINE ──`);
  const masterWf = active.find(w => w.name.includes('01_MASTER'));
  const wf02     = active.find(w => w.name.includes('02_AI'));
  const wf04     = active.find(w => w.name.includes('04_BLOGGER'));

  const coreOk = !!(masterWf && wf02 && wf04);
  if (!masterWf) {
    console.log('  🔴 WF01_MASTER_SCHEDULER inactivo — nada publicará');
  }
  if (!wf02) {
    console.log('  🔴 WF02_AI_CONTENT inactivo — no se genera contenido');
  }
  if (!wf04) {
    console.log('  🔴 WF04_BLOGGER inactivo — no se publican artículos');
  }
  if (coreOk) {
    const successCount = execs.filter(e => e.status === 'success').length;
    const errCount = execs.filter(e => e.status === 'error').length;
    if (errCount > 0 && successCount === 0) {
      console.log('  🔴 TODAS las ejecuciones recientes fallaron');
      if (!allCredOk) console.log('  → Causa probable: credenciales faltantes (ver arriba)');
    } else if (errCount > successCount) {
      console.log(`  🟡 INESTABLE: ${errCount} errores vs ${successCount} éxitos`);
    } else {
      console.log(`  🟢 Funcionando: ${successCount}/${execs.length} éxitos`);
    }
  }

  if (masterWf) {
    console.log(`\n  WF01 activo: [${masterWf.id}]`);
    console.log('  Cron: cada 20 min — próxima ejecución automática');
    console.log('  Para forzar ahora: Panel n8n → WF01 → Execute');
  }

  // 6. Diagnóstico de pipeline vacío
  if (execs.length > 0) {
    const masterExecs = execs.filter(e =>
      (e.workflowData?.name || '').includes('01_MASTER') ||
      e.workflowId === masterWf?.id
    );
    const quickExecs = masterExecs.filter(e => {
      const dur = e.stoppedAt
        ? (new Date(e.stoppedAt) - new Date(e.startedAt)) / 1000
        : 999;
      return dur < 3 && e.status === 'success';
    });
    if (quickExecs.length > 0 && quickExecs.length >= masterExecs.length * 0.5) {
      console.log('\n  ⚠ WF01 termina en <3s — CONTENT_PIPELINE probablemente VACÍO');
      console.log('  → Solución: ejecutar WF25_TITLE_FACTORY manualmente en el panel');
    }
  }

  console.log(`\n${SEP}\n`);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
