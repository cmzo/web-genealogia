#!/usr/bin/env node
// scripts/translate.js — Traduce posts de ES a FR usando la API de DeepL.
//
// Uso:
//   DEEPL_API_KEY=xxx node scripts/translate.js          # traduce todos los posts sin versión FR
//   DEEPL_API_KEY=xxx node scripts/translate.js --force  # re-traduce aunque ya exista .fr.md
//   DEEPL_API_KEY=xxx node scripts/translate.js mi-post.md  # traduce un post específico
//
// La clave va en .env (DEEPL_API_KEY=xxx:fx para el plan gratuito).
// El caché vive en content/.deepl-cache.json (ignorado por git).
// Los .fr.md generados sí se commitean — son la fuente de verdad.
// Agrega notranslate: true al frontmatter de un post para que el script lo ignore.

const fs     = require('fs');
const path   = require('path');
const https  = require('https');
const crypto = require('crypto');

// ── Config ────────────────────────────────────────────────────────────────────

const POSTS_DIR  = path.resolve(__dirname, '..', 'content', 'posts');
const CACHE_FILE = path.resolve(__dirname, '..', 'content', '.deepl-cache.json');

// Cargar .env si existe (sin dependencias externas)
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([A-Z_][A-Z_0-9]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  });
}

const API_KEY = process.env.DEEPL_API_KEY;
if (!API_KEY) {
  console.error('❌  Falta DEEPL_API_KEY.\n   Añadila a .env o exportala: export DEEPL_API_KEY=tu_clave');
  process.exit(1);
}

// El plan gratuito de DeepL usa api-free.deepl.com; el pago usa api.deepl.com.
// Las claves del plan gratuito terminan en ":fx".
const DEEPL_HOST = API_KEY.endsWith(':fx') ? 'api-free.deepl.com' : 'api.deepl.com';

// ── Caché ─────────────────────────────────────────────────────────────────────

const cache = (() => {
  try { return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); }
  catch { return {}; }
})();

function cacheKey(text) {
  return 'fr:' + crypto.createHash('sha1').update(text).digest('hex').slice(0, 16);
}

function saveCache() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

// ── DeepL HTTP ────────────────────────────────────────────────────────────────

