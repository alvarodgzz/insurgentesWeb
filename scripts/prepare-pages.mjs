import { copyFile, lstat, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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
    const output = await preparePages();
    console.log(`GitHub Pages files prepared in ${output}`);
  } catch (error) {
    console.error(`Could not prepare GitHub Pages: ${error.message}`);
    process.exitCode = 1;
  }
}
