#!/usr/bin/env node
/**
 * optimize-personas.js
 *
 * Convierte a WebP todos los JPG/JPEG/PNG sin optimizar en assets/images/personas/.
 * - Si ya existe un .webp con el mismo nombre base, el archivo se saltea.
 * - Tras convertir con éxito, elimina el original.
 * - Idempotente: se puede correr cuantas veces se quiera.
 *
 * Uso:
 *   npm run optimize-personas
 *   node scripts/optimize-personas.js
 */

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIR       = path.join(__dirname, '../assets/images/personas');
const QUALITY   = 85;
const MAX_WIDTH = 2400; // px — solo reduce, nunca amplía

function run() {
  if (!fs.existsSync(DIR)) {
    console.error(`❌ No existe el directorio: ${DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(DIR)
    .filter(f => /\.(jpg|jpeg|png)$/i.test(f));

  if (!files.length) {
    console.log('✅ No hay archivos para optimizar en assets/images/personas/');
    return;
  }

  let converted = 0;
  let skipped   = 0;
  let errors    = 0;

  for (const file of files) {
    const ext     = path.extname(file);
    const base    = file.slice(0, -ext.length);
    const srcPath = path.join(DIR, file);
    const dstPath = path.join(DIR, base + '.webp');

    if (fs.existsSync(dstPath)) {
      console.log(`⏭  Ya existe ${base}.webp — saltando`);
      skipped++;
      continue;
    }

    try {
      // -resize NNNx>  → reduce a MAX_WIDTH si es más ancha, preserva aspecto, nunca amplía
      execSync(
        `magick "${srcPath}" -resize ${MAX_WIDTH}x> -quality ${QUALITY} "${dstPath}"`,
        { stdio: 'pipe' }
      );
      fs.unlinkSync(srcPath);
      const sizeKB = Math.round(fs.statSync(dstPath).size / 1024);
      console.log(`✅ ${file} → ${base}.webp  (${sizeKB} KB)`);
      converted++;
    } catch (err) {
      console.error(`❌ Error con ${file}: ${err.message}`);
      if (fs.existsSync(dstPath)) fs.unlinkSync(dstPath);
      errors++;
    }
  }

  console.log(`\n${converted} convertidos · ${skipped} ya existían · ${errors} errores`);
}

run();
