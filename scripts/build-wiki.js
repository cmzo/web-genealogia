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
const OUTPUT_DIR = path.join(ROOT, 'dist/wiki');
const GRAPH_FILE = path.join(ROOT, 'assets/data/wiki-graph.json');
const BASE_URL = 'https://cmzo.net';

const TYPE_LABEL = {
  lugar: 'Lugar', fuente: 'Fuente', evento: 'Evento', tema: 'Tema', persona: 'Persona',
};

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

// Tablas con wrapper (las notas son muy tabulares)
function postProcess(html) {
  return html
    .replace(/<table>/g, '<div class="table-wrapper"><table>')
    .replace(/<\/table>/g, '</table></div>');
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

  // Notas de persona disponibles en disco
  const notaById = new Map();   // pNN -> markdown body (sin frontmatter)
  if (fs.existsSync(PERSONAS_DIR)) {
    fs.readdirSync(PERSONAS_DIR).filter(f => /^p\d+\.md$/.test(f)).forEach(file => {
      const id = file.replace(/\.md$/, '');
      if (!personaById.has(id)) return;
      const { body } = extractFrontMatter(fs.readFileSync(path.join(PERSONAS_DIR, file), 'utf8'));
      notaById.set(id, body);
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
        body, links: findLinks(body),
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
    const hasNote = notaById.has(id);
    const node = {
      id, title: p.name, type: 'persona', branch: p.branch || '',
      url: hasNote ? `dist/wiki/${id}.html` : `arbol.html?focus=${id}`,
      summary: vitals(p), hasContent: hasNote,
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

  function addEdge(source, target) {
    if (source === target) return;
    const key = source + '::' + target;
    if (addEdge._seen?.has(key)) return;
    (addEdge._seen ||= new Set()).add(key);
    edges.push({ source, target });
  }

  // Aristas desde páginas
  pages.forEach(page => page.links.forEach(({ target }) => {
    const r = resolvePageLink(target);
    if (r) addEdge(page.slug, r.nodeId);
  }));

  // Aristas desde menciones pNN en notas de persona
  const mentionRe = /(^|[^\w/])p(\d+)\b/g;
  notaById.forEach((body, ownerId) => {
    let m;
    mentionRe.lastIndex = 0;
    while ((m = mentionRe.exec(body)) !== null) {
      const mentioned = 'p' + m[2];
      if (mentioned === ownerId || !personaById.has(mentioned)) continue;
      ensurePersonaNode(mentioned);
      addEdge(ownerId, mentioned);
    }
  });

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
    const persona = /^p\d+$/.test(nodeId);
    const href = persona ? (n.hasContent ? `${nodeId}.html` : `../../arbol.html?focus=${nodeId}`) : `${nodeId}.html`;
    const cls = 'wiki-chip' + (persona ? ' wiki-chip--persona' : '');
    return `<a class="${cls}" href="${href}" data-node="${nodeId}">${escapeHtml(n.title)}</a>`;
  }

  function relatedHtml(nodeId, outIds) {
    const back = backlinks.get(nodeId);
    let html = '';
    const out = (outIds || []).map(chip).filter(Boolean).join('');
    const bk = back ? [...back].filter(id => id !== nodeId).map(chip).filter(Boolean).join('') : '';
    if (out) html += `<div class="wiki-related-group"><h2 class="wiki-related-title">Enlaza con</h2><div class="wiki-chips">${out}</div></div>`;
    if (bk) html += `<div class="wiki-related-group"><h2 class="wiki-related-title">Mencionada en</h2><div class="wiki-chips">${bk}</div></div>`;
    return html;
  }

  function writePage({ slug, type, title, description, content, related }) {
    const html = template
      .replace(/\{\{title\}\}/g, escapeHtml(title))
      .replace(/\{\{typelabel\}\}/g, TYPE_LABEL[type] || type)
      .replace(/\{\{type\}\}/g, type)
      .replace(/\{\{description\}\}/g, escapeHtml(description || ''))
      .replace(/\{\{canonical\}\}/g, `${BASE_URL}/dist/wiki/${slug}.html`)
      .replace(/\{\{content\}\}/g, content)
      .replace(/\{\{related\}\}/g, related);
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
      content: postProcess(marked(md)), related: relatedHtml(page.slug, outIds),
    });
    console.log(`  ✅ Wiki: ${page.title}`);
  });

  // Notas de persona
  notaById.forEach((body, id) => {
    const p = personaById.get(id);
    let md = linkifyPersonas(body, id).replace(/^\s*#\s+[^\n]+\n+/, '');
    const outIds = [...nodes.keys()].filter(nid => edges.some(e =>
      (e.source === id && e.target === nid) || (e.target === id && e.source === nid && /^p\d+$/.test(nid))));
    writePage({
      slug: id, type: 'persona', title: p.name, description: vitals(p),
      content: postProcess(marked(md)), related: relatedHtml(id, outIds),
    });
    console.log(`  ✅ Nota: ${p.name} (${id})`);
  });
}

if (require.main === module) build();

module.exports = { build };
