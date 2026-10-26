export const DEFAULT_ANALYTICS = Object.freeze({ version: 1, enabled: false, websiteId: '' });

export function validateAnalytics(value = DEFAULT_ANALYTICS) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('La configuración de estadísticas debe ser un objeto.');
  const keys = Object.keys(value);
  if (keys.some(key => !['version', 'enabled', 'websiteId'].includes(key))) throw new Error('La configuración de estadísticas solo admite version, enabled y websiteId; no agregues contraseñas ni claves.');
  if (value.version !== 1 || typeof value.enabled !== 'boolean' || typeof value.websiteId !== 'string') throw new Error('Configuración de estadísticas no válida.');
  const id = value.websiteId;
  if ((id || value.enabled) && (id.length !== 36 || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(id))) throw new Error('Copia el Website ID de Umami antes de activar las estadísticas.');
  return { version: 1, enabled: value.enabled, websiteId: id };
}

export function renderAnalytics(value = DEFAULT_ANALYTICS, phase = 'site') {
  const config = validateAnalytics(value);
  if (!['gate', 'site'].includes(phase)) throw new Error('Fase de estadísticas no válida.');
  if (!config.enabled) return '';
  const payload = { enabled: true, websiteId: config.websiteId, phase, domains: ['losinsurgentes.mx', 'www.losinsurgentes.mx'] };
  return `<script id="analytics-config" type="application/json">${JSON.stringify(payload)}</script>\n<script src="js/analytics.js" defer></script>`;
}
