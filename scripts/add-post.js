#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { build } = require('./build.js');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logStep(step) {
  log(`\n${colors.cyan}🔄 ${step}${colors.reset}`);
}

// Función para validar que el archivo tiene front matter
function validateMarkdownFile(filePath) {
  if (!fs.existsSync(filePath)) {
    logError(`El archivo no existe: ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  // Verificar que tiene front matter
  if (!content.startsWith('---')) {
    logError('El archivo no tiene front matter (debe empezar con ---)');
    return false;
  }

  const frontMatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontMatterRegex);
  
  if (!match) {
    logError('El front matter no está correctamente formateado');
    return false;
  }

  // Verificar campos requeridos
  const frontMatter = match[1];
  const requiredFields = ['title', 'kicker'];
  const missingFields = [];

  requiredFields.forEach(field => {
    if (!frontMatter.includes(`${field}:`)) {
      missingFields.push(field);
    }
  });

  if (missingFields.length > 0) {
    logError(`Faltan campos requeridos en el front matter: ${missingFields.join(', ')}`);
    return false;
  }

  return true;
}

// Función para generar un slug único
function generateUniqueSlug(title, postsDir) {
  let slug = title
    .toLowerCase()
    .replace(/[áàäâã]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöôõ]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Verificar si el slug ya existe
  let counter = 1;
  let originalSlug = slug;
  
  while (fs.existsSync(path.join(postsDir, `${slug}.md`))) {
    slug = `${originalSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// Función para agregar front matter a un archivo si no lo tiene
function addFrontMatterIfMissing(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (content.startsWith('---')) {
    return false; // Ya tiene front matter
  }

  // Generar front matter básico basado en el nombre del archivo
  const fileName = path.basename(filePath, '.md');
  const title = fileName
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  const currentDate = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const frontMatter = `---
title: "${title}"
description: ""
image: "/assets/images/cards/clemenzo-por-el-mundo.webp"
category: "general"
date: "${currentDate}"
tags: ""
featured: false
kicker: ""
---

`;

  const newContent = frontMatter + content;
  fs.writeFileSync(filePath, newContent);
  
  logInfo('Se agregó front matter básico al archivo. Puedes editarlo antes de continuar.');
  return true;
}

// Función principal
function addPost(inputPath, options = {}) {
  log('📝 Agregando nuevo post al blog', 'bright');
  log('='.repeat(50), 'bright');

  // Resolver ruta absoluta
  const absolutePath = path.resolve(inputPath);
  
  if (!validateMarkdownFile(absolutePath)) {
    if (options.addFrontMatter) {
      logStep('Agregando front matter al archivo...');
      if (addFrontMatterIfMissing(absolutePath)) {
        logSuccess('Front matter agregado. Edita el archivo y vuelve a ejecutar el script.');
        return;
      }
    } else {
      logError('Usa --add-frontmatter para agregar front matter automáticamente');
      return;
    }
  }

  const postsDir = './content/posts';
  
  // Asegurar que existe el directorio de posts
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  // Leer el contenido y extraer metadatos
  const content = fs.readFileSync(absolutePath, 'utf8');
  const frontMatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontMatterRegex);
  const frontMatter = match[1];
  
  // Extraer título para generar slug
  const titleMatch = frontMatter.match(/title:\s*["']?([^"'\n]+)["']?/);
  const title = titleMatch ? titleMatch[1].trim() : path.basename(absolutePath, '.md');
  
  // Generar slug único
  const slug = generateUniqueSlug(title, postsDir);
  const targetPath = path.join(postsDir, `${slug}.md`);

  logStep(`Copiando archivo a ${targetPath}...`);

  // Si el archivo ya está en la carpeta posts, no copiarlo
  if (path.resolve(absolutePath) === path.resolve(targetPath)) {
    logInfo('El archivo ya está en la carpeta de posts');
  } else {
    // Actualizar el slug en el front matter si es necesario
    let updatedContent = content;
    if (!frontMatter.includes('slug:')) {
      updatedContent = content.replace(
        /^---\n([\s\S]*?)\n---/,
        `---\n$1\nslug: "${slug}"\n---`
      );
    }
    
    fs.writeFileSync(targetPath, updatedContent);
    logSuccess(`Archivo copiado a: ${targetPath}`);
  }

  // Ejecutar build del blog
  logStep('Generando HTML y actualizando blog...');
  try {
    build();
    logSuccess('Blog actualizado exitosamente');
  } catch (error) {
    logError(`Error al generar el blog: ${error.message}`);
    return;
  }

  // Mostrar resumen
  log('\n' + '='.repeat(50), 'bright');
  log('🎉 ¡Post agregado exitosamente!', 'green');
  log('='.repeat(50), 'bright');
  logInfo(`Título: ${title}`);
  logInfo(`Slug: ${slug}`);
  logInfo(`Archivo: ${targetPath}`);
  logInfo(`URL: /dist/blog/${slug}.html`);
  
  if (!options.noDeploy) {
    log('\n💡 Para publicar los cambios, ejecuta:', 'yellow');
    log('npm run deploy', 'cyan');
  }
}

// Función para mostrar ayuda
function showHelp() {
  log('📝 Script para agregar posts al blog', 'bright');
  log('='.repeat(40), 'bright');
  log('\n📖 Uso:');
  log('  node scripts/add-post.js <archivo.md> [opciones]', 'cyan');
  log('\n📋 Opciones:');
  log('  --add-frontmatter    Agregar front matter si no existe', 'yellow');
  log('  --no-deploy         No mostrar mensaje de deploy', 'yellow');
  log('  --help              Mostrar esta ayuda', 'yellow');
  log('\n📝 El archivo debe tener front matter con al menos:');
  log('  - title: "Título del post"', 'blue');
  log('  - kicker: "Descripción corta"', 'blue');
  log('\n💡 Ejemplo de front matter completo:');
  console.log(`${colors.blue}---
title: "Mi nuevo post"
description: "Descripción del post"
image: "/assets/images/cards/clemenzo-por-el-mundo.webp"
category: "general"
date: "15-12-2024"
tags: "genealogia, investigacion"
featured: false
kicker: "Una descripción corta y atractiva"
---${colors.reset}`);
}

// Procesar argumentos de línea de comandos
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    showHelp();
    return;
  }

  const inputPath = args[0];
  const options = {
    addFrontMatter: args.includes('--add-frontmatter'),
    noDeploy: args.includes('--no-deploy')
  };

  addPost(inputPath, options);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { addPost, validateMarkdownFile, generateUniqueSlug };
