import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { cp, mkdir, mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repository =
  process.env.MAN_DOCS_REPOSITORY ??
  'https://github.com/duorua/narutomobile.git';
const ref = process.env.MAN_DOCS_REF?.trim();
const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const docsDir = path.join(repoRoot, 'docs');
const protectedEntries = new Set(['_nav.json', 'index.md', 'public']);

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(' ')} exited with ${result.status}`,
    );
  }
}

function getGitValue(checkoutDir, args) {
  const result = spawnSync('git', ['-C', checkoutDir, ...args], {
    encoding: 'utf8',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || 'git command failed');
  }

  return result.stdout.trim();
}

async function syncDocs() {
  const tempDir = await mkdtemp(path.join(tmpdir(), 'man-docs-sync-'));
  const checkoutDir = path.join(tempDir, 'narutomobile');

  try {
    const cloneArgs = [
      'clone',
      '--depth',
      '1',
      '--filter=blob:none',
      '--sparse',
      '--single-branch',
    ];

    if (ref) {
      cloneArgs.push('--branch', ref);
    }

    cloneArgs.push(repository, checkoutDir);

    console.log(`Fetching docs from ${repository}${ref ? ` (${ref})` : ''}`);
    run('git', cloneArgs);
    run('git', ['-C', checkoutDir, 'sparse-checkout', 'set', 'docs']);

    const sourceDocsDir = path.join(checkoutDir, 'docs');

    if (!existsSync(sourceDocsDir)) {
      throw new Error(
        'The upstream repository does not contain a docs directory',
      );
    }

    const sourceEntries = await readdir(sourceDocsDir, { withFileTypes: true });
    const managedSourceEntries = sourceEntries.filter(
      (entry) => !protectedEntries.has(entry.name),
    );
    await mkdir(docsDir, { recursive: true });

    for (const entry of managedSourceEntries) {
      const source = path.join(sourceDocsDir, entry.name);
      const target = path.join(docsDir, entry.name);

      await cp(source, target, { force: true, recursive: true });
      console.log(`Synced docs/${entry.name}`);
    }

    const revision = getGitValue(checkoutDir, ['rev-parse', 'HEAD']);
    console.log(`Synced upstream revision ${revision}`);
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }
}

syncDocs().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
