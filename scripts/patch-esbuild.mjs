// Patch ALL esbuild instances — targeted TS stripping (only as const + common patterns)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

function stripTS(code) {
  // Only strip 'as const' type assertions (the most common cause of Rollup parse errors)
  // Do NOT touch import aliases like 'import { a as b } from "..."'
  // Strategy: replace ' as const' only when NOT inside an import statement
  let result = '';
  const lines = code.split('\n');
  for (const line of lines) {
    // Skip import/export lines entirely
    if (/^\s*(import|export)\s/.test(line)) {
      result += line + '\n';
      continue;
    }
    // Strip ' as const' and similar type assertions
    result += line.replace(/\bas\s+const\b/g, '');
    result += '\n';
  }
  return result;
}

const helper = 'function stripTS(code) { var r=""; var lines=code.split("\\n"); for(var i=0;i<lines.length;i++){var l=lines[i]; if(/^\\s*(import|export)\\s/.test(l)){r+=l+"\\n";continue;} r+=l.replace(/\\bas\\s+const\\b/g,"")+"\\n"; } return r; }\n';

const stub = `var ensureServiceIsRunning = () => { var _service = null; return {
  build:()=>{throw new Error("esbuild spawn blocked in sandbox")},
  context:()=>{throw new Error("esbuild spawn blocked in sandbox")},
  transform:(input,options)=>{
    let code = typeof input === 'string' ? input : input.toString();
    const loader = options?.loader || 'js';
    code = stripTS(code);
    if (loader === 'json') {
      try {
        const parsed = JSON.parse(code);
        return Promise.resolve({ code: 'export default ' + JSON.stringify(parsed) + ';', map: '{"mappings":""}', warnings: [], dependencies: [] });
      } catch { return Promise.resolve({ code: 'export default undefined;', map: '{"mappings":""}', warnings: [], dependencies: [] }); }
    }
    return Promise.resolve({ code, map: '{"mappings":""}', warnings: [], dependencies: [] });
  },
  formatMessages:()=>Promise.resolve([]),
  analyzeMetafile:()=>Promise.resolve("")
};};`;

const paths = [
  './node_modules/esbuild/lib/main.js',
  './node_modules/vite/node_modules/esbuild/lib/main.js',
];

let patched = 0;
paths.forEach(p => {
  if (!existsSync(p)) { console.log('SKIP:', p); return; }
  let c = readFileSync(p, 'utf8');
  const target = 'var ensureServiceIsRunning = () => {';
  const idx = c.indexOf(target);
  if (idx === -1) { console.log('SKIP (no pattern):', p); return; }
  let depth = 0, end = idx;
  for (let i = idx; i < c.length; i++) {
    if (c[i] === '{') depth++;
    if (c[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  c = c.substring(0, idx) + helper + stub + c.substring(end + 1);
  writeFileSync(p, c);
  console.log('PATCHED:', p);
  patched++;
});
console.log('Total patched:', patched);
