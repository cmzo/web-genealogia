// Utilidades de markdown COMPARTIDAS entre build.js (posts) y build-wiki.js (wiki).
// Única copia de: front matter, callouts de Obsidian, Mermaid, figuras, slugs e ids
// de heading, y la configuración del renderer de marked (heading con id + tabla con
// wrapper). Antes cada builder tenía su copia y divergían — y peor: build.js instalaba
// el renderer con marked.use() (estado GLOBAL del módulo marked) y build-wiki, al correr
// en el mismo proceso, lo heredaba sin saberlo y re-envolvía las tablas (doble
// .table-wrapper en producción). Ahora ambos llaman configureMarked() explícitamente
// y el renderer es el único responsable del wrapper.
//
// Nota: las OPCIONES de marked (breaks, gfm) siguen siendo de cada builder — los posts
// usan breaks:true (histórico; los .md existentes dependen de eso) y la wiki breaks:false.

const { marked } = require('marked');

// ── Front matter ──────────────────────────────────────────────────────────────
// Soporta valores multilínea con `clave: |` (indentados con 2 espacios o tab).
// Devuelve el cuerpo como `content` y también como `body` (alias histórico de build-wiki).
function extractFrontMatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { metadata: {}, content: raw, body: raw };

  const metadata = {};
  let currentKey = null;
  let currentValue = [];
  let inMultilineValue = false;

  match[1].split('\n').forEach(line => {
    if (line.includes(': |')) {
      currentKey = line.split(': |')[0].trim();
      currentValue = [];
      inMultilineValue = true;
      return;
    }
    if (inMultilineValue) {
      if (line.startsWith('  ') || line.startsWith('\t')) {
        currentValue.push(line.substring(2));
      } else if (line.trim() === '') {
        currentValue.push('');
      } else {
        metadata[currentKey] = currentValue.join('\n');
        inMultilineValue = false;
        currentKey = null;
        currentValue = [];
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
          metadata[key.trim()] = valueParts.join(':').trim().replace(/^["'“”]|["'“”]$/g, '');
        }
      }
      return;
    }
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      metadata[key.trim()] = valueParts.join(':').trim().replace(/^["'“”]|["'“”]$/g, '');
    }
  });
  if (inMultilineValue && currentKey) metadata[currentKey] = currentValue.join('\n');

  return { metadata, content: match[2], body: match[2] };
}

// ── Slugs e ids ───────────────────────────────────────────────────────────────
function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Id de heading compatible con cualquier versión de marked (conserva acentos/ñ).
function headingId(text) {
  return String(text || '')
    .replace(/<[^>]+>/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

// ── Callouts de Obsidian: > [!tipo] título / cuerpo → <div class="callout …"> ──
// Los mapas son la UNIÓN de los que tenían posts y wiki.
function calloutLabel(type) {
  const labels = {
    note: 'Nota', info: 'Información', tip: 'Consejo', hint: 'Pista', hallazgo: 'Hallazgo',
    important: 'Importante', warning: 'Advertencia', caution: 'Precaución', duda: 'Duda',
    attention: 'Atención', danger: 'Peligro', error: 'Error', bug: 'Error',
    success: 'Éxito', check: 'Verificado', done: 'Completado',
    question: 'Pregunta', faq: 'Pregunta', help: 'Ayuda',
    quote: 'Cita', cite: 'Cita', example: 'Ejemplo', fuente: 'Fuente',
    abstract: 'Resumen', summary: 'Resumen', tldr: 'Resumen',
    failure: 'Fallo', fail: 'Fallo', missing: 'Faltante',
  };
  return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
}

function calloutIcon(type) {
  const icons = {
    note: 'ℹ', info: 'ℹ', tip: '✦', hint: '✦', important: '★', hallazgo: '✦', fuente: '❝',
    warning: '▲', caution: '▲', attention: '▲', duda: '?',
    danger: '✕', error: '✕', bug: '✕', failure: '✕', fail: '✕', missing: '✕',
    success: '✓', check: '✓', done: '✓',
    question: '?', faq: '?', help: '?',
    quote: '"', cite: '"', example: '◆',
    abstract: '≡', summary: '≡', tldr: '≡',
  };
  return icons[type] || '·';
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

// ── Mermaid: ```mermaid (marked → <pre><code class="language-mermaid">) ───────
// Devuelve { html, hasMermaid } con el texto sin escapar en <div class="mermaid">
// (lo re-renderiza mermaid.js en la página). El estilo va por CSS, no inline.
function processMermaid(html) {
  let hasMermaid = false;
  const out = html.replace(
    /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
    (m, code) => {
      hasMermaid = true;
      const un = code.replace(/&amp;/g, '&').replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
      return `<div class="mermaid">${un}</div>`;
    }
  );
  return { html: out, hasMermaid };
}

// ── Figuras: imágenes en bloque (<p><img></p>) → <figure> con pie (alt) ───────
function processFigures(html, figureClass = 'wiki-figure') {
  return html.replace(/<p>(<img\b[^>]*>)<\/p>/g, (m, img) => {
    const alt = (img.match(/alt="([^"]*)"/) || [, ''])[1];
    const tag = img.includes('loading=') ? img : img.replace('<img', '<img loading="lazy"');
    return `<figure class="${figureClass}">${tag}${alt ? `<figcaption>${alt}</figcaption>` : ''}</figure>`;
  });
}

// ── Renderer de marked (heading con id + tabla con .table-wrapper) ────────────
// marked.use() es GLOBAL al módulo: llamarlo una vez alcanza para todo el proceso.
// Idempotente vía flag para poder llamarlo desde ambos builders sin acumular.
let _configured = false;
function configureMarked() {
  if (_configured) return;
  _configured = true;
  marked.use({
    renderer: {
      heading(tokenOrText, depth) {
        // marked v9: (text, depth, raw)  /  marked v10+: (token)
        const isToken = typeof tokenOrText === 'object' && tokenOrText !== null;
        const text = isToken ? tokenOrText.text : tokenOrText;
        const d = isToken ? tokenOrText.depth : depth;
        return `<h${d} id="${headingId(text)}">${text}</h${d}>\n`;
      },
      table(tokenOrHeader, body) {
        const isToken = typeof tokenOrHeader === 'object' && tokenOrHeader !== null && 'header' in tokenOrHeader;
        if (isToken) {
          const header = tokenOrHeader.header.map(cell => `<th>${marked.parseInline(cell.raw || cell.text || '')}</th>`).join('');
          const rows = tokenOrHeader.rows.map(row =>
            `<tr>${row.map(cell => `<td>${marked.parseInline(cell.raw || cell.text || '')}</td>`).join('')}</tr>`
          ).join('\n');
          return `<div class="table-wrapper"><table><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table></div>\n`;
        }
        return `<div class="table-wrapper"><table><thead>${tokenOrHeader}</thead><tbody>${body}</tbody></table></div>\n`;
      },
    },
  });
}

module.exports = {
  extractFrontMatter, slugify, headingId,
  calloutLabel, calloutIcon, processCallouts,
  processMermaid, processFigures, configureMarked,
};
