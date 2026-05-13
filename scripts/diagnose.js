/**
 * diagnose.js — Diagnóstico del sistema n8n
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
        catch { resolve({ ok: res.statusCode < 400, status: res.statusCode, body: data.slice(0, 200) }); }
      });
    });
    req.on('error', e => resolve({ ok: false, body: { error: e.message } }));
    req.end();
  });
}

async function main() {
  const SEP = '═'.repeat(56);
  console.log(`\n${SEP}`);
  console.log('  DIAGNÓSTICO FÁBRICA SEO n8n');
  console.log(`  ${new Date().toISOString()}`);
  console.log(`${SEP}\n`);

  // 1. Workflows activos/inactivos
  const wfRes = await apiCall('GET', '/api/v1/workflows?limit=100');
  const wfs = wfRes.body.data || [];
  const active   = wfs.filter(w => w.active);
  const inactive = wfs.filter(w => !w.active);

  console.log(`── WORKFLOWS (${wfs.length} total) ──`);
  console.log(`  ACTIVOS (${active.length}):`);
  active.forEach(w => console.log(`    ✓ [${w.id}] ${w.name}`));
  if (inactive.length) {
    console.log(`  INACTIVOS (${inactive.length}):`);
    inactive.forEach(w => console.log(`    ✗ [${w.id}] ${w.name}`));
  }

  // 2. Últimas ejecuciones
  const exRes = await apiCall('GET', '/api/v1/executions?limit=20&includeData=false');
  const execs = exRes.body.data || [];
  console.log(`\n── ÚLTIMAS EJECUCIONES (${execs.length}) ──`);
  if (execs.length === 0) {
    console.log('  ⚠ NINGUNA ejecución registrada — el scheduler nunca se disparó');
    console.log('  → Causa probable: workflows no activos O cron no configurado');
  } else {
    execs.slice(0, 15).forEach(e => {
      const ts = new Date(e.startedAt || e.createdAt).toISOString().slice(11,19);
      const dur = e.stoppedAt ? Math.round((new Date(e.stoppedAt) - new Date(e.startedAt))/1000) + 's' : '?';
      const status = e.finished ? (e.status === 'success' ? '✓' : '✗') : '⟳';
      console.log(`  ${status} [${ts}] ${e.workflowData?.name || e.workflowId} — ${e.status || 'running'} (${dur})`);
    });
  }

  // 3. Detectar credenciales problemáticas (workflows con error de credentials)
  const errExecs = execs.filter(e => e.status === 'error');
  if (errExecs.length > 0) {
    console.log(`\n── EJECUCIONES CON ERROR (${errExecs.length}) ──`);
    // Obtener detalle del último error
    for (const e of errExecs.slice(0, 3)) {
      const det = await apiCall('GET', `/api/v1/executions/${e.id}`);
      if (det.ok && det.body.data) {
        const errMsg = JSON.stringify(det.body.data).slice(0, 300);
        console.log(`  WF: ${det.body.workflowData?.name || e.workflowId}`);
        console.log(`  Error: ${errMsg}\n`);
      }
    }
  }

  // 4. Credenciales configuradas
  const credRes = await apiCall('GET', '/api/v1/credentials?limit=50');
  const creds = credRes.body.data || [];
  console.log(`\n── CREDENCIALES CONFIGURADAS (${creds.length}) ──`);
  const needed = [
    { name: 'Google Sheets account',  key: 'googleSheetsOAuth2Api' },
    { name: 'Google Blogger OAuth2',  key: 'googleOAuth2Api' },
    { name: 'DeepSeek API',           key: 'httpHeaderAuth' },
    { name: 'Facebook Page Token',    key: 'httpHeaderAuth' },
    { name: 'Twitter OAuth1',         key: 'oAuth1Api' },
  ];
  needed.forEach(n => {
    const found = creds.find(c => c.name === n.name);
    console.log(`  ${found ? '✓' : '✗ FALTA'} ${n.name}`);
  });

  // 5. Estado del pipeline
  console.log(`\n── DIAGNÓSTICO ──`);
  if (active.length === 0) {
    console.log('  🔴 CRÍTICO: Ningún workflow activo. Corre el bootstrap.');
  } else if (!active.find(w => w.name.includes('01_MASTER'))) {
    console.log('  🔴 CRÍTICO: WF01_MASTER_SCHEDULER no está activo.');
  } else if (execs.length === 0) {
    console.log('  🟡 WF01 activo pero nunca ha ejecutado. Espera 20 min o verifica el cron.');
  } else if (errExecs.length === execs.length) {
    console.log('  🔴 Todas las ejecuciones fallaron — probable falta de credenciales.');
    console.log('  → Ve a n8n → Credentials y configura Google Sheets, Blogger, DeepSeek API.');
  } else {
    const successCount = execs.filter(e => e.status === 'success').length;
    console.log(`  🟢 Sistema funcionando: ${successCount}/${execs.length} ejecuciones exitosas.`);
    if (!active.find(w => w.name.includes('02_AI'))) {
      console.log('  ⚠ WF02_AI no activo — los artículos no se generarán.');
    }
    if (!active.find(w => w.name.includes('04_BLOGGER'))) {
      console.log('  ⚠ WF04_BLOGGER no activo — los artículos no se publicarán.');
    }
  }

  const masterWf = active.find(w => w.name.includes('01_MASTER'));
  if (masterWf) {
    console.log(`\n  WF01 activo: [${masterWf.id}]`);
    console.log('  Próxima ejecución: automática (scheduler cada 20 min)');
    console.log('  Para ejecución manual: n8n UI → WF01 → Execute Workflow');
  }

  console.log(`\n${SEP}\n`);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
