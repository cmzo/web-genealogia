#!/usr/bin/env node

// Construye la sección Wiki (grafo de conocimiento + páginas/notas renderizadas).
//
//  Fuentes:
//   - content/wiki/*.md      → páginas de lugar/fuente/evento/tema (con frontmatter y [[enlaces]])
//   - content/personas/*.md  → notas de investigación por persona (pNN = nombre del archivo)
//   - assets/data/arbol.json → personas (nombres, ramas, relaciones)
//
//  Salidas:
//   - assets/data/wiki-graph.json   { nodes, edges }  para el grafo D3
//   - dist/wiki/<slug>.html         página de cada nodo con contenido (modal la lee on-demand)
//
//  Enlaces:
//   - En páginas wiki: [[p26]] / [[slug]] / [[Título]] / [[destino|alias]]
//   - En notas de persona: menciones en prosa tipo "p36" → se enlazan y generan aristas.

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const ROOT = path.join(__dirname, '..');
const WIKI_DIR = path.join(ROOT, 'content/wiki');
const PERSONAS_DIR = path.join(ROOT, 'content/personas');
const TEMPLATE_FILE = path.join(ROOT, 'content/templates/wiki-template.html');
const ARBOL_JSON = path.join(ROOT, 'assets/data/arbol.json');
const BLOG_ENTRIES = path.join(ROOT, 'assets/data/blog-entries.json');
const OUTPUT_DIR = path.join(ROOT, 'dist/wiki');
const GRAPH_FILE = path.join(ROOT, 'assets/data/wiki-graph.json');
const BASE_URL = 'https://cmzo.net';

const TYPE_LABEL = {
  lugar: 'Lugar', fuente: 'Fuente', evento: 'Evento', tema: 'Tema', persona: 'Persona',
  post: 'Post', tag: 'Etiqueta',
};

