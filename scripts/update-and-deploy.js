#!/usr/bin/env node

const { execSync } = require('child_process');
const { build } = require('./build');

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

function hasChanges() {
  return execSync('git status --porcelain', { encoding: 'utf8' }).trim() !== '';
}

console.log('⬇️  Pull...');
run('git pull --rebase --autostash');

console.log('🔨 Build...');
build();

if (!hasChanges()) {
  console.log('✅ Sin cambios, nada que commitear.');
  process.exit(0);
}

const date = new Date().toISOString().slice(0, 10);
run('git add -A');   // stagea todo (borrados y archivos nuevos incluidos), respetando .gitignore
run(`git commit -m "build: actualizar posts y dist (${date})"`);
run('git push');

console.log('🚀 Deploy completado.');
