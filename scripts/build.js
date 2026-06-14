#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { execFileSync } = require('child_process');

// Configuración
const BASE_URL = 'https://web-genealogia.cmzo.workers.dev';
const DEFAULT_OG_IMAGE = `${BASE_URL}/assets/images/cards/og-banner.webp`;
const POSTS_DIR = './content/posts';
const TEMPLATE_FILE = './content/templates/post-template.html';
const OUTPUT_DIR = './dist/blog';
const BLOG_ENTRIES_FILE = './assets/data/blog-entries.json';

// Logs de diagnóstico (galerías, etc.) solo con --verbose / -v
const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');

// Asegurar que existe el directorio de salida
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Leer el template
const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');

// Función para extraer front matter
function extractFrontMatter(content) {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontMatterRegex);
  
  if (!match) {
    return { metadata: {}, content: content };
  }
  
  const metadata = {};
  const metadataText = match[1];
  
  let currentKey = null;
  let currentValue = [];
  let inMultilineValue = false;
  
  metadataText.split('\n').forEach(line => {
    // Detectar inicio de valor multilínea
    if (line.includes(': |')) {
      const [key] = line.split(': |');
      currentKey = key.trim();
      currentValue = [];
      inMultilineValue = true;
      return;
    }
    
    // Si estamos en un valor multilínea
    if (inMultilineValue) {
      if (line.startsWith('  ') || line.startsWith('\t')) {
        // Continuar valor multilínea
        currentValue.push(line.substring(2));
      } else if (line.trim() === '') {
        // Línea vacía en valor multilínea
        currentValue.push('');
      } else {
        // Fin del valor multilínea
        metadata[currentKey] = currentValue.join('\n');
        inMultilineValue = false;
        currentKey = null;
        currentValue = [];
        
        // Procesar la línea actual como nueva clave
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
          metadata[key.trim()] = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
        }
      }
      return;
    }
    
    // Procesamiento normal de clave: valor
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      metadata[key.trim()] = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
    }
  });
  
  // Finalizar valor multilínea si quedó pendiente
  if (inMultilineValue && currentKey) {
    metadata[currentKey] = currentValue.join('\n');
  }
  
  return { metadata, content: match[2] };
}

// ── Callout helpers ───────────────────────────────────────────────────────────

function calloutDefaultLabel(type) {
  const labels = {
    note: 'Nota', info: 'Información', tip: 'Consejo', hint: 'Pista',
    important: 'Importante', warning: 'Advertencia', caution: 'Precaución',
    attention: 'Atención', danger: 'Peligro', error: 'Error', bug: 'Error',
    success: 'Éxito', check: 'Verificado', done: 'Completado',
    question: 'Pregunta', faq: 'Pregunta', help: 'Ayuda',
    quote: 'Cita', cite: 'Cita', example: 'Ejemplo',
    abstract: 'Resumen', summary: 'Resumen', tldr: 'Resumen',
    failure: 'Fallo', fail: 'Fallo', missing: 'Faltante',
  };
  return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
}

function calloutIcon(type) {
  const icons = {
    note: 'ℹ', info: 'ℹ', tip: '✦', hint: '✦', important: '★',
    warning: '▲', caution: '▲', attention: '▲',
    danger: '✕', error: '✕', bug: '✕',
    success: '✓', check: '✓', done: '✓',
    question: '?', faq: '?', help: '?',
    quote: '"', cite: '"', example: '◆',
    abstract: '≡', summary: '≡', tldr: '≡',
    failure: '✕', fail: '✕', missing: '✕',
  };
  return icons[type] || '·';
}

