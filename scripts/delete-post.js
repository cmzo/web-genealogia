#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuración
const POSTS_DIR = './posts';
const BLOG_DIR = './blog';
const BLOG_ENTRIES_FILE = './data/blog-entries.json';

function deletePost(postId) {
  console.log(`🗑️  Borrando post: ${postId}`);
  
  // 1. Verificar si existe el archivo Markdown
  const markdownFile = path.join(POSTS_DIR, `${postId}.md`);
  if (fs.existsSync(markdownFile)) {
    fs.unlinkSync(markdownFile);
    console.log(`✅ Borrado: ${markdownFile}`);
  } else {
    console.log(`⚠️  No encontrado: ${markdownFile}`);
  }
  
  // 2. Verificar si existe el archivo HTML
  const htmlFile = path.join(BLOG_DIR, `${postId}.html`);
  if (fs.existsSync(htmlFile)) {
    fs.unlinkSync(htmlFile);
    console.log(`✅ Borrado: ${htmlFile}`);
  } else {
    console.log(`⚠️  No encontrado: ${htmlFile}`);
  }
  
  // 3. Actualizar blog-entries.json
  if (fs.existsSync(BLOG_ENTRIES_FILE)) {
    const entries = JSON.parse(fs.readFileSync(BLOG_ENTRIES_FILE, 'utf8'));
    const filteredEntries = entries.filter(entry => entry.id !== postId);
    
    if (entries.length !== filteredEntries.length) {
      fs.writeFileSync(BLOG_ENTRIES_FILE, JSON.stringify(filteredEntries, null, 2));
      console.log(`✅ Actualizado: ${BLOG_ENTRIES_FILE}`);
      console.log(`📊 Entradas restantes: ${filteredEntries.length}`);
    } else {
      console.log(`⚠️  No se encontró la entrada en ${BLOG_ENTRIES_FILE}`);
    }
  } else {
    console.log(`❌ No encontrado: ${BLOG_ENTRIES_FILE}`);
  }
  
  console.log(`🎉 Proceso de borrado completado para: ${postId}`);
}

function listPosts() {
  console.log('\n📋 Posts disponibles:');
  
  // Listar archivos Markdown
  if (fs.existsSync(POSTS_DIR)) {
    const files = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith('.md'));
    files.forEach(file => {
      const postId = file.replace('.md', '');
      console.log(`  - ${postId}`);
    });
  }
  
  // Listar entradas en blog-entries.json
  if (fs.existsSync(BLOG_ENTRIES_FILE)) {
    const entries = JSON.parse(fs.readFileSync(BLOG_ENTRIES_FILE, 'utf8'));
    console.log('\n📊 Entradas en blog-entries.json:');
    entries.forEach(entry => {
      console.log(`  - ${entry.id} (${entry.title})`);
    });
  }
}

// Procesar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('❌ Uso: node scripts/delete-post.js <post-id>');
  console.log('   o: node scripts/delete-post.js --list');
  process.exit(1);
}

if (args[0] === '--list') {
  listPosts();
} else {
  const postId = args[0];
  deletePost(postId);
}
