#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

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

function logStep(step) {
  log(`\n${colors.cyan}🔄 ${step}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Función para ejecutar comandos de manera segura
function runCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      ...options 
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Función para verificar si hay cambios en git
function hasChanges() {
  const result = runCommand('git status --porcelain');
  return result.success && result.output.trim() !== '';
}

// Función para obtener el estado de git
function getGitStatus() {
  const result = runCommand('git status --porcelain');
  if (!result.success) {
    logError('No se pudo obtener el estado de git');
    return [];
  }
  
  return result.output
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => {
      const status = line.substring(0, 2).trim();
      const file = line.substring(3);
      return { status, file };
    });
}

// Función para detectar tipos de cambios
function analyzeChanges(changes) {
  const analysis = {
    obsidian: [],
    quartz: [],
    other: [],
    hasObsidianChanges: false,
    hasQuartzChanges: false,
    hasOtherChanges: false
  };

  changes.forEach(change => {
    const { file } = change;
    
    if (file.startsWith('content/') && file !== 'content/index.md') {
      analysis.obsidian.push(change);
      analysis.hasObsidianChanges = true;
    } else if (file === 'content/index.md' || file.startsWith('quartz/')) {
      analysis.quartz.push(change);
      analysis.hasQuartzChanges = true;
    } else {
      analysis.other.push(change);
      analysis.hasOtherChanges = true;
    }
  });

  return analysis;
}

// Función para hacer build de Quartz
function buildQuartz() {
  logStep('Construyendo sitio con Quartz...');
  
  const result = runCommand('npx quartz build');
  if (!result.success) {
    logError('Error al construir el sitio con Quartz');
    logError(result.error);
    return false;
  }
  
  logSuccess('Sitio construido exitosamente');
  return true;
}

// Función para hacer commit y push
function commitAndPush(analysis) {
  logStep('Preparando commit...');
  
  // Determinar el mensaje del commit basado en los cambios
  let commitMessage = '';
  
  if (analysis.hasObsidianChanges && analysis.hasQuartzChanges) {
    commitMessage = 'Update: Obsidian content and Quartz configuration';
  } else if (analysis.hasObsidianChanges) {
    commitMessage = 'Update: Obsidian content';
  } else if (analysis.hasQuartzChanges) {
    commitMessage = 'Update: Quartz configuration';
  } else {
    commitMessage = 'Update: Other changes';
  }
  
  // Agregar todos los cambios
  const addResult = runCommand('git add .');
  if (!addResult.success) {
    logError('Error al agregar archivos a git');
    return false;
  }
  
  // Hacer commit
  const commitResult = runCommand(`git commit -m "${commitMessage}"`);
  if (!commitResult.success) {
    logError('Error al hacer commit');
    return false;
  }
  
  logSuccess(`Commit creado: "${commitMessage}"`);
  
  // Hacer push
  logStep('Subiendo cambios a GitHub...');
  const pushResult = runCommand('git push');
  if (!pushResult.success) {
    logError('Error al hacer push');
    return false;
  }
  
  logSuccess('Cambios subidos exitosamente');
  return true;
}

// Función para mostrar resumen de cambios
function showChangesSummary(analysis) {
  log('\n' + '='.repeat(50), 'bright');
  log('📊 RESUMEN DE CAMBIOS', 'bright');
  log('='.repeat(50), 'bright');
  
  if (analysis.hasObsidianChanges) {
    log('\n📝 Cambios en Obsidian (content/):', 'cyan');
    analysis.obsidian.forEach(change => {
      const icon = change.status === 'M' ? '📝' : change.status === 'A' ? '➕' : '🗑️';
      log(`  ${icon} ${change.file}`);
    });
  }
  
  if (analysis.hasQuartzChanges) {
    log('\n⚙️  Cambios en Quartz:', 'cyan');
    analysis.quartz.forEach(change => {
      const icon = change.status === 'M' ? '📝' : change.status === 'A' ? '➕' : '🗑️';
      log(`  ${icon} ${change.file}`);
    });
  }
  
  if (analysis.hasOtherChanges) {
    log('\n📁 Otros cambios:', 'cyan');
    analysis.other.forEach(change => {
      const icon = change.status === 'M' ? '📝' : change.status === 'A' ? '➕' : '🗑️';
      log(`  ${icon} ${change.file}`);
    });
  }
  
  log('\n' + '='.repeat(50), 'bright');
}

// Función principal
function main() {
  log('🚀 Script de Actualización y Deploy Inteligente', 'bright');
  log('='.repeat(50), 'bright');
  
  // Verificar si estamos en el directorio correcto
  if (!fs.existsSync('quartz.config.ts')) {
    logError('No se encontró quartz.config.ts. Asegúrate de estar en el directorio del proyecto Quartz.');
    process.exit(1);
  }
  
  // Verificar si hay cambios
  if (!hasChanges()) {
    logInfo('No hay cambios pendientes para commit.');
    logInfo('Si acabas de hacer cambios, asegúrate de guardar los archivos.');
    return;
  }
  
  // Obtener y analizar cambios
  logStep('Analizando cambios...');
  const changes = getGitStatus();
  const analysis = analyzeChanges(changes);
  
  // Mostrar resumen
  showChangesSummary(analysis);
  
  // Construir sitio si hay cambios
  if (analysis.hasObsidianChanges || analysis.hasQuartzChanges) {
    if (!buildQuartz()) {
      process.exit(1);
    }
  }
  
  // Hacer commit y push
  if (!commitAndPush(analysis)) {
    process.exit(1);
  }
  
  // Mensaje final
  log('\n' + '='.repeat(50), 'bright');
  log('🎉 ¡Deploy iniciado exitosamente!', 'green');
  log('='.repeat(50), 'bright');
  logInfo('El sitio se actualizará en 2-5 minutos.');
  logInfo('Puedes verificar el progreso en: GitHub → Actions');
  
  // Mostrar URL del sitio si está configurada
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.homepage) {
      logInfo(`Sitio web: ${packageJson.homepage}`);
    }
  } catch (error) {
    // Ignorar si no hay homepage configurado
  }
}

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  logError('Error inesperado:');
  logError(error.message);
  process.exit(1);
});

// Ejecutar script
if (require.main === module) {
  main();
}

module.exports = { main, analyzeChanges, buildQuartz, commitAndPush };