function processCallouts(html) {
  return html.replace(
    /<blockquote>\n<p>\[!([A-Za-z_]+)\]([^\n<]*)([\s\S]*?)<\/blockquote>/g,
    (match, type, titleRest, bodyRest) => {
      const t = type.toLowerCase();
      const title = titleRest.trim() || calloutDefaultLabel(t);
      let body = bodyRest;
      if (body.startsWith('\n')) {
        body = body.substring(1).replace(/^([^<]*)<\/p>/, (_, content) =>
          content.trim() ? `<p>${content.trim()}</p>` : ''
        );
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

// ── Hypothesis Cards ─────────────────────────────────────────────────────────

function processHypotheses(html) {
  const STATUS_MAP = [
    { test: s => s.includes('Confirmado informalmente'), cls: 'confirmed-informal' },
    { test: s => s.includes('Confirmado'),               cls: 'confirmed' },
    { test: s => s.includes('sólida'),                   cls: 'solida' },
    { test: s => s.includes('plausible'),                cls: 'plausible' },
    { test: () => true,                                  cls: 'speculative' },
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

// Genera id de heading compatible con cualquier versión de marked
function headingId(text) {
  return String(text || '')
    .replace(/<[^>]+>/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

// Función para convertir Markdown a HTML
function markdownToHtml(markdown) {
  marked.setOptions({ breaks: true, gfm: true });
  marked.use({
    renderer: {
      heading(tokenOrText, depth) {
        // marked v9: (text, depth, raw)  /  marked v10+: (token)
        const isToken = typeof tokenOrText === 'object' && tokenOrText !== null;
        const text = isToken ? tokenOrText.text  : tokenOrText;
        const d    = isToken ? tokenOrText.depth : depth;
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
      }
    }
  });
  
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

  // Procesar bloques Mermaid: ```mermaid → <div class="mermaid">
  let hasMermaid = false;
  html = html.replace(
    /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
    (match, code) => {
      hasMermaid = true;
      const unescaped = code
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      return `<div class="mermaid" style="overflow-x:auto; margin: 32px 0;">${unescaped}</div>`;
    }
  );

  // Mejorar el estilo de las imágenes y corregir rutas
  html = html.replace(
    /<img src="([^"]+)" alt="([^"]*)"/g,
    (match, src, alt) => {
      // Corregir rutas relativas para que funcionen desde /dist/blog/
      let correctedSrc = src;
      if (src.startsWith('img/')) {
        correctedSrc = '../../assets/images/cards/' + src.replace('img/', '');
      }
      return `<img src="${correctedSrc}" alt="${alt}" loading="lazy" style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #e5e7eb; background: #f8fafc; margin: 24px 0;"`;
    }
  );
  
  // Corregir rutas en HTML personalizado
  html = html.replace(
    /src="img\//g,
    'src="../../assets/images/cards/'
  );
  
  // Detectar galerías: múltiples imágenes consecutivas (más flexible)
  html = html.replace(
    /(<p><img[^>]+><\/p>\s*){2,}/gs,
    (match) => {
      if (VERBOSE) console.log(`🔍 Posible galería encontrada: ${match.substring(0, 100)}...`);
      
      // Extraer todas las imágenes del grupo
      const images = match.match(/<img[^>]+>/gs) || [];
      
      if (images.length >= 2) {
        if (VERBOSE) console.log(`📸 Galería detectada con ${images.length} imágenes`);
        
        // Envolver cada imagen en figure y crear grid con funcionalidad clickable
        const galleryItems = images.map(img => {
          // Extraer src para el lightbox
          const srcMatch = img.match(/src="([^"]+)"/);
          const src = srcMatch ? srcMatch[1] : '';
          
          return `<div class="gallery-item">
            <figure class="article-image">
              <div class="image-clickable" onclick="openLightbox('${src}')" style="cursor: pointer; position: relative; transition: transform 0.2s;">
                ${img}
                <div style="
                  position: absolute;
                  top: 8px;
                  right: 8px;
                  background: rgba(0,0,0,0.6);
                  color: white;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 12px;
                  opacity: 0;
                  transition: opacity 0.2s;
                  pointer-events: none;
                " class="zoom-hint">🔍 Click para ampliar</div>
              </div>
            </figure>
          </div>`;
        }).join('');
        
        return `<div class="image-gallery" style="
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
          gap: 12px; 
          margin: 32px 0; 
          padding: 20px; 
          background: rgba(248, 250, 252, 0.6); 
          border-radius: 12px; 
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        ">
          ${galleryItems}
        </div>`;
      }
      
      return match;
    }
  );

  // Método directo: aplicar estilos a todos los em después de figure para que se vean súper pegados
  html = html.replace(
    /<br><em>([^<]+)<\/em>/g,
    '<figcaption style="display: block; text-align: center; font-style: italic; margin: -28px 0 12px 0; padding: 2px 8px; font-size: 0.75em; color: #666; line-height: 1.1; background: rgba(255, 255, 255, 0.95);">$1</figcaption>'
  );
  
  // También detectar patrones separados en párrafos diferentes
  html = html.replace(
    /(<p><figure class="article-image"><img[^>]+><\/figure><\/p>)\s*<p><em>([^<]+)<\/em><\/p>/g,
    (match, imgHtml, caption) => {
      // Extraer el img tag del figure
      const imgMatch = imgHtml.match(/<img[^>]+>/);
      if (imgMatch) {
        return `<figure class="article-image">
          ${imgMatch[0]}
          <figcaption style="text-align: center; font-style: italic; margin-top: 8px; font-size: 0.9em; color: #666;">${caption}</figcaption>
        </figure>`;
      }
      return match;
    }
  );
  
  // Envolver imágenes en figure si no están ya envueltas Y agregar funcionalidad de lightbox
  html = html.replace(
    /(<img[^>]+>)/g,
    (match, imgTag) => {
      if (imgTag.includes('figure')) return match;
      
      // Extraer src para el lightbox
      const srcMatch = imgTag.match(/src="([^"]+)"/);
      const src = srcMatch ? srcMatch[1] : '';
      
      return `<figure class="article-image">
        <div class="image-clickable" onclick="openLightbox('${src}')" style="cursor: pointer;">
          ${imgTag}
        </div>
      </figure>`;
    }
  );

  // Los pies de imagen (figcaption) suelen quedar FUERA del <figure> y con
  // estilos inline. Los movemos adentro y les quitamos los estilos para que
  // los maneje styles.css (y para que el lightbox los detecte como ficha).
  html = html.replace(
    /<\/figure>\s*<figcaption[^>]*>([\s\S]*?)<\/figcaption>/g,
    '<figcaption class="article-caption">$1</figcaption></figure>'
  );

  // Agregar lightbox HTML, CSS y scripts al final
  html += `
  <style>
    /* ── Hypothesis Cards ───────────────────────────────────────────── */
    .hypothesis-card {
      border: 1px solid #e5e7eb;
      border-left: 4px solid #9ca3af;
      border-radius: 0 8px 8px 0;
      padding: 20px 24px;
      margin: 35px 0;
      background: #f9fafb;
    }
    .hypothesis-card + hr { display: none; }
    .hypothesis-card--confirmed       { border-left-color: #16a34a; background: #f0fdf4; border-color: #bbf7d0; }
    .hypothesis-card--confirmed-informal { border-left-color: #4ade80; background: #f0fdf4; border-color: #bbf7d0; }
    .hypothesis-card--solida          { border-left-color: #2563eb; background: #eff6ff; border-color: #bfdbfe; }
    .hypothesis-card--plausible       { border-left-color: #d97706; background: #fffbeb; border-color: #fde68a; }
    .hypothesis-card--speculative     { border-left-color: #9ca3af; background: #f9fafb; border-color: #e5e7eb; }
    .hypothesis-card--directa         { outline: 2px solid rgba(252, 165, 165, 0.4); outline-offset: 2px; }
    .hypothesis-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 10px;
    }
    .hypothesis-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .hypothesis-number {
      font-size: 0.72rem;
      font-weight: 700;
      color: #6b7280;
      background: #e5e7eb;
      padding: 2px 8px;
      border-radius: 4px;
      letter-spacing: 0.05em;
      font-family: monospace;
    }
    .hypothesis-badge-directa {
      font-size: 0.7rem;
      font-weight: 600;
      color: #b91c1c;
      background: #fee2e2;
      border: 1px solid #fca5a5;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .hypothesis-status {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 12px;
      white-space: nowrap;
    }
    .hypothesis-status--confirmed,
    .hypothesis-status--confirmed-informal { color: #15803d; background: #dcfce7; }
    .hypothesis-status--solida             { color: #1d4ed8; background: #dbeafe; }
    .hypothesis-status--plausible          { color: #92400e; background: #fef3c7; }
    .hypothesis-status--speculative        { color: #374151; background: #f3f4f6; }
    .hypothesis-title {
      font-size: 0.97rem;
      font-weight: 600;
      margin: 0 0 14px 0;
      color: #111827;
      line-height: 1.4;
    }
    .hypothesis-body { font-size: 0.9rem; }
    .hypothesis-body .table-wrapper { margin-top: 0; }
    /* ──────────────────────────────────────────────────────────────── */

    .image-clickable:hover {
      transform: scale(1.02);
    }
    .image-clickable:hover .zoom-hint {
      opacity: 1 !important;
    }
    .gallery-item .image-clickable img {
      transition: all 0.2s ease;
    }
    .gallery-item .image-clickable:hover img {
      filter: brightness(1.1);
    }
  </style>
  
  <!-- Lightbox editorial (estilos en styles.css) -->
  <div class="lbx" id="lbx" hidden>
    <div class="lbx-modal">
      <div class="lbx-stage" id="lbxStage">
        <img class="lbx-img" id="lbxImg" alt="">
        <button class="lbx-btn lbx-nav lbx-prev" id="lbxPrev" aria-label="Anterior">‹</button>
        <button class="lbx-btn lbx-nav lbx-next" id="lbxNext" aria-label="Siguiente">›</button>
        <div class="lbx-hint">Clic para acercar · ← → navegar · Esc cerrar</div>
      </div>
      <aside class="lbx-panel" id="lbxPanel" hidden>
        <div class="lbx-count" id="lbxCount"></div>
        <div class="lbx-cap" id="lbxCap"></div>
      </aside>
      <button class="lbx-btn lbx-close" id="lbxClose" aria-label="Cerrar">✕</button>
    </div>
  </div>
  <script>
  (function(){
    var boxes = [].slice.call(document.querySelectorAll('.article-content .image-clickable'));
    var items = boxes.map(function(b){
      var img = b.querySelector('img'); var fig = b.closest('figure'); var cap = fig ? fig.querySelector('figcaption') : null;
      return { src: img.getAttribute('src')||'', alt: img.getAttribute('alt')||'', caption: cap ? cap.innerHTML.trim() : '' };
    });
    var lbx=document.getElementById('lbx'), stage=document.getElementById('lbxStage'), imgEl=document.getElementById('lbxImg'),
        panel=document.getElementById('lbxPanel'), capEl=document.getElementById('lbxCap'), countEl=document.getElementById('lbxCount');
    var idx=0, scale=1, tx=0, ty=0, drag=false, moved=false, sx=0, sy=0, px=0, py=0;
    function apply(){ imgEl.style.transform='translate('+tx+'px,'+ty+'px) scale('+scale+')'; }
    function reset(){ scale=1; tx=0; ty=0; stage.classList.remove('zoomed'); apply(); }
    function zoomTo(s){ scale=Math.max(1,Math.min(6,s)); if(scale===1){tx=0;ty=0;} stage.classList.toggle('zoomed',scale>1); apply(); }
    function render(){ var it=items[idx]; imgEl.src=it.src; imgEl.alt=it.alt;
      if(it.caption){ capEl.innerHTML=it.caption; countEl.textContent=(idx+1)+' / '+items.length; panel.hidden=false; } else { panel.hidden=true; }
      reset(); }
    function openLB(i){ idx=i; lbx.hidden=false; document.body.style.overflow='hidden'; render(); }
    function closeLB(){ lbx.hidden=true; document.body.style.overflow=''; }
    function go(d){ idx=(idx+d+items.length)%items.length; render(); }
    window.openLightbox = function(src){ var i=-1; items.forEach(function(it,j){ if(it.src===src) i=j; }); openLB(i<0?0:i); };
    window.closeLightbox = closeLB;
    document.getElementById('lbxClose').onclick=closeLB;
    document.getElementById('lbxPrev').onclick=function(e){ e.stopPropagation(); go(-1); };
    document.getElementById('lbxNext').onclick=function(e){ e.stopPropagation(); go(1); };
    lbx.addEventListener('click', function(e){ if(e.target===lbx) closeLB(); });
    imgEl.addEventListener('click', function(e){ e.stopPropagation(); if(moved){ moved=false; return; } zoomTo(scale>1?1:2.2); });
    stage.addEventListener('wheel', function(e){ e.preventDefault(); zoomTo(scale*(e.deltaY<0?1.2:1/1.2)); }, {passive:false});
    imgEl.addEventListener('pointerdown', function(e){ if(scale<=1) return; drag=true; moved=false; sx=e.clientX; sy=e.clientY; px=tx; py=ty; try{imgEl.setPointerCapture(e.pointerId);}catch(_){} });
    imgEl.addEventListener('pointermove', function(e){ if(!drag) return; var dx=e.clientX-sx, dy=e.clientY-sy; if(Math.abs(dx)+Math.abs(dy)>3) moved=true; tx=px+dx; ty=py+dy; apply(); });
    window.addEventListener('pointerup', function(){ drag=false; });
    document.addEventListener('keydown', function(e){ if(lbx.hidden) return; if(e.key==='Escape') closeLB(); else if(e.key==='ArrowLeft') go(-1); else if(e.key==='ArrowRight') go(1); });
  })();
  </script>
  `;
  
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
    html += '\n<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"><\/script>\n<script>mermaid.initialize({ startOnLoad: true, theme: \'neutral\' });<\/script>';
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

  // Generar arbol.json desde data/arbol.db
  buildArbolData();

  console.log('🎉 Build completado!');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  build();
}

module.exports = { build, renderPost };
