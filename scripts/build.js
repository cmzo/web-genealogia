#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { execFileSync } = require('child_process');

// Configuración
const POSTS_DIR = './content/posts';
const TEMPLATE_FILE = './content/templates/post-template.html';
const OUTPUT_DIR = './dist/blog';
const BLOG_ENTRIES_FILE = './assets/data/blog-entries.json';

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
    console.log(`🔄 Convirtiendo Obsidian: ${match} → ![${altText}](../../assets/images/posts/${filename})`);
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
      console.log(`🔍 Posible galería encontrada: ${match.substring(0, 100)}...`);
      
      // Extraer todas las imágenes del grupo
      const images = match.match(/<img[^>]+>/gs) || [];
      
      if (images.length >= 2) {
        console.log(`📸 Galería detectada con ${images.length} imágenes`);
        
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
  
  <!-- Lightbox Modal -->
  <div id="lightbox" style="
    display: none;
    position: fixed;
    z-index: 9999;
    left: 0; top: 0;
    width: 100%; height: 100%;
    background-color: rgba(0,0,0,0.9);
    cursor: pointer;
  " onclick="closeLightbox()">
    <button onclick="event.stopPropagation(); closeLightbox();" style="
      position: absolute;
      top: 16px; right: 16px;
      background: rgba(255,255,255,0.15);
      border: none;
      color: white;
      width: 40px; height: 40px;
      border-radius: 50%;
      font-size: 20px;
      cursor: pointer;
      display: grid;
      place-items: center;
      line-height: 1;
    ">✕</button>
    <div style="
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      max-width: 95%; max-height: 90%;
      text-align: center;
    ">
      <img id="lightbox-img" style="
        max-width: 100%;
        max-height: 90vh;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      ">
    </div>
  </div>

  <script>
    function openLightbox(src) {
      document.getElementById('lightbox-img').src = src;
      document.getElementById('lightbox').style.display = 'block';
    }

    function closeLightbox() {
      document.getElementById('lightbox').style.display = 'none';
    }

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeLightbox();
    });
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

// Función para procesar un archivo Markdown
function processMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { metadata, content: markdownContent } = extractFrontMatter(content);
  
  // Validar metadatos requeridos
  if (!metadata.title || !metadata.kicker) {
    console.warn(`⚠️  Archivo ${filePath} falta título o kicker`);
    return null;
  }
  
  // Generar slug si no existe
  if (!metadata.slug) {
    metadata.slug = path.basename(filePath, '.md');
  }
  
  // Eliminar h1 inicial si duplica el título del front matter
  const strippedContent = markdownContent.replace(/^\s*#\s+[^\n]+\n+/, '');

  // Convertir Markdown a HTML
  const htmlContent = markdownToHtml(strippedContent);
  
  // Procesar aside si existe
  let asideContent = '';
  if (metadata.aside) {
    // Convertir Markdown del aside a HTML
    asideContent = markdownToHtml(metadata.aside);
  }
  
  // Procesar template
  let html = template
    .replace(/\{\{title\}\}/g, metadata.title)
    .replace(/\{\{kicker\}\}/g, metadata.kicker)
    .replace(/\{\{date\}\}/g, metadata.date || '—')
    .replace(/\{\{content\}\}/g, htmlContent)
    .replace(/\{\{aside\}\}/g, asideContent);
  
  // Escribir archivo HTML
  const outputPath = path.join(OUTPUT_DIR, `${metadata.slug}.html`);
  fs.writeFileSync(outputPath, html);
  
  console.log(`✅ Generado: ${outputPath}`);
  
  return {
    id: metadata.slug,
    title: metadata.title,
    description: metadata.description || '',
    image: metadata.image || '/assets/images/cards/clemenzo-por-el-mundo.webp',
    category: metadata.category || 'general',
    date: metadata.date || '',
    tags: metadata.tags ? metadata.tags.split(',').map(t => t.trim()) : [],
    featured: metadata.featured === 'true',
    url: `dist/blog/${metadata.slug}.html`
  };
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
    const files = fs.readdirSync(POSTS_DIR)
      .filter(file => file.endsWith('.md'));

    console.log(`📁 Archivos Markdown encontrados: ${files.length}`);
    files.forEach(file => {
      console.log(`  - ${file}`);
    });

    files.forEach(file => {
      const filePath = path.join(POSTS_DIR, file);
      const entry = processMarkdownFile(filePath);
      if (entry) {
        blogEntries.push(entry);
        console.log(`  ✅ Procesado: ${entry.title}`);
      }
    });

    // Ordenar por fecha del front matter (más reciente primero)
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

module.exports = { build, processMarkdownFile };
