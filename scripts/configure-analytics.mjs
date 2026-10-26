import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { DEFAULT_ANALYTICS, validateAnalytics } from '../js/analytics-render.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
export async function configureAnalytics(value, targetRoot = root) {
  const config = value === '--disable' ? { ...DEFAULT_ANALYTICS } : validateAnalytics({ version: 1, enabled: true, websiteId: value });
  await writeFile(resolve(targetRoot, 'content/analytics.json'), `${JSON.stringify(config, null, 2)}\n`);
  return config;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 3) throw new Error('Uso: node scripts/configure-analytics.mjs WEBSITE_ID | --disable');
    const config = await configureAnalytics(process.argv[2]);
    console.log(`Estadísticas ${config.enabled ? 'configuradas' : 'desactivadas'} localmente. Publica los cambios para aplicarlos en el dominio.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
