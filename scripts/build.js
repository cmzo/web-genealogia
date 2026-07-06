#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { execFileSync } = require('child_process');
const {
  extractFrontMatter, processCallouts, processMermaid, configureMarked, headingId,
} = require('./lib/markdown');

// Configuración
const BASE_URL = 'https://cmzo.net';
const DEFAULT_OG_IMAGE = `${BASE_URL}/assets/images/cards/og-banner.webp`;
const POSTS_DIR = './content/posts';
const TEMPLATE_FILE = './content/templates/post-template.html';
const OUTPUT_DIR = './dist/blog';
const BLOG_ENTRIES_FILE = './assets/data/blog-entries.json';

// Área "lab" (experimentos / writeups). Mismo patrón que el blog.
const LAB_DIR = './content/lab';
const LAB_OUTPUT_DIR = './dist/lab';
const LAB_ENTRIES_FILE = './assets/data/lab-entries.json';

// Notas / momentos: entradas cortas (texto, foto o enlace) que NO generan página;
// se renderizan en un modal desde la bitácora de la home.
const NOTAS_DIR = './content/notas';
const NOTAS_FILE = './assets/data/notas.json';

// La bitácora también consume el changelog (la página changelog.html queda igual).
const CHANGELOG_MD = './content/changelog.md';
const CHANGELOG_ENTRIES_FILE = './assets/data/changelog-entries.json';

// Logs de diagnóstico (galerías, etc.) solo con --verbose / -v
const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');

// Asegurar que existe el directorio de salida
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Leer el template
const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');

// Front matter, callouts, mermaid y renderer de marked viven en lib/markdown.js
// (compartidos con build-wiki.js).

// ── Hypothesis Cards ─────────────────────────────────────────────────────────

function processHypotheses(html) {
  const STATUS_MAP = [
    { test: s => s.includes('Confirmado informalmente') || s.includes('Confirmée informellement'), cls: 'confirmed-informal' },
    { test: s => s.includes('Confirmado') || s.includes('Confirmée'), cls: 'confirmed' },
    { test: s => s.includes('sólida') || s.includes('solide'),        cls: 'solida' },
    { test: s => s.includes('plausible'),                             cls: 'plausible' },
    { test: () => true,                                               cls: 'speculative' },
  ];

  return html.replace(
    /<h3 id="(h(\d+)[^"]*)">([\s\S]*?)<\/h3>\n([\s\S]*?)(?=<hr>|<h2 )/g,
    (match, fullId, hNum, h3Inner, body) => {
      const isDirecta = h3Inner.includes('`rama-directa`');
      const cleanTitle = h3Inner.replace(/`rama-directa`/g, '').trim();

      const tdMatch = body.match(/<td>([\s\S]*?)<\/td>/);
      const estado = tdMatch
        ? tdMatch[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim()
        : '';

      const { cls: statusClass } = STATUS_MAP.find(({ test }) => test(estado));

      return `<div class="hypothesis-card hypothesis-card--${statusClass}${isDirecta ? ' hypothesis-card--directa' : ''}" id="${fullId}">
  <div class="hypothesis-header">
    <div class="hypothesis-meta">
      <span class="hypothesis-number">H${hNum}</span>${isDirecta ? '\n      <span class="hypothesis-badge-directa">★ Rama directa</span>' : ''}
    </div>
    <span class="hypothesis-status hypothesis-status--${statusClass}">${estado}</span>
  </div>
  <h3 class="hypothesis-title">${cleanTitle}</h3>
  <div class="hypothesis-body">${body}</div>
</div>
`;
    }
  );
}

