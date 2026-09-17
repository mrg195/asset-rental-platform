// Patch Astro sync to skip type generation when esbuild spawn is blocked (sandbox)
import { readFileSync, writeFileSync } from 'node:fs';

const syncJs = './node_modules/astro/dist/core/sync/index.js';
let content = readFileSync(syncJs, 'utf8');

// Find the catch block and add spawn error handling
const oldCatch = `  } catch (e) {
    const safeError = createSafeError(e);
    if (isAstroError(e)) {
      throw e;
    }`;

const newCatch = `  } catch (e) {
    const safeError = createSafeError(e);
    if (isAstroError(e)) {
      throw e;
    }
    // Sandbox patch: skip type generation if esbuild spawn is blocked
    if (safeError.message && (safeError.message.includes('spawn') || safeError.message.includes('EPERM'))) {
      logger.warn('sync', 'Skipping content type generation (spawn blocked): ' + safeError.message);
      return;
    }`;

if (content.includes(oldCatch)) {
  content = content.replace(oldCatch, newCatch);
  writeFileSync(syncJs, content);
  console.log('OK: patched astro sync catch block to handle spawn errors');
} else {
  console.log('ERROR: could not find catch block pattern');
  // Show actual content around line 220
  const lines = content.split('\n');
  lines.slice(218, 228).forEach((l,i) => console.log(218+i+1+': '+l));
  process.exit(1);
}
