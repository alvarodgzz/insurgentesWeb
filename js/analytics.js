// Only aggregate page views from the published home page are measured.
// This loader deliberately never reads forms, page titles or URL parameters.
(() => {
  'use strict';

  try {
    const trustedHosts = new Set(['losinsurgentes.mx', 'www.losinsurgentes.mx']);
    const configNode = document.getElementById('analytics-config');
    if (!configNode || configNode.type !== 'application/json') return;
    const config = JSON.parse(configNode.textContent);
    if (config.enabled !== true || typeof config.websiteId !== 'string' || config.websiteId.length !== 36 || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(config.websiteId)) return;
    if (!['gate', 'site'].includes(config.phase)) return;
    if (!Array.isArray(config.domains) || !config.domains.length || config.domains.some(host => !trustedHosts.has(host))) return;
    if (window.location.protocol !== 'https:' || window.location.port || !trustedHosts.has(window.location.hostname) || !config.domains.includes(window.location.hostname)) return;
    if (!['/', '/index.html'].includes(window.location.pathname)) return;
    if (window.top !== window.self || document.documentElement.dataset.privatePreview === 'true') return;
    if (String(navigator.doNotTrack) === '1' || navigator.globalPrivacyControl === true) return;
    if (window.__insurgentesAnalyticsStarted) return;

    let referrer = '';
    try {
      const source = new URL(document.referrer);
      if (['https:', 'http:'].includes(source.protocol) && !source.username && !source.password && !trustedHosts.has(source.hostname)) referrer = source.origin;
    } catch { /* Direct visits have no referrer. */ }

    const screenSize = value => Math.min(10000, Math.max(0, Math.floor(Number(value) || 0)));
    const payload = {
      website: config.websiteId,
      hostname: window.location.hostname,
      url: '/',
      title: config.phase === 'gate' ? 'Los Insurgentes — Próximamente' : 'Los Insurgentes',
      language: typeof navigator.language === 'string' ? navigator.language.trim().slice(0, 35) : '',
      screen: `${screenSize(window.screen?.width)}x${screenSize(window.screen?.height)}`,
      referrer,
    };

    // The marker belongs to the window so replacing the gate's document does
    // not create a second page view. Failed trackers are not retried silently.
    window.__insurgentesAnalyticsStarted = true;
    const script = document.createElement('script');
    script.src = 'https://cloud.umami.is/script.js';
    script.async = true;
    script.referrerPolicy = 'no-referrer';
    script.setAttribute('data-website-id', config.websiteId);
    script.setAttribute('data-auto-track', 'false');
    script.setAttribute('data-domains', config.domains.join(','));
    script.onload = () => {
      try {
        if (typeof window.umami?.track !== 'function') return;
        const request = window.umami.track(payload);
        if (typeof request?.catch === 'function') request.catch(() => {});
      } catch { /* Analytics must never interrupt access to the site. */ }
    };
    script.onerror = () => {};
    document.head.appendChild(script);
  } catch { /* Disabled, malformed or unavailable analytics is harmless. */ }
})();
