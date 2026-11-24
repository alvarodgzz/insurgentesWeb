import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareLandingPages, preparePrivatePages } from './private-preview.mjs';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Eligible resource roots, not directories to copy recursively. The public
// builder follows only referenced assets and the statistics entry exception.
export const publicDirectories = Object.freeze([
  'assets', 'css', 'js', 'images', 'content/photos', 'admin/estadisticas',
]);

export async function preparePages(sourceRoot = projectRoot, options = {}) {
  const { preparePublicPages } = await import('./public-pages.mjs');
  return preparePublicPages(sourceRoot, options);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const launch = process.argv.includes('--public');
    const gated = process.argv.includes('--gated');
    const signupOnly = process.argv.includes('--signup-only');
    if ([launch, gated, signupOnly].filter(Boolean).length > 1) throw new Error('Choose only one Pages mode');
    let password;
    if (gated || signupOnly) {
      password = process.env.PREVIEW_PASSWORD;
      if (!password && !process.env.CI) {
        try { password = (await readFile(join(projectRoot, '.env.preview-password'), 'utf8')).replace(/\r?\n$/, ''); }
        catch (error) { if (error.code !== 'ENOENT') throw error; }
      }
    }
    const prepare = gated ? preparePrivatePages : signupOnly ? prepareLandingPages : preparePages;
    const output = await prepare(projectRoot, { password, siteUrl: process.env.SITE_URL });
    console.log(`${gated ? 'Password-protected previews' : signupOnly ? 'Public signup and password-protected band site' : 'Public Maratón banner, band site and optional signup'} prepared in ${output}`);
  } catch (error) {
    console.error(`Could not prepare GitHub Pages: ${error.message}`);
    process.exitCode = 1;
  }
}
