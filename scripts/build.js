#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Configuración
const POSTS_DIR = './content/posts';
const TEMPLATE_FILE = './content/templates/post-template.html';
const OUTPUT_DIR = './dist/blog';
const BLOG_ENTRIES_FILE = './content/data/blog-entries.json';

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

// Función para convertir Markdown a HTML
function markdownToHtml(markdown) {
  // Configurar marked para que sea compatible con nuestro CSS
  marked.setOptions({
    breaks: true,
    gfm: true
  });
  
  let html = marked(markdown);
  
  // Convertir blockquotes para que usen nuestro estilo
  html = html.replace(/<blockquote>/g, '<blockquote><p>');
  html = html.replace(/<\/blockquote>/g, '</p></blockquote>');
  
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
  
  // Envolver imágenes en figure si no están ya envueltas
  html = html.replace(
    /(<img[^>]+>)/g,
    (match, imgTag) => {
      if (imgTag.includes('figure')) return match;
      return `<figure class="article-image">${imgTag}</figure>`;
    }
  );
  
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
  
  // Convertir Markdown a HTML
  const htmlContent = markdownToHtml(markdownContent);
  
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
    image: metadata.image || 'assets/images/cards/clemenzo-por-el-mundo.webp',
    category: metadata.category || 'general',
    date: metadata.date || '',
    tags: metadata.tags ? metadata.tags.split(',').map(t => t.trim()) : [],
    featured: metadata.featured === 'true',
    url: `dist/blog/${metadata.slug}.html`
  };
}

// Función principal
function build() {
  console.log('🚀 Iniciando build del blog...');
  
  const blogEntries = [];
  
  // Leer archivos Markdown
  if (fs.existsSync(POSTS_DIR)) {
    const files = fs.readdirSync(POSTS_DIR)
      .filter(file => file.endsWith('.md'))
      .sort((a, b) => {
        // Ordenar por fecha (más reciente primero)
        const aPath = path.join(POSTS_DIR, a);
        const bPath = path.join(POSTS_DIR, b);
        return fs.statSync(bPath).mtime - fs.statSync(aPath).mtime;
      });
    
    files.forEach(file => {
      const filePath = path.join(POSTS_DIR, file);
      const entry = processMarkdownFile(filePath);
      if (entry) {
        blogEntries.push(entry);
      }
    });
  }
  
  // Escribir JSON de entradas
  fs.writeFileSync(BLOG_ENTRIES_FILE, JSON.stringify(blogEntries, null, 2));
  console.log(`✅ Generado: ${BLOG_ENTRIES_FILE} (${blogEntries.length} entradas)`);
  
  console.log('🎉 Build completado!');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  build();
}

module.exports = { build, processMarkdownFile };