// Función para convertir Markdown a HTML
function markdownToHtml(markdown) {
  marked.setOptions({ breaks: true, gfm: true });
  configureMarked();   // heading con id + tabla con .table-wrapper (lib/markdown.js)

  // Preservar HTML personalizado antes de procesar con marked
  const htmlPlaceholders = [];
  let htmlIndex = 0;
  
  // Reemplazar HTML personalizado con placeholders
  markdown = markdown.replace(/<iframe[^>]*>.*?<\/iframe>/gs, (match) => {
    const placeholder = `<!-- HTML_PLACEHOLDER_${htmlIndex} -->`;
    htmlPlaceholders[htmlIndex] = match;
    htmlIndex++;
    return placeholder;
  });
  
  // Convertir sintaxis de Obsidian ![[imagen.jpg]] a Markdown estándar ANTES de procesar
  markdown = markdown.replace(/!\[\[([^\]]+)\]\]/g, (match, filename) => {
    // Extraer solo el nombre del archivo sin extensión para el alt text
    const altText = filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ');
    if (VERBOSE) console.log(`🔄 Convirtiendo Obsidian: ${match} → ![${altText}](../../assets/images/posts/${filename})`);
    return `![${altText}](../../assets/images/posts/${filename})`;
  });
  
  // Highlights de Obsidian: ==texto== → <mark>texto</mark>
  markdown = markdown.replace(/==([^=\n]+)==/g, '<mark>$1</mark>');

  // Procesar el markdown actualizado
  let html = marked(markdown);

  // Procesar callouts de Obsidian
  html = processCallouts(html);

  // Convertir bloques de hipótesis en tarjetas visuales
  html = processHypotheses(html);

  // Procesar bloques Mermaid: ```mermaid → <div class="mermaid"> (estilo en styles.css)
  const mermaidResult = processMermaid(html);
  html = mermaidResult.html;
  const hasMermaid = mermaidResult.hasMermaid;

  // Imágenes: corregir rutas y lazy-load. El estilo lo pone styles.css
  // (.article-content figure img) — sin estilos inline.
  html = html.replace(
    /<img src="([^"]+)" alt="([^"]*)"/g,
    (match, src, alt) => {
      // Corregir rutas relativas para que funcionen desde /dist/blog/
      let correctedSrc = src;
      if (src.startsWith('img/')) {
        correctedSrc = '../../assets/images/cards/' + src.replace('img/', '');
      }
      return `<img src="${correctedSrc}" alt="${alt}" loading="lazy"`;
    }
  );

  // Corregir enlaces a páginas raíz (wiki.html, arbol.html, lab-grafo.html, …) para que
  // funcionen desde /dist/blog/: les antepone ../../. Ignora absolutos, anclas y rutas ya relativas.
  html = html.replace(
    /href="(?!https?:|\/\/|\/|#|\.\.?\/|mailto:)([^"]+\.html[^"]*)"/g,
    'href="../../$1"'
  );

  // Corregir rutas en HTML personalizado
  html = html.replace(
    /src="img\//g,
    'src="../../assets/images/cards/'
  );
  
  // ── Figuras y galerías (semántico; estilos en styles.css, lightbox compartido
  //    vía post-template.html) ──────────────────────────────────────────────────
  const toFigure = (img, caption) =>
    `<figure class="article-image">${img}${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;

  // Todo <p> que contenga imágenes se descompone en segmentos separados por <br>
  // (con breaks:true, "![[img]]\n*pie*\ntexto" es UN párrafo): cada imagen se vuelve
  // <figure>; si el segmento siguiente es una línea entera en cursiva, es su pie;
  // el texto restante se re-emite como párrafo. Los patrones quedan acotados al
  // párrafo — nunca cruzan a otros elementos.
  html = html.replace(/<p>((?:(?!<\/p>)[\s\S])*?<img[^>]+>(?:(?!<\/p>)[\s\S])*?)<\/p>/g, (m, inner) => {
    const parts = inner.split(/\s*<br>\s*/);
    const out = [];
    let buf = [];
    const flush = () => { if (buf.length) { out.push(`<p>${buf.join('<br>')}</p>`); buf = []; } };
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (!part) continue;
      if (/^<img[^>]+>$/.test(part)) {
        const cap = (parts[i + 1] || '').trim().match(/^<em>([\s\S]+)<\/em>$/);
        flush();
        out.push(toFigure(part, cap ? cap[1] : ''));
        if (cap) i++;
      } else {
        buf.push(part);
      }
    }
    flush();
    return out.join('\n');
  });

  // Galería: 2+ figuras consecutivas SIN pie → grid (estilos en .image-gallery)
  html = html.replace(
    /(?:<figure class="article-image"><img[^>]+><\/figure>\s*){2,}/g,
    match => {
      const figs = match.match(/<figure class="article-image"><img[^>]+><\/figure>/g) || [];
      if (VERBOSE) console.log(`📸 Galería detectada con ${figs.length} imágenes`);
      return `<div class="image-gallery">\n${figs.join('\n')}\n</div>`;
    }
  );

  // (El lightbox es el compartido —assets/js/lightbox.js— y lo carga el template;
  //  los estilos de figuras, galerías e hipótesis viven en styles.css.)

  // Restaurar HTML personalizado
  htmlPlaceholders.forEach((placeholder, index) => {
    html = html.replace(`<!-- HTML_PLACEHOLDER_${index} -->`, placeholder);
  });
  
  // Corregir rutas de iframes para mapas (después de restaurar HTML personalizado)
  html = html.replace(
    /src="mapa-francisco-embed\.html"/g,
    'src="../../mapa-francisco-embed.html"'
  );

  if (hasMermaid) {
    // Mermaid vendoreado (sin CDN), con el tema según el modo día/noche actual
    html += '\n<script src="../../assets/js/vendor/mermaid.min.js"><\/script>\n<script>mermaid.initialize({ startOnLoad: true, theme: document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "neutral" });<\/script>';
  }

  return html;
}

// ── Internacionalización (i18n) ──────────────────────────────────────────────
// Las traducciones son archivos `<slug>.<lang>.md` (ej. `la-ruina.fr.md`).
// El idioma por defecto (es) conserva su URL `<slug>.html`; las traducciones
// salen como `<slug>.<lang>.html`. No aparecen como entradas separadas en el índice.
const LANGS = ['es', 'fr', 'en'];           // orden en el selector
const DEFAULT_LANG = 'es';
const LANG_LABEL = { es: 'ES', fr: 'FR', en: 'EN' };
const LANG_NAME  = { es: 'Español', fr: 'Français', en: 'English' };

// 'slug.fr.md' -> {baseName:'slug', lang:'fr'} · 'slug.md' -> {baseName:'slug', lang:'es'}
function parseLang(file) {
  const base = file.replace(/\.md$/, '');
  const m = base.match(/^(.+)\.([a-z]{2})$/);
  if (m && LANGS.includes(m[2]) && m[2] !== DEFAULT_LANG) return { baseName: m[1], lang: m[2] };
  return { baseName: base, lang: DEFAULT_LANG };
}

// Selector de idioma para un grupo (vacío si el post existe en un solo idioma)
function langSelectorHtml(group, currentLang) {
  const present = LANGS.filter(l => group.out[l]);
  if (present.length < 2) return '';
  const globe = '<svg class="lang-globe" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18"/></svg>';
  const items = present.map(l => l === currentLang
    ? `<span class="lang-opt is-active" aria-current="true">${LANG_LABEL[l]}</span>`
    : `<a class="lang-opt" href="${group.out[l]}" hreflang="${l}" title="${LANG_NAME[l]}">${LANG_LABEL[l]}</a>`
  ).join('');
  return `<nav class="lang-selector" aria-label="Idioma del artículo"><span class="lang-pillbox">${globe}${items}</span></nav>`;
}

// Renderiza un post (metadata + markdown ya extraídos) y lo escribe en disco
function renderPost(metadata, markdownContent, ctx) {
  const strippedContent = markdownContent.replace(/^\s*#\s+[^\n]+\n+/, '');
  const htmlContent = markdownToHtml(strippedContent);
  const asideContent = metadata.aside ? markdownToHtml(metadata.aside) : '';

  const description = metadata.description || '';
  const rawImage = metadata.image || '';
  const ogImage = rawImage
    ? (rawImage.startsWith('http') ? rawImage : `${BASE_URL}/${rawImage.replace(/^\//, '')}`)
    : DEFAULT_OG_IMAGE;
  const canonical = `${BASE_URL}/dist/blog/${ctx.outputName}`;

  const html = template
    .replace(/\{\{lang\}\}/g, ctx.lang)
    .replace(/\{\{langselector\}\}/g, ctx.langSelector)
    .replace(/\{\{title\}\}/g, metadata.title)
    .replace(/\{\{kicker\}\}/g, metadata.kicker)
    .replace(/\{\{description\}\}/g, description)
    .replace(/\{\{canonical\}\}/g, canonical)
    .replace(/\{\{ogimage\}\}/g, ogImage)
    .replace(/\{\{date\}\}/g, metadata.date || '—')
    .replace(/\{\{content\}\}/g, htmlContent)
    .replace(/\{\{aside\}\}/g, asideContent);

  fs.writeFileSync(path.join(OUTPUT_DIR, ctx.outputName), html);
  console.log(`✅ Generado: ${path.join(OUTPUT_DIR, ctx.outputName)}`);
}

function buildArbolData() {
  try {
    execFileSync('python3', [path.join(__dirname, 'export_arbol.py')], { stdio: 'inherit' });
  } catch (e) {
    console.warn('⚠️  export_arbol.py falló — se usará el arbol.json existente');
  }
}

// ── Lab (área de experimentos) ───────────────────────────────────────────────
// Cada `content/lab/*.md` es una entrada del área. `kind: tool` (o con `url:`) solo
// indexa apuntando a una página existente (ej. lab-grafo.html); `kind: writeup` genera
// su propia página en dist/lab/ con el template de post. Emite lab-entries.json.
function buildLab() {
  const entries = [];
  if (fs.existsSync(LAB_DIR)) {
    if (!fs.existsSync(LAB_OUTPUT_DIR)) fs.mkdirSync(LAB_OUTPUT_DIR, { recursive: true });
    fs.readdirSync(LAB_DIR).filter(f => f.endsWith('.md')).forEach(file => {
      const raw = fs.readFileSync(path.join(LAB_DIR, file), 'utf8');
      const { metadata, content } = extractFrontMatter(raw);
      if (!metadata.title) { console.warn(`⚠️  lab/${file} sin título — se omite`); return; }
      const slug = metadata.slug || file.replace(/\.md$/, '');
      const kind = metadata.kind || (metadata.url ? 'tool' : 'writeup');
      let url = metadata.url || '';

      if (kind === 'writeup' && !url) {
        const outName = `${slug}.html`;
        const htmlContent = markdownToHtml(content.replace(/^\s*#\s+[^\n]+\n+/, ''));
        const ogImage = metadata.image
          ? (metadata.image.startsWith('http') ? metadata.image : `${BASE_URL}/${metadata.image.replace(/^\//, '')}`)
          : DEFAULT_OG_IMAGE;
        const page = template
          .replace(/\{\{lang\}\}/g, 'es')
          .replace(/\{\{langselector\}\}/g, '')
          .replace(/\{\{title\}\}/g, metadata.title)
          .replace(/\{\{kicker\}\}/g, metadata.kicker || 'lab')
          .replace(/\{\{description\}\}/g, metadata.summary || metadata.description || '')
          .replace(/\{\{canonical\}\}/g, `${BASE_URL}/dist/lab/${outName}`)
          .replace(/\{\{ogimage\}\}/g, ogImage)
          .replace(/\{\{date\}\}/g, metadata.date || '—')
          .replace(/\{\{content\}\}/g, htmlContent)
          .replace(/\{\{aside\}\}/g, metadata.aside ? markdownToHtml(metadata.aside) : '');
        fs.writeFileSync(path.join(LAB_OUTPUT_DIR, outName), page);
        url = `dist/lab/${outName}`;
        console.log(`✅ Generado: ${path.join(LAB_OUTPUT_DIR, outName)}`);
      }

      entries.push({
        id: slug,
        title: metadata.title,
        summary: metadata.summary || metadata.description || '',
        date: metadata.date || '',
        kind,
        url,
      });
    });
  }
  entries.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  fs.writeFileSync(LAB_ENTRIES_FILE, JSON.stringify(entries, null, 2));
  console.log(`✅ Generado: ${LAB_ENTRIES_FILE} (${entries.length} entradas)`);
}

// ── Notas / momentos (entradas cortas, solo datos → modal) ───────────────────
function plainText(html) {
  return html.replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ').trim();
}

function buildNotas() {
  const notas = [];
  if (fs.existsSync(NOTAS_DIR)) {
    fs.readdirSync(NOTAS_DIR).filter(f => f.endsWith('.md')).forEach(file => {
      const full = path.join(NOTAS_DIR, file);
      const raw = fs.readFileSync(full, 'utf8');
      const { metadata, content } = extractFrontMatter(raw);
      const html = marked.parse(content.trim());
      // Preview para el stream: el PRIMER bloque (heading, item de lista o párrafo), hasta el
      // primer salto, limpio y truncado. El contenido completo y formateado va en el modal (html).
      const fb = html.match(/<(h[1-6]|p|li|blockquote)[^>]*>([\s\S]*?)<\/\1>/i);
      let firstBlock = (fb ? fb[2] : html).split(/<br\s*\/?>/i)[0];
      let preview = plainText(firstBlock);
      if (preview.length > 160) preview = preview.slice(0, 160).replace(/\s+\S*$/, '') + '…';
      notas.push({
        id: file.replace(/\.md$/, ''),
        date: metadata.date || '',
        type: metadata.type || 'nota',     // nota | imagen | enlace
        image: metadata.image || '',
        link: metadata.link || '',
        html,
        text: plainText(html),   // texto completo (lo usa el buscador)
        preview,                 // primera línea (lo muestra el stream)
        _mtime: fs.statSync(full).mtimeMs,
      });
    });
  }
  // Por fecha desc; a igual fecha, la modificada más reciente primero (la que acabás de crear),
  // y como último desempate el id, para que el orden sea estable y predecible.
  notas.sort((a, b) =>
    (b.date || '').localeCompare(a.date || '') ||
    (b._mtime - a._mtime) ||
    b.id.localeCompare(a.id));
  notas.forEach(n => { delete n._mtime; });
  fs.writeFileSync(NOTAS_FILE, JSON.stringify(notas, null, 2));
  console.log(`✅ Generado: ${NOTAS_FILE} (${notas.length} notas)`);
}

// ── Fuentes: catálogo de archivos/repositorios (content/fuentes/*.md) ─────────
// Un archivo por fuente con frontmatter (title, url, region, tipo, estado, autor,
// orden). Emite assets/data/fuentes.json — lo consumen fuentes.html y el ⌘K.
const FUENTES_DIR = './content/fuentes';
const FUENTES_FILE = './assets/data/fuentes.json';
const REGION_ORDER = [
  'Argentina — Entre Ríos', 'Argentina — Nacional',
  'Suiza — Cantón del Valais', 'Suiza — General',
  'Plataformas y directorios', 'Bibliografía',
];

function buildFuentes() {
  const fuentes = [];
  if (fs.existsSync(FUENTES_DIR)) {
    marked.setOptions({ breaks: false, gfm: true });
    fs.readdirSync(FUENTES_DIR).filter(f => f.endsWith('.md')).forEach(file => {
      const raw = fs.readFileSync(path.join(FUENTES_DIR, file), 'utf8');
      const { metadata, content } = extractFrontMatter(raw);
      if (!metadata.title) { console.warn(`⚠️  fuentes/${file} sin título — se omite`); return; }
      const html = marked.parse(content.trim());
      fuentes.push({
        id: file.replace(/\.md$/, ''),
        title: metadata.title,
        url: metadata.url || '',
        region: metadata.region || 'Otras',
        tipo: metadata.tipo || '',
        estado: metadata.estado || '',
        autor: metadata.autor || '',
        orden: parseInt(metadata.orden, 10) || 999,
        html,
        text: plainText(html).slice(0, 300),   // para el buscador
      });
    });
  }
  fuentes.sort((a, b) => {
    const ra = REGION_ORDER.indexOf(a.region), rb = REGION_ORDER.indexOf(b.region);
    return (ra === -1 ? 99 : ra) - (rb === -1 ? 99 : rb) || a.orden - b.orden || a.title.localeCompare(b.title);
  });
  fs.writeFileSync(FUENTES_FILE, JSON.stringify(fuentes, null, 2));
  console.log(`✅ Generado: ${FUENTES_FILE} (${fuentes.length} fuentes)`);
}

// ── Changelog → ítems de la bitácora ─────────────────────────────────────────
const MESES = {
  enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06',
  julio: '07', agosto: '08', septiembre: '09', setiembre: '09', octubre: '10',
  noviembre: '11', diciembre: '12',
};
function fechaEsToIso(s) {
  const m = s.match(/(\d{1,2})\s+de\s+([a-záéíóú]+)\s+de\s+(\d{4})/i);
  if (!m) return '';
  const dd = m[1].padStart(2, '0');
  const mm = MESES[m[2].toLowerCase()] || '01';
  return `${m[3]}-${mm}-${dd}`;
}
function buildChangelogFeed() {
  const items = [];
  if (fs.existsSync(CHANGELOG_MD)) {
    const lines = fs.readFileSync(CHANGELOG_MD, 'utf8').split('\n');
    let curDate = '';
    let i = 0;
    while (i < lines.length) {
      const dm = lines[i].match(/^###\s+(.+)/);
      if (dm) { curDate = fechaEsToIso(dm[1]); i++; continue; }
      const hm = lines[i].match(/^####\s+(.+)/);
      if (hm) {
        const tagM = hm[1].match(/changelog-tag--(\w+)/);
        const tag = tagM ? tagM[1] : '';
        const title = hm[1].replace(/<span[^>]*>[\s\S]*?<\/span>/g, '').trim();
        const body = [];
        i++;
        while (i < lines.length && !/^####\s/.test(lines[i]) && !/^###\s/.test(lines[i])) {
          body.push(lines[i]); i++;
        }
        items.push({
          id: `${curDate}-${headingId(title)}`,
          date: curDate, type: 'cambio', tag, title,
          html: marked.parse(body.join('\n').trim()),
        });
        continue;
      }
      i++;
    }
  }
  const recent = items.slice(0, 40);   // ya vienen recientes-primero
  fs.writeFileSync(CHANGELOG_ENTRIES_FILE, JSON.stringify(recent, null, 2));
  console.log(`✅ Generado: ${CHANGELOG_ENTRIES_FILE} (${recent.length} de ${items.length})`);
}

// Función principal
function build() {
  console.log('🚀 Iniciando build del blog...');
  
  const blogEntries = [];

  // Leer archivos Markdown
  if (fs.existsSync(POSTS_DIR)) {
    const files = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith('.md'));
    console.log(`📁 Archivos Markdown encontrados: ${files.length}`);

    // Pass 1 — leer todos, extraer frontmatter, agrupar por nombre base + idioma
    const posts = [];      // { file, lang, baseName, metadata, content }
    const groups = {};     // baseName -> { defaultSlug, out: {lang: outputName} }
    files.forEach(file => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
      const { metadata, content } = extractFrontMatter(raw);
      if (!metadata.title || !metadata.kicker) {
        console.warn(`⚠️  ${file} falta título o kicker — se omite`);
        return;
      }
      const { baseName, lang } = parseLang(file);
      posts.push({ file, lang, baseName, metadata, content });
      groups[baseName] = groups[baseName] || { out: {} };
    });

    // Resolver slug por defecto y los nombres de salida por idioma de cada grupo
    posts.forEach(p => { if (p.lang === DEFAULT_LANG) groups[p.baseName].defaultSlug = p.metadata.slug || p.baseName; });
    posts.forEach(p => {
      const g = groups[p.baseName];
      const slug = g.defaultSlug || p.baseName;
      g.out[p.lang] = p.lang === DEFAULT_LANG ? `${slug}.html` : `${slug}.${p.lang}.html`;
    });

    // Pass 2 — renderizar cada idioma; solo el idioma por defecto va al índice
    posts.forEach(p => {
      const g = groups[p.baseName];
      const slug = g.defaultSlug || p.baseName;
      renderPost(p.metadata, p.content, {
        lang: p.lang,
        outputName: g.out[p.lang],
        langSelector: langSelectorHtml(g, p.lang),
      });
      console.log(`  ✅ Procesado: ${p.metadata.title} [${p.lang}]`);

      if (p.lang === DEFAULT_LANG) {
        blogEntries.push({
          id: slug,
          title: p.metadata.title,
          description: p.metadata.description || '',
          image: p.metadata.image || '/assets/images/cards/clemenzo-por-el-mundo.webp',
          category: p.metadata.category || 'general',
          date: p.metadata.date || '',
          tags: p.metadata.tags ? p.metadata.tags.split(',').map(t => t.trim()) : [],
          featured: p.metadata.featured === 'true',
          url: `dist/blog/${slug}.html`,
          // ids de personas que trata el post (frontmatter `wiki:`), para enlazarlas en el grafo de la wiki
          wiki: p.metadata.wiki ? p.metadata.wiki.split(',').map(t => t.trim()).filter(Boolean) : [],
          langs: LANGS.filter(l => g.out[l]),
        });
      }
    });

    blogEntries.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date) - new Date(a.date);
    });
  }
  
  // Escribir JSON de entradas
  fs.writeFileSync(BLOG_ENTRIES_FILE, JSON.stringify(blogEntries, null, 2));
  console.log(`✅ Generado: ${BLOG_ENTRIES_FILE} (${blogEntries.length} entradas)`);

  // Área lab, notas/momentos y feed del changelog (alimentan la bitácora de la home)
  buildLab();
  buildNotas();
  buildFuentes();
  buildChangelogFeed();

  // Generar arbol.json desde data/arbol.db
  buildArbolData();

  // Generar la wiki (grafo + páginas) — depende de arbol.json ya actualizado
  try {
    require('./build-wiki.js').build();
  } catch (e) {
    console.warn('⚠️  build-wiki.js falló:', e.message);
  }

  console.log('🎉 Build completado!');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  build();
}

module.exports = { build, renderPost };
