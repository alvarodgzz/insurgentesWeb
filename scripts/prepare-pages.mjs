import { copyFile, lstat, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareLandingPages, preparePrivatePages } from './private-preview.mjs';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Deliberately publish an allowlist, never the entire repository.
export const publicDirectories = Object.freeze([
  'assets', 'css', 'js', 'images', 'content', 'admin', 'templates',
]);

async function copyPublicEntry(source, destination) {
  const entry = await lstat(source);
  if (entry.isSymbolicLink()) {
    throw new Error(`Public files must not contain symbolic links: ${source}`);
  }
  if (entry.isDirectory()) {
    await mkdir(destination, { recursive: true });
    for (const name of (await readdir(source)).sort()) {
      if (name.startsWith('.')) continue;
      await copyPublicEntry(join(source, name), join(destination, name));
    }
    return;
  }
  if (!entry.isFile()) {
    throw new Error(`Unsupported public file: ${source}`);
  }
  await copyFile(source, destination);
}

export async function preparePages(sourceRoot = projectRoot) {
  const root = resolve(sourceRoot);
  const output = join(root, '_site');
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  await copyPublicEntry(join(root, 'index.html'), join(output, 'index.html'));
  for (const directory of publicDirectories) {
    await copyPublicEntry(join(root, directory), join(output, directory));
  }
  await writeFile(join(output, '.nojekyll'), '');
  return output;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    let password = process.env.PREVIEW_PASSWORD;
    if (!password && !process.env.CI) {
      try { password = (await readFile(join(projectRoot, '.env.preview-password'), 'utf8')).replace(/\r?\n$/, ''); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    const launch = process.argv.includes('--public');
    const gated = process.argv.includes('--gated');
    if (launch && gated) throw new Error('Choose either --public or --gated, not both');
    const prepare = launch ? preparePages : gated ? preparePrivatePages : prepareLandingPages;
    const output = await prepare(projectRoot, { password, siteUrl: process.env.SITE_URL });
    console.log(`${launch ? 'Full public website' : gated ? 'Password-protected previews' : 'Public Maratón signup and password-protected band access'} prepared in ${output}`);
  } catch (error) {
    console.error(`Could not prepare GitHub Pages: ${error.message}`);
    process.exitCode = 1;
  }
}
