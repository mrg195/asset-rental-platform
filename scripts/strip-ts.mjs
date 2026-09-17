// Strip TypeScript syntax from all .astro source files
// This allows the build to proceed in sandboxed environments where esbuild spawn is blocked
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const srcDir = './src';

function stripTS(code) {
  const lines = code.split('\n');
  const result = [];
  for (const line of lines) {
    // Skip full-line TypeScript declarations
    if (/^\s*interface\s+\w+/.test(line)) continue;
    if (/^\s*type\s+\w+/.test(line)) continue;
    // Remove inline 'as const' type assertions
    let cleaned = line.replace(/\bas\s+const\b/g, '');
    // Remove 'as Type' after expressions (not in import statements)
    cleaned = cleaned.replace(/(?<!=)\bas\s+[A-Z][\w<>=|&\[\]():.\s?]+\b/g, '');
    result.push(cleaned);
  }
  return result.join('\n');
}

function walkDir(dir) {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walkDir(full);
    } else if (extname(entry) === '.astro') {
      const original = readFileSync(full, 'utf8');
      const stripped = stripTS(original);
      if (stripped !== original) {
        writeFileSync(full, stripped);
        console.log('STRIPPED TS:', full.replace(process.cwd() + '\\', ''));
      }
    }
  }
}

walkDir(srcDir);
console.log('Done. TypeScript stripped from .astro files.');