function deeplPost(texts) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ text: texts, source_lang: 'ES', target_lang: 'FR' });
    const req = https.request({
      hostname: DEEPL_HOST,
      path: '/v2/translate',
      method: 'POST',
      headers: {
        'Authorization':  `DeepL-Auth-Key ${API_KEY}`,
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode !== 200)
          return reject(new Error(`DeepL ${res.statusCode}: ${data}`));
        resolve(JSON.parse(data).translations.map(t => t.text));
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Traduce un array de strings con caché; los textos vacíos se devuelven tal cual.
async function translateBatch(texts) {
  const results = new Array(texts.length).fill('');
  const pending = { texts: [], indices: [] };

  texts.forEach((text, i) => {
    if (!text.trim()) { results[i] = text; return; }
    const key = cacheKey(text);
    if (cache[key]) { results[i] = cache[key]; return; }
    pending.texts.push(text);
    pending.indices.push(i);
  });

  if (pending.texts.length > 0) {
    console.log(`  📡 DeepL: ${pending.texts.length} segmento(s) nuevos…`);
    const translated = await deeplPost(pending.texts);
    pending.indices.forEach((idx, j) => {
      results[idx] = translated[j];
      cache[cacheKey(texts[idx])] = translated[j];
    });
    saveCache();
  }

  return results;
}

// ── Extracción de bloques a preservar ────────────────────────────────────────
// Reemplaza bloques que NO deben traducirse con sentinelas {{BLOC_N}}.
// Los sentinelas son reconocidos como "variables de plantilla" por DeepL
// y quedan intactos en la respuesta.

const PATTERNS = [
  /```[\s\S]*?```/g,                                      // bloques de código/mermaid
  /<(details|style|script|iframe)(?: [^>]*)?>[\s\S]*?<\/\1>/g, // bloques HTML
  /!\[\[[^\]]+\]\]/g,                                     // ![[imagen.jpg]] de Obsidian
];

function extractBlocks(text) {
  const blocks = [];
  for (const re of PATTERNS) {
    text = text.replace(re, m => {
      const token = `{{BLOC_${blocks.length}}}`;
      blocks.push(m);
      return token;
    });
  }
  return { text, blocks };
}

function restoreBlocks(text, blocks) {
  return text.replace(/\{\{BLOC_(\d+)\}\}/g, (_, i) => blocks[+i] ?? _);
}

// ── Frontmatter ───────────────────────────────────────────────────────────────

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  m[1].split('\n').forEach(line => {
    const sep = line.indexOf(':');
    if (sep === -1) return;
    const k = line.slice(0, sep).trim();
    const v = line.slice(sep + 1).trim().replace(/^["']|["']$/g, '');
    meta[k] = v;
  });
  return { meta, body: m[2] };
}

function buildFrFrontmatter(esMeta, frFields) {
  const q = s => `"${(s || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  const lines = ['---'];
  lines.push(`title: ${q(frFields.title)}`);
  if (frFields.kicker)      lines.push(`kicker: ${q(frFields.kicker)}`);
  if (frFields.description) lines.push(`description: ${q(frFields.description)}`);
  // Campos que se copian tal cual del original
  ['image', 'category', 'date', 'tags', 'featured', 'slug'].forEach(k => {
    if (esMeta[k] != null) lines.push(`${k}: ${q(esMeta[k])}`);
  });
  lines.push(`lang: "fr"`);
  lines.push('---\n');
  return lines.join('\n');
}

// ── Traducción de un post ─────────────────────────────────────────────────────

async function translatePost(file, force = false) {
  const srcPath = path.join(POSTS_DIR, file);
  const outPath = path.join(POSTS_DIR, file.replace(/\.md$/, '.fr.md'));

  if (!force && fs.existsSync(outPath)) {
    console.log(`  ⏭  ${file.replace(/\.md$/, '.fr.md')} ya existe (--force para re-traducir)`);
    return;
  }

  const raw = fs.readFileSync(srcPath, 'utf8');
  const { meta, body } = parseFrontmatter(raw);

  if (meta.notranslate === 'true') {
    console.log(`  🚫 ${file} tiene notranslate:true — omitido`);
    return;
  }

  const { text: bodyClean, blocks } = extractBlocks(body);

  const [frTitle, frKicker, frDesc, frBody] = await translateBatch([
    meta.title || '',
    meta.kicker || '',
    meta.description || '',
    bodyClean,
  ]);

  const frontmatter = buildFrFrontmatter(meta, {
    title: frTitle,
    kicker: frKicker,
    description: frDesc,
  });
  const output = frontmatter + restoreBlocks(frBody, blocks);

  fs.writeFileSync(outPath, output);
  console.log(`  ✅ ${path.basename(outPath)}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args  = process.argv.slice(2);
  const force = args.includes('--force');
  const fileArg = args.find(a => a.endsWith('.md') && !a.startsWith('-'));

  const all     = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  const esPosts = all.filter(f => !f.match(/\.[a-z]{2}\.md$/));   // solo archivos sin sufijo de idioma
  const frSet   = new Set(all.filter(f => f.endsWith('.fr.md')).map(f => f.replace(/\.fr\.md$/, '.md')));

  let targets;
  if (fileArg) {
    targets = esPosts.filter(f => f === fileArg || f === path.basename(fileArg));
    if (targets.length === 0) { console.error(`❌ No se encontró: ${fileArg}`); process.exit(1); }
  } else {
    targets = force ? esPosts : esPosts.filter(f => !frSet.has(f));
  }

  if (targets.length === 0) {
    console.log('✅ Todos los posts ya tienen versión en francés. Usa --force para re-traducir.');
    return;
  }

  console.log(`🌐 Traduciendo ${targets.length} post(s) al francés:\n  ${targets.join('\n  ')}\n`);

  for (const file of targets) {
    console.log(`📄 ${file}`);
    await translatePost(file, force);
  }

  console.log('\n🎉 Listo. Ahora corré: npm run build');
}

main().catch(e => {
  console.error('❌', e.message);
  process.exit(1);
});
