/**
 * ============================================================
 * BLOGGER POPUP SYSTEM - Conectado a n8n en Contabo
 * ============================================================
 * INSTALACION:
 * 1. Ve a tu panel de Blogger → Tema → Editar HTML
 * 2. Busca </body>
 * 3. Pega TODO este script ANTES de </body>
 * 4. Reemplaza N8N_WEBHOOK_URL con la URL real de tu webhook
 * 5. Guarda el tema
 * ============================================================
 */
(function () {
  'use strict';

  // ============================================================
  // CONFIGURACION - EDITA ESTOS VALORES
  // ============================================================
  const N8N_WEBHOOK_URL = 'https://TU-N8N-CONTABO.com/webhook/popup-config';
  // ^ Copia la URL del nodo "Webhook Popup" de tu workflow 2

  const CONFIG = {
    scrollThreshold: 40,        // % de scroll para mostrar popup de contenido
    cookieExpireDays: 3,        // días antes de volver a mostrar el mismo popup
    exitIntentDelay: 5000,      // ms que debe pasar antes de detectar exit intent
    debug: false                // true para ver logs en consola
  };
  // ============================================================

  const log = (...args) => CONFIG.debug && console.log('[Popup]', ...args);

  // --- Gestión de cookies para no molestar al usuario ---
  function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
  }

  function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
      const [k, val] = v.split('=');
      return k === name ? decodeURIComponent(val) : r;
    }, null);
  }

  function hasSeenPopup(type) {
    return !!getCookie(`popup_seen_${type}`);
  }

  function markPopupSeen(type) {
    setCookie(`popup_seen_${type}`, '1', CONFIG.cookieExpireDays);
  }

  // --- Obtener etiquetas del post actual (Blogger pone links en .post-labels) ---
  function getPostLabels() {
    const labelLinks = document.querySelectorAll('.post-labels a, .labels a, [class*="label"] a');
    return Array.from(labelLinks).map(a => a.textContent.trim().toLowerCase());
  }

  // --- Calcular profundidad de scroll ---
  function getScrollDepth() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = Math.max(
      document.body.scrollHeight, document.body.offsetHeight,
      document.documentElement.scrollHeight, document.documentElement.offsetHeight
    ) - window.innerHeight;
    return docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  }

  // --- Llamar al webhook de n8n ---
  async function fetchPopupConfig(type) {
    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          postUrl: window.location.href,
          postLabels: getPostLabels(),
          scrollDepth: getScrollDepth()
        })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (e) {
      log('Error al obtener config del popup:', e.message);
      return null;
    }
  }

  // --- Renderizar popup ---
  function showPopup(config, type) {
    if (!config || config.active === false) return;
    if (hasSeenPopup(type)) { log('Ya vio este popup:', type); return; }
    if (document.getElementById('n8n-popup-overlay')) return;

    markPopupSeen(type);
    log('Mostrando popup:', type, config);

    const overlay = document.createElement('div');
    overlay.id = 'n8n-popup-overlay';
    overlay.style.cssText = `
      position:fixed;top:0;left:0;width:100%;height:100%;
      background:rgba(0,0,0,0.75);z-index:999999;
      display:flex;align-items:center;justify-content:center;
      animation:fadeInOverlay 0.3s ease;
    `;

    // Contador regresivo (solo si config.showTimer = true)
    let timerHTML = '';
    if (config.showTimer && config.timerMinutes) {
      timerHTML = `<p id="n8n-timer" style="font-size:1.2em;font-weight:700;color:#fbbf24;margin:0 0 16px;">⏱ Oferta válida por: <span id="n8n-countdown">${config.timerMinutes}:00</span></p>`;
    }

    overlay.innerHTML = `
      <style>
        @keyframes fadeInOverlay { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUpBox { from { transform:translateY(40px);opacity:0 } to { transform:translateY(0);opacity:1 } }
        #n8n-popup-box a:hover { opacity:0.9; transform:scale(1.04) !important; }
      </style>
      <div id="n8n-popup-box" style="
        background:${config.bgColor || '#1e3a5f'};
        color:#fff;padding:40px 36px;max-width:520px;width:90%;
        border-radius:16px;position:relative;text-align:center;
        animation:slideUpBox 0.35s ease;box-shadow:0 20px 60px rgba(0,0,0,0.5);
        font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      ">
        <button id="n8n-close-btn" aria-label="Cerrar" style="
          position:absolute;top:12px;right:16px;background:rgba(255,255,255,0.15);
          border:none;color:#fff;font-size:20px;cursor:pointer;
          width:32px;height:32px;border-radius:50%;display:flex;
          align-items:center;justify-content:center;line-height:1;
        ">×</button>
        ${timerHTML}
        <h2 style="margin:0 0 14px;font-size:1.5em;font-weight:800;color:#fff;line-height:1.3;">
          ${config.title}
        </h2>
        <p style="margin:0 0 28px;font-size:1em;opacity:0.9;line-height:1.65;">
          ${config.description}
        </p>
        <a href="${config.ctaUrl}" rel="noopener noreferrer" style="
          display:inline-block;background:${config.accentColor || '#fff'};
          color:#fff;padding:16px 40px;border-radius:50px;
          font-weight:800;font-size:1.05em;text-decoration:none;
          transition:all 0.2s ease;color:#1a1a2e;
          box-shadow:0 4px 20px rgba(0,0,0,0.3);
        ">
          ${config.ctaText}
        </a>
        <p style="margin:16px 0 0;font-size:0.8em;opacity:0.55;cursor:pointer;" id="n8n-no-thanks">
          No gracias, lo pensaré después
        </p>
      </div>
    `;

    document.body.appendChild(overlay);

    // Cerrar al hacer clic en overlay o botón X o "no gracias"
    function closePopup() {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.25s';
      setTimeout(() => overlay.remove(), 260);
    }

    document.getElementById('n8n-close-btn').addEventListener('click', closePopup);
    document.getElementById('n8n-no-thanks').addEventListener('click', closePopup);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePopup();
    });

    // Contador regresivo
    if (config.showTimer && config.timerMinutes) {
      let totalSeconds = config.timerMinutes * 60;
      const countdownEl = document.getElementById('n8n-countdown');
      const interval = setInterval(() => {
        totalSeconds--;
        if (totalSeconds <= 0) {
          clearInterval(interval);
          closePopup();
          return;
        }
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        countdownEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;
      }, 1000);
    }
  }

  // ============================================================
  // 1. POPUP POR SCROLL (40%)
  // ============================================================
  let scrollPopupTriggered = false;
  let maxScrollReached = 0;

  window.addEventListener('scroll', function onScroll() {
    const depth = getScrollDepth();
    if (depth > maxScrollReached) maxScrollReached = depth;

    if (maxScrollReached >= CONFIG.scrollThreshold && !scrollPopupTriggered) {
      scrollPopupTriggered = true;
      log('Scroll 40% alcanzado, solicitando popup...');
      fetchPopupConfig('scroll_40').then(cfg => showPopup(cfg, 'scroll_40'));
    }
  }, { passive: true });

  // ============================================================
  // 2. POPUP DE EXIT INTENT (el cursor sale por arriba de la página)
  // ============================================================
  let exitPopupTriggered = false;
  const pageLoadTime = Date.now();

  document.addEventListener('mouseleave', function onMouseLeave(e) {
    if (e.clientY > 10) return;                              // Solo si sale por arriba
    if (exitPopupTriggered) return;
    if (Date.now() - pageLoadTime < CONFIG.exitIntentDelay) return; // Esperar mínimo 5s

    exitPopupTriggered = true;
    log('Exit intent detectado');
    fetchPopupConfig('exit_intent').then(cfg => showPopup(cfg, 'exit_intent'));
  });

  // ============================================================
  // 3. POPUP UNIVERSAL (aparece en todos los posts después de 8s)
  //    Solo en páginas de posts individuales
  // ============================================================
  const isPostPage = document.body.classList.contains('item-view') ||
                     window.location.pathname.includes('.html') ||
                     document.querySelector('.post-body') !== null;

  if (isPostPage) {
    setTimeout(() => {
      if (!document.getElementById('n8n-popup-overlay')) {
        log('Mostrando popup universal (8s)');
        fetchPopupConfig('universal').then(cfg => showPopup(cfg, 'universal'));
      }
    }, 8000);
  }

  log('Sistema de popups iniciado ✓');
})();
