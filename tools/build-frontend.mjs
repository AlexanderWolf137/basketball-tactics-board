// Prepares src-tauri/frontend with ONLY the files the app needs, so private
// files (agent.md, handover notes, ...) never get embedded into the exe.
// Run: node tools/build-frontend.mjs
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
execFileSync(process.execPath, [join(root, 'tools', 'build-tactics-library.mjs')], { stdio: 'inherit' });

const dist = join(root, 'src-tauri', 'frontend');
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(join(root, 'index.html'), join(dist, 'index.html'));
cpSync(join(root, 'tactics-library.js'), join(dist, 'tactics-library.js'));
cpSync(join(root, 'vendor'), join(dist, 'vendor'), { recursive: true });
console.log('frontend ready:', dist);