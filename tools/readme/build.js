// node build.js OUT_DIR  — renders the README images through the local server
const { chromium } = require(process.env.PLAYWRIGHT_CORE_MODULE || 'playwright-core'); const fs = require('fs'); const path = require('path');
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const save = (n, d) => fs.writeFileSync(path.join(out, n), Buffer.from(d.split(',')[1], 'base64'));
const TILES = [
  ['kelikamera', 'Kelikamera AI', 'Road conditions from road weather cameras', '2026  ·  in progress'],
  ['havain', 'Havain', 'Grocery shelves as structured data', '2026  ·  in progress'],
  ['korislab', 'KorisLab', 'Finnish basketball data, made readable', '2026'],
  ['peluutin', 'Peluutin', 'Playing time and drills for junior coaches', '2026  ·  in use'],
  ['helsinki-sports-map', 'Helsinki Sports Map', 'Sports venues and how to get there', '2026'],
  ['tahti', 'Tahti', 'Reading one word at a time', '2026'],
];
const STACK = [
  ['design', [['Figma', 'figma'], ['Paper Design', 'paper']]],
  ['languages', [['TypeScript', 'typescript'], ['Python', 'python'], ['SQL', 'db']]],
  ['frontend', [['React', 'react'], ['Astro', 'astro'], ['React Native', 'react'], ['Three.js', 'threedotjs'], ['MapLibre GL', 'maplibre']]],
  ['agents / ai', [['Claude Code', 'claude'], ['Codex', 'openai'], ['MCP', 'modelcontextprotocol'], ['Herdr', 'herdr'], ['PyTorch', 'pytorch'], ['Hugging Face', 'huggingface']]],
  ['infra', [['Vercel', 'vercel'], ['GitHub Actions', 'githubactions'], ['Supabase', 'supabase'], ['PostHog', 'posthog']]],
  ['learning', [['Databricks', 'databricks']]],
];
(async () => { const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://localhost:8097/tools/readme/render.html', { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.evaluate(() => Promise.all(Object.values(IMG).map((i) => i.decode()))); await p.waitForTimeout(300);
  save('header.png', await p.evaluate(() => header()));
  for (const [slug, name, line, meta] of TILES) save(`${slug}.png`, await p.evaluate(([n, l, m]) => tile(n, l, m), [name, line, meta]));
  save('stack.png', await p.evaluate((r) => stack(r), STACK));
  console.log(fs.readdirSync(out).map(f => f + ' ' + (fs.statSync(path.join(out, f)).size / 1024 | 0) + 'KB').join('\n'));
  await b.close(); })();
