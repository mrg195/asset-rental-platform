// Patch Vite to skip exec("net use") which triggers EPERM in sandboxed environments
import { readFileSync, writeFileSync } from 'node:fs';

const chunkPath = './node_modules/vite/dist/node/chunks/dep-Dm0c1Wj2.js';
let content = readFileSync(chunkPath, 'utf8');

const target = 'exec("net use", (error, stdout) => {';
const idx = content.indexOf(target);
if (idx === -1) {
  console.log('ERROR: target pattern not found in vite chunk');
  process.exit(1);
}

// Find the closing brace of the callback
let depth = 1;
let searchFrom = idx + target.length;
let closeIdx = -1;
while (searchFrom < content.length && closeIdx === -1) {
  const nextOpen = content.indexOf('{', searchFrom);
  const nextClose = content.indexOf('}', searchFrom);
  if (nextClose === -1) break;
  if (nextOpen !== -1 && nextOpen < nextClose) {
    depth++;
    searchFrom = nextOpen + 1;
  } else {
    depth--;
    if (depth === 0) {
      closeIdx = nextClose;
    }
    searchFrom = nextClose + 1;
  }
}

if (closeIdx === -1) {
  console.log('ERROR: could not find closing brace');
  process.exit(1);
}

const before = content.substring(0, idx);
const after = content.substring(closeIdx + 1);
const replacement = 'safeRealpathSync = fs__default.realpathSync.native;';
const newContent = before + replacement + after;

writeFileSync(chunkPath, newContent);
console.log('OK: patched vite chunk - skipped exec("net use") spawn');
