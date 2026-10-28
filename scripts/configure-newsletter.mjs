import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_NEWSLETTER, validateNewsletter } from '../js/newsletter-render.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
export async function configureNewsletter(formUrl, targetRoot = root) {
  const config = formUrl === '--disable' ? { ...DEFAULT_NEWSLETTER } : validateNewsletter({ version: 1, enabled: true, provider: 'brevo', formUrl });
  await writeFile(resolve(targetRoot, 'content/newsletter.json'), `${JSON.stringify(config, null, 2)}\n`);
  return config;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 3) throw new Error('Uso: node scripts/configure-newsletter.mjs URL_PUBLICA_DE_BREVO | --disable');
    const config = await configureNewsletter(process.argv[2]);
    console.log(`Registro ${config.enabled ? 'configurado' : 'desactivado'} localmente. Publica los cambios para aplicarlos en el dominio.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
