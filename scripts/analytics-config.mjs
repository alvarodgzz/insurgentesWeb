import { lstat, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DEFAULT_ANALYTICS, validateAnalytics } from '../js/analytics-render.mjs';

export async function readAnalytics(root) {
  const path = join(root, 'content', 'analytics.json');
  try {
    if ((await lstat(join(root, 'content'))).isSymbolicLink() || (await lstat(path)).isSymbolicLink()) throw new Error('La configuración de estadísticas no admite enlaces simbólicos.');
    return validateAnalytics(JSON.parse(await readFile(path, 'utf8')));
  } catch (error) {
    if (error.code === 'ENOENT') return { ...DEFAULT_ANALYTICS };
    throw error;
  }
}
