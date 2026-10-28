import { lstat, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DEFAULT_NEWSLETTER, validateNewsletter } from '../js/newsletter-render.mjs';

export async function readNewsletter(root) {
  const path = join(root, 'content', 'newsletter.json');
  try {
    if ((await lstat(join(root, 'content'))).isSymbolicLink() || (await lstat(path)).isSymbolicLink()) throw new Error('La configuración de la lista no admite enlaces simbólicos.');
    return validateNewsletter(JSON.parse(await readFile(path, 'utf8')));
  } catch (error) {
    if (error.code === 'ENOENT') return { ...DEFAULT_NEWSLETTER };
    throw error;
  }
}
