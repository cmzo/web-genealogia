#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Configurador de Sincronización Obsidian → Quartz');
console.log('='.repeat(50));

// Buscar bóvedas de Obsidian
console.log('\n🔍 Buscando bóvedas de Obsidian...');

const possiblePaths = [
  path.join(process.env.HOME, 'Desktop'),
  path.join(process.env.HOME, 'Documents'),
  path.join(process.env.HOME, 'Obsidian'),
  path.join(process.env.HOME, 'Desktop', 'Obsidian Vault'),
  path.join(process.env.HOME, 'Desktop', 'Obsidian'),
];

const foundVaults = [];

possiblePaths.forEach(basePath => {
  if (fs.existsSync(basePath)) {
    try {
      const items = fs.readdirSync(basePath);
      items.forEach(item => {
        const itemPath = path.join(basePath, item);
        const obsidianPath = path.join(itemPath, '.obsidian');
        
        if (fs.existsSync(obsidianPath) && fs.statSync(obsidianPath).isDirectory()) {
          foundVaults.push(itemPath);
          console.log(`✅ Bóveda encontrada: ${itemPath}`);
        }
      });
    } catch (error) {
      // Ignorar errores de lectura
    }
  }
});

if (foundVaults.length === 0) {
  console.log('❌ No se encontraron bóvedas de Obsidian automáticamente');
  console.log('Por favor, proporciona manualmente la ruta de tu bóveda');
} else {
  console.log(`\n📋 Se encontraron ${foundVaults.length} bóveda(s):`);
  foundVaults.forEach((vault, index) => {
    console.log(`${index + 1}. ${vault}`);
  });
}

console.log('\n📝 Para configurar la sincronización:');
console.log('1. Edita el archivo scripts/sync-and-deploy.cjs');
console.log('2. Configura la variable obsidianVaultPath');
console.log('3. Configura el array filesToSync con los archivos que quieres sincronizar');
console.log('\nEjemplo de configuración:');
console.log(`
const obsidianVaultPath = '${foundVaults[0] || '/ruta/a/tu/boveda'}';

const filesToSync = [
  { source: 'Genealogia/Francisco.md', dest: 'content/Arbol Genealogico/Francisco.md' },
  { source: 'Investigaciones/', dest: 'content/Investigaciones/' },
  { source: 'Arbol Genealogico/', dest: 'content/Arbol Genealogico/' }
];
`);
