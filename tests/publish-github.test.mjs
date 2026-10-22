import test from 'node:test';
import assert from 'node:assert/strict';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

const head = '9910443000000000000000000000000000000000';

// Fake all publishing commands in a disposable project. No real repository,
// credentials, network calls, or website builds are used by these flow tests.
const fakeCommand = `#!${process.execPath}
const fs = require('node:fs');
const name = require('node:path').basename(process.argv[1]);
const args = process.argv.slice(2);
fs.appendFileSync(process.env.PUBLISH_TEST_LOG, JSON.stringify({ name, args }) + '\\n');
const print = value => process.stdout.write(value + '\\n');
const head = ${JSON.stringify(head)};
const mode = process.env.PUBLISH_TEST_MODE;
if (name === 'node') process.exit(0);
if (name === 'gh') {
  if (args.includes('user')) print('alvarodgzz');
  else if (args[0] === 'repo' && args[1] === 'view') print('alvarodgzz/insurgentesWeb');
  else if (args.some(arg => arg.endsWith('/pages'))) print('workflow');
  process.exit(0);
}
const plain = args.slice();
while (plain[0] === '-c') plain.splice(0, 2);
switch (plain[0]) {
  case 'rev-parse':
    print(plain.includes('--show-toplevel') ? process.cwd() : plain.includes('--is-inside-work-tree') ? 'true' : head);
    break;
  case 'symbolic-ref': print('main'); break;
  case 'remote': print('https://github.com/alvarodgzz/insurgentesWeb.git'); break;
  case 'config': print(plain.includes('user.email') ? 'test@example.invalid' : 'Test'); break;
  case 'push': {
    const compatibility = args.includes('http.version=HTTP/1.1') && args.includes('http.postBuffer=67108864');
    if (mode === 'unrelated') {
      process.stderr.write('! [rejected] main -> main (non-fast-forward)\\n');
      process.exit(1);
    }
    if (!compatibility || mode === 'permanent') {
      process.stderr.write('error: RPC failed; HTTP 400 curl 22 The requested URL returned error: 400\\nfatal: the remote end hung up unexpectedly\\n');
      process.exit(1);
    }
    break;
  }
  case 'ls-remote': print((mode === 'mismatch' ? '0'.repeat(40) : head) + '\\trefs/heads/main'); break;
}
`;

async function publishFixture(mode, run) {
  const root = await mkdtemp(join(tmpdir(), 'insurgentes-publish-test-'));
  try {
    const bin = join(root, 'bin');
    const log = join(root, 'commands.jsonl');
    await mkdir(bin);
    await mkdir(join(root, 'scripts'));
    await mkdir(join(root, 'tests'));
    await copyFile(new URL('../scripts/publish-github.sh', import.meta.url), join(root, 'scripts/publish-github.sh'));
    for (const name of ['git', 'gh', 'node']) await writeFile(join(bin, name), fakeCommand, { mode: 0o755 });
    const result = spawnSync('/bin/bash', [join(root, 'scripts/publish-github.sh')], {
      encoding: 'utf8',
      timeout: 15000,
      env: { ...process.env, PATH: `${bin}:/usr/bin:/bin`, PUBLISH_TEST_LOG: log, PUBLISH_TEST_MODE: mode },
    });
    const calls = (await readFile(log, 'utf8')).trim().split('\n').map(line => JSON.parse(line));
    await run(result, calls);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

const pushes = calls => calls.filter(call => call.name === 'git' && call.args.includes('push'));
const pagesCalls = calls => calls.filter(call => call.name === 'gh' && (call.args.includes('workflow') || call.args.some(arg => arg.endsWith('/pages'))));

test('publishing recovers from HTTP 400 and verifies remote main before Pages setup', async () => {
  await publishFixture('recover', (result, calls) => {
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.equal(pushes(calls).length, 2);
    assert.ok(pushes(calls)[1].args.includes('http.version=HTTP/1.1'));
    assert.ok(pushes(calls)[1].args.includes('http.postBuffer=67108864'));
    assert.ok(pushes(calls).every(call => !call.args.includes('--force') && !call.args.includes('-f')));
    const verifiedAt = calls.findIndex(call => call.name === 'git' && call.args.includes('ls-remote'));
    const pagesAt = calls.findIndex(call => pagesCalls([call]).length);
    assert.ok(verifiedAt >= 0 && pagesAt > verifiedAt);
    assert.ok(calls.some(call => call.name === 'gh' && call.args[0] === 'workflow' && call.args[1] === 'run'));
  });
});

for (const [mode, count] of [['permanent', 2], ['mismatch', 2], ['unrelated', 1]]) {
  test(`publishing stops before Pages when ${mode === 'permanent' ? 'the compatibility push also fails' : mode === 'mismatch' ? 'remote main differs from local HEAD' : 'the push fails for an unrelated reason'}`, async () => {
    await publishFixture(mode, (result, calls) => {
      assert.notEqual(result.status, 0, result.stdout + result.stderr);
      assert.equal(pushes(calls).length, count);
      assert.equal(pagesCalls(calls).length, 0);
    });
  });
}