// Normaliza un campo de tags (array o string «a, b, c») a una lista limpia, sin «#».
function parseTags(raw) {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : String(raw).split(',');
  return [...new Set(arr.map(t => String(t).trim().replace(/^#/, '')).filter(Boolean))];
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function extractFrontMatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { metadata: {}, body: content };
  const metadata = {};
  m[1].split('\n').forEach(line => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) metadata[key.trim()] = rest.join(':').trim().replace(/^["']|["']$/g, '');
  });
  return { metadata, body: m[2] };
}

function findLinks(body) {
  const links = [];
  const re = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  let m;
  while ((m = re.exec(body)) !== null) links.push({ target: m[1].trim(), alias: (m[2] || '').trim() });
  return links;
}

// ── Render rico (compartido con el estilo del blog) ───────────────────────────
// Callouts de Obsidian: > [!tipo] título / cuerpo  → <div class="callout …">
function calloutLabel(t) {
  const labels = {
    note: 'Nota', info: 'Información', tip: 'Consejo', hint: 'Pista', hallazgo: 'Hallazgo',
    important: 'Importante', warning: 'Advertencia', caution: 'Precaución', duda: 'Duda',
    danger: 'Peligro', error: 'Error', success: 'Éxito', check: 'Verificado', done: 'Hecho',
    question: 'Pregunta', faq: 'Pregunta', help: 'Ayuda', quote: 'Cita', cite: 'Cita',
    example: 'Ejemplo', fuente: 'Fuente', abstract: 'Resumen', summary: 'Resumen',
  };
  return labels[t] || t.charAt(0).toUpperCase() + t.slice(1);
}
function calloutIcon(t) {
  const icons = {
    note: 'ℹ', info: 'ℹ', tip: '✦', hint: '✦', important: '★', hallazgo: '✦', fuente: '❝',
    warning: '▲', caution: '▲', danger: '✕', error: '✕', duda: '?', question: '?', faq: '?',
    help: '?', success: '✓', check: '✓', done: '✓', quote: '"', cite: '"', example: '◆',
    abstract: '≡', summary: '≡',
  };
  return icons[t] || '·';
}
function processCallouts(html) {
  return html.replace(
    /<blockquote>\n<p>\[!([A-Za-z_]+)\]([^\n<]*)([\s\S]*?)<\/blockquote>/g,
    (match, type, titleRest, bodyRest) => {
      const t = type.toLowerCase();
      const title = titleRest.trim() || calloutLabel(t);
      let body = bodyRest;
      if (body.startsWith('\n')) {
        body = body.substring(1).replace(/^([^<]*)<\/p>/, (_, c) => c.trim() ? `<p>${c.trim()}</p>` : '');
      } else {
        body = body.replace(/^<\/p>/, '').trim();
      }
      body = body.trim();
      return `<div class="callout callout--${t}">
  <div class="callout-title"><span class="callout-icon">${calloutIcon(t)}</span><span>${title}</span></div>
  ${body ? `<div class="callout-body">${body}</div>` : ''}
</div>`;
    }
  );
}
// Mermaid: ```mermaid (marked → <pre><code class="language-mermaid">) → <div class="mermaid">
// con el texto sin escapar (lo re-renderiza mermaid.js en la página directa y en el modal).
function processMermaid(html) {
  return html.replace(
    /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
    (m, code) => {
      const un = code.replace(/&amp;/g, '&').replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
      return `<div class="mermaid">${un}</div>`;
    }
  );
}
// Imágenes en bloque (<p><img></p>) → <figure> con pie (alt) y gancho de lightbox.
function processFigures(html) {
  return html.replace(/<p>(<img\b[^>]*>)<\/p>/g, (m, img) => {
    const alt = (img.match(/alt="([^"]*)"/) || [, ''])[1];
    const tag = img.replace('<img', '<img loading="lazy"');
    return `<figure class="wiki-figure">${tag}${alt ? `<figcaption>${alt}</figcaption>` : ''}</figure>`;
  });
}
// Pipeline de markdown → HTML para la wiki: resaltados, imágenes Obsidian, marked,
// callouts, mermaid, figuras y tablas con wrapper.
function renderRich(md) {
  md = md.replace(/==([^=\n]+)==/g, '<mark>$1</mark>');
  // Imágenes estilo Obsidian: ![[archivo]] → assets/images/wiki/archivo (alt = nombre legible)
  md = md.replace(/!\[\[([^\]]+)\]\]/g, (m, fn) => {
    const f = fn.trim();
    const alt = f.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    return `![${alt}](../../assets/images/wiki/${f})`;
  });
  let html = marked(md);
  html = processCallouts(html);
  html = processMermaid(html);
  html = processFigures(html);
  html = html.replace(/<table>/g, '<div class="table-wrapper"><table>').replace(/<\/table>/g, '</table></div>');
  return html;
}

function vitals(p) {
  const parts = [];
  if (p.birth_date || p.birth_place) parts.push(`n. ${[p.birth_date, p.birth_place].filter(Boolean).join(', ')}`);
  if (p.death_date || p.death_place) parts.push(`f. ${[p.death_date, p.death_place].filter(Boolean).join(', ')}`);
  return parts.join(' · ');
}

function build() {
  // ── 1. Personas ───────────────────────────────────────────────────────────
  let arbol = { personas: [], matrimonios: [] };
  try { arbol = JSON.parse(fs.readFileSync(ARBOL_JSON, 'utf8')); }
  catch (e) { console.warn('⚠️  build-wiki: no se pudo leer arbol.json'); }
  const personaById = new Map((arbol.personas || []).map(p => [p.id, p]));

  // Notas de persona disponibles en disco → { body, summary }
  // Las plantillas sin investigar (stub) entran al grafo pero sin botón "Leer".
  const notaById = new Map();   // pNN -> { body, summary, tags, stub }
  if (fs.existsSync(PERSONAS_DIR)) {
    fs.readdirSync(PERSONAS_DIR).filter(f => /^p\d+\.md$/.test(f)).forEach(file => {
      const id = file.replace(/\.md$/, '');
      if (!personaById.has(id)) return;
      const { metadata, body } = extractFrontMatter(fs.readFileSync(path.join(PERSONAS_DIR, file), 'utf8'));
      const stub = body.includes('_Investigación pendiente._');
      notaById.set(id, { body, summary: metadata.summary || '', tags: parseTags(metadata.tags), stub });
    });
  }

  // ── 2. Páginas autoradas ──────────────────────────────────────────────────
  const pages = [];
  const pageBySlug = new Map();
  const pageByTitle = new Map();
  if (fs.existsSync(WIKI_DIR)) {
    fs.readdirSync(WIKI_DIR).filter(f => f.endsWith('.md')).forEach(file => {
      const raw = fs.readFileSync(path.join(WIKI_DIR, file), 'utf8');
      const { metadata, body } = extractFrontMatter(raw);
      if (!metadata.title) { console.warn(`⚠️  ${file} sin título — se omite`); return; }
      const slug = metadata.slug || file.replace(/\.md$/, '');
      const page = {
        slug, title: metadata.title, type: metadata.type || 'tema',
        summary: metadata.summary || '', branch: metadata.branch || '',
        body, links: findLinks(body), tags: parseTags(metadata.tags),
      };
      pages.push(page);
      pageBySlug.set(slug, page);
      pageByTitle.set(page.title.toLowerCase(), page);
    });
  }

  // ── 3. Nodos ──────────────────────────────────────────────────────────────
  const nodes = new Map();
  const edges = [];

  pages.forEach(page => nodes.set(page.slug, {
    id: page.slug, title: page.title, type: page.type, branch: page.branch,
    url: `dist/wiki/${page.slug}.html`, summary: page.summary, hasContent: true,
  }));

  function ensurePersonaNode(id) {
    if (nodes.has(id)) return nodes.get(id);
    const p = personaById.get(id);
    if (!p) return null;
    const hasNote = notaById.has(id) && !notaById.get(id).stub;
    const node = {
      id, title: p.name, type: 'persona', branch: p.branch || '',
      url: hasNote ? `dist/wiki/${id}.html` : `arbol.html?focus=${id}`,
      summary: (hasNote && notaById.get(id).summary) || vitals(p), hasContent: hasNote,
    };
    nodes.set(id, node);
    return node;
  }
  // Toda persona con nota entra como nodo
  notaById.forEach((_, id) => ensurePersonaNode(id));

  // Resuelve un destino [[...]] de una página
  function resolvePageLink(target) {
    if (/^p\d+$/.test(target) && personaById.has(target)) {
      const n = ensurePersonaNode(target);
      return { nodeId: target, href: n.url, label: personaById.get(target).name, persona: true, hasContent: n.hasContent };
    }
    const bySlug = pageBySlug.get(target) || pageBySlug.get(slugify(target));
    if (bySlug) return { nodeId: bySlug.slug, href: `${bySlug.slug}.html`, label: bySlug.title, persona: false, hasContent: true };
    const byTitle = pageByTitle.get(target.toLowerCase());
    if (byTitle) return { nodeId: byTitle.slug, href: `${byTitle.slug}.html`, label: byTitle.title, persona: false, hasContent: true };
    return null;
  }

  // Dedup por par no ordenado: una sola arista entre dos nodos, gane la que se
  // agregó primero (los enlaces temáticos tienen prioridad sobre los de familia).
  const seenPair = new Set();
  function addEdge(source, target, rel) {
    if (source === target) return;
    const key = [source, target].sort().join('::');
    if (seenPair.has(key)) return;
    seenPair.add(key);
    edges.push(rel ? { source, target, rel } : { source, target });
  }

  // Aristas desde páginas
  pages.forEach(page => page.links.forEach(({ target }) => {
    const r = resolvePageLink(target);
    if (r) addEdge(page.slug, r.nodeId);
  }));

  // Aristas desde menciones pNN en notas de persona
  const mentionRe = /(^|[^\w/])p(\d+)\b/g;
  notaById.forEach(({ body }, ownerId) => {
    let m;
    mentionRe.lastIndex = 0;
    while ((m = mentionRe.exec(body)) !== null) {
      const mentioned = 'p' + m[2];
      if (mentioned === ownerId || !personaById.has(mentioned)) continue;
      ensurePersonaNode(mentioned);
      addEdge(ownerId, mentioned);
    }
  });

  // Backbone familiar: conecta cada persona-nodo con sus padres y cónyuges
  // (desde arbol.json). Garantiza que ningún nodo de persona quede suelto.
  // Se itera sobre el set inicial de nodos-persona; los parientes que falten se
  // agregan como nodos (sin recursión: no se procesan los parientes de éstos).
  const seedPersonaIds = [...nodes.keys()].filter(id => /^p\d+$/.test(id));
  const spousesById = new Map();
  (arbol.matrimonios || []).forEach(mm => {
    if (!mm.spouse1_id || !mm.spouse2_id) return;
    (spousesById.get(mm.spouse1_id) || spousesById.set(mm.spouse1_id, []).get(mm.spouse1_id)).push(mm.spouse2_id);
    (spousesById.get(mm.spouse2_id) || spousesById.set(mm.spouse2_id, []).get(mm.spouse2_id)).push(mm.spouse1_id);
  });
  seedPersonaIds.forEach(id => {
    const p = personaById.get(id);
    [p.father_id, p.mother_id, ...(spousesById.get(id) || [])].forEach(rel => {
      if (rel && personaById.has(rel)) { ensurePersonaNode(rel); addEdge(id, rel, 'familia'); }
    });
  });

  // ── Posts del blog como nodos (desde blog-entries.json) ───────────────────
  let blogEntries = [];
  try { blogEntries = JSON.parse(fs.readFileSync(BLOG_ENTRIES, 'utf8')); } catch (e) { /* sin blog */ }
  const postTags = new Map();  // postNodeId -> [tags]
  blogEntries.forEach(e => {
    const id = `post:${e.id}`;
    nodes.set(id, {
      id, title: e.title, type: 'post', branch: '',
      url: e.url, summary: e.description || '', hasContent: false,
    });
    postTags.set(id, parseTags(e.tags));
    // Enlazar el post con las personas que trata (frontmatter `wiki:`) → aristas reales en el grafo
    (e.wiki || []).forEach(pid => {
      if (personaById.has(pid)) { ensurePersonaNode(pid); addEdge(id, pid); }
    });
  });

  // ── Tags como nodos (transversales: personas, páginas y posts) ────────────
  // Un tag se vuelve un hub: todo lo etiquetado se enlaza a él, así el grafo se
  // agrupa por tema y un nodo con dos tags hace de puente entre dos clusters.
  function ensureTagNode(tag) {
    const id = `tag:${slugify(tag)}`;
    if (!nodes.has(id)) nodes.set(id, {
      id, title: `#${tag}`, type: 'tag', branch: '', url: '', summary: '', hasContent: false, weight: 0,
    });
    nodes.get(id).weight++;
    return id;
  }
  const tagSources = [
    ...pages.map(pg => [pg.slug, pg.tags]),
    ...[...notaById.entries()].map(([id, n]) => [id, n.tags]),
    ...[...postTags.entries()],
  ];
  tagSources.forEach(([nodeId, tags]) => (tags || []).forEach(tag => {
    if (nodes.has(nodeId)) addEdge(nodeId, ensureTagNode(tag), 'tag');
  }));

  const graph = { generated: new Date().toISOString(), nodes: Array.from(nodes.values()), edges };
  fs.writeFileSync(GRAPH_FILE, JSON.stringify(graph, null, 2));
  console.log(`✅ Generado: ${path.relative(ROOT, GRAPH_FILE)} (${graph.nodes.length} nodos, ${edges.length} aristas)`);

  // ── 4. Backlinks (para la sección "Mencionada en" de cada página) ─────────
  const backlinks = new Map();  // nodeId -> Set(sourceNodeId)
  edges.forEach(({ source, target }) => {
    if (!backlinks.has(target)) backlinks.set(target, new Set());
    backlinks.get(target).add(source);
    // las menciones persona↔persona son bidireccionales para "aparece en"
    if (/^p\d+$/.test(source) && /^p\d+$/.test(target)) {
      if (!backlinks.has(source)) backlinks.set(source, new Set());
      backlinks.get(source).add(target);
    }
  });

  // ── 5. Render de HTML ─────────────────────────────────────────────────────
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');
  marked.setOptions({ breaks: false, gfm: true });

  // Linkifica menciones pNN en el markdown de una nota
  function linkifyPersonas(md, ownerId) {
    return md.replace(/(^|[^\w/[])p(\d+)\b/g, (full, pre, num) => {
      const id = 'p' + num;
      if (id === ownerId || !personaById.has(id)) return full;
      const n = nodes.get(id) || ensurePersonaNode(id);
      const href = n.hasContent ? `${id}.html` : `../../arbol.html?focus=${id}`;
      return `${pre}<a class="wiki-link wiki-link--persona" href="${href}" data-node="${id}">${escapeHtml(personaById.get(id).name)}</a>`;
    });
  }

  function chip(nodeId) {
    const n = nodes.get(nodeId);
    if (!n) return '';
    // Tags: en la página estática no son navegables (solo viven en el grafo)
    if (n.type === 'tag') return `<span class="wiki-chip wiki-chip--tag">${escapeHtml(n.title)}</span>`;
    // Posts: dist/wiki y dist/blog son hermanos → ../blog/<slug>.html
    if (n.type === 'post') {
      return `<a class="wiki-chip wiki-chip--post" href="../${n.url.replace(/^dist\//, '')}">${escapeHtml(n.title)}</a>`;
    }
    const persona = /^p\d+$/.test(nodeId);
    const href = persona ? (n.hasContent ? `${nodeId}.html` : `../../arbol.html?focus=${nodeId}`) : `${nodeId}.html`;
    const cls = 'wiki-chip' + (persona ? ' wiki-chip--persona' : '');
    return `<a class="${cls}" href="${href}" data-node="${nodeId}">${escapeHtml(n.title)}</a>`;
  }

  function relatedHtml(nodeId, outIds, tags) {
    const isTag = id => /^tag:/.test(id);
    const back = backlinks.get(nodeId);
    let html = '';
    const out = (outIds || []).filter(id => !isTag(id)).map(chip).filter(Boolean).join('');
    const bk = back ? [...back].filter(id => id !== nodeId && !isTag(id)).map(chip).filter(Boolean).join('') : '';
    const tagChips = (tags || []).map(t => `tag:${slugify(t)}`).filter(id => nodes.has(id)).map(chip).filter(Boolean).join('');
    if (out) html += `<div class="wiki-related-group"><h2 class="wiki-related-title">Enlaza con</h2><div class="wiki-chips">${out}</div></div>`;
    if (bk) html += `<div class="wiki-related-group"><h2 class="wiki-related-title">Mencionada en</h2><div class="wiki-chips">${bk}</div></div>`;
    if (tagChips) html += `<div class="wiki-related-group"><h2 class="wiki-related-title">Etiquetas</h2><div class="wiki-chips">${tagChips}</div></div>`;
    return html;
  }

  function writePage({ slug, type, title, description, content, related }) {
    // Reemplazos como función: un "$&" en el contenido no debe interpretarse.
    const html = template
      .replace(/\{\{title\}\}/g, () => escapeHtml(title))
      .replace(/\{\{typelabel\}\}/g, () => TYPE_LABEL[type] || type)
      .replace(/\{\{type\}\}/g, () => type)
      .replace(/\{\{description\}\}/g, () => escapeHtml(description || ''))
      .replace(/\{\{canonical\}\}/g, () => `${BASE_URL}/dist/wiki/${slug}.html`)
      .replace(/\{\{content\}\}/g, () => content)
      .replace(/\{\{related\}\}/g, () => related);
    fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}.html`), html);
  }

  // Páginas autoradas
  pages.forEach(page => {
    let md = page.body.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (full, target, alias) => {
      const r = resolvePageLink(target.trim());
      const text = (alias || '').trim() || (r ? r.label : target.trim());
      if (!r) return `<span class="wiki-link wiki-link--missing">${escapeHtml(text)}</span>`;
      const cls = 'wiki-link' + (r.persona ? ' wiki-link--persona' : '');
      return `<a class="${cls}" href="${r.href}" data-node="${r.nodeId}">${escapeHtml(text)}</a>`;
    });
    md = md.replace(/^\s*#\s+[^\n]+\n+/, '');
    const outIds = [...new Set(page.links.map(l => resolvePageLink(l.target)).filter(Boolean).map(r => r.nodeId))];
    writePage({
      slug: page.slug, type: page.type, title: page.title, description: page.summary,
      content: renderRich(md), related: relatedHtml(page.slug, outIds, page.tags),
    });
    console.log(`  ✅ Wiki: ${page.title}`);
  });

  // Notas de persona (los stubs no generan página)
  notaById.forEach(({ body, summary, tags, stub }, id) => {
    if (stub) return;
    const p = personaById.get(id);
    let md = linkifyPersonas(body, id).replace(/^\s*#\s+[^\n]+\n+/, '');
    const outIds = [...nodes.keys()].filter(nid => edges.some(e =>
      (e.source === id && e.target === nid) || (e.target === id && e.source === nid && /^p\d+$/.test(nid))));
    writePage({
      slug: id, type: 'persona', title: p.name, description: summary || vitals(p),
      content: renderRich(md), related: relatedHtml(id, outIds, tags),
    });
    console.log(`  ✅ Nota: ${p.name} (${id})`);
  });
}

if (require.main === module) build();

module.exports = { build };
