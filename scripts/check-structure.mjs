import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const MAX_FILES_PER_DIR = 8;
const LIMITS = [
  { match: /^app\/.*\.tsx$/, max: 60, label: 'route (app/)' },
  { match: /^src\/ui\/.*\.tsx$/, max: 150, label: 'ui component' },
  { match: /^(src|mock-api)\/.*\.[tj]sx?$/, max: 200, label: 'logic' },
];

const SKIP_DIRS = new Set(['node_modules', '.expo', '.git', 'dist', 'coverage', 'android', 'ios', '.idea', '.vscode']);
const SKIP_FILES = new Set(['package-lock.json']);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.[tj]sx?$/.test(entry) && !SKIP_FILES.has(entry)) out.push(full);
  }
  return out;
}

function countEffectiveLines(file) {
  const text = readFileSync(file, 'utf8');
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l !== '' && !l.startsWith('//')).length;
}

function checkFilesPerDir(files) {
  const byDir = new Map();
  for (const f of files) {
    const rel = relative(ROOT, f).replace(/\\/g, '/');
    const dir = rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/')) : '.';
    if (!byDir.has(dir)) byDir.set(dir, []);
    byDir.get(dir).push(rel);
  }
  const violations = [];
  for (const [dir, list] of byDir) {
    if (list.length > MAX_FILES_PER_DIR) {
      violations.push(`${dir}: ${list.length} fisiere (max ${MAX_FILES_PER_DIR}). Sparge in subfoldere pe responsabilitate.`);
    }
  }
  return violations;
}

function checkLines(files) {
  const violations = [];
  for (const f of files) {
    const rel = relative(ROOT, f).replace(/\\/g, '/');
    const rule = LIMITS.find((r) => r.match.test(rel));
    if (!rule) continue;
    const lines = countEffectiveLines(f);
    if (lines > rule.max) {
      violations.push(`${rel}: ${lines} linii efective (max ${rule.max}, ${rule.label}). Sparge fisierul.`);
    }
  }
  return violations;
}

const files = walk(ROOT);
const violations = [...checkFilesPerDir(files), ...checkLines(files)];

if (violations.length > 0) {
  console.error('check-structure FAILED:');
  for (const v of violations) console.error(` - ${v}`);
  process.exit(1);
}

console.log(`check-structure OK: ${files.length} fisiere verificate, max ${MAX_FILES_PER_DIR}/folder respectat.`);
