const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuración
const INPUT_DIR = 'img/original';
const OUTPUT_DIR = 'img';
const SIZES = {
  card: { width: 600, height: 800 },
  thumbnail: { width: 300, height: 400 }
};

// Crear directorios si no existen
if (!fs.existsSync(INPUT_DIR)) {
  fs.mkdirSync(INPUT_DIR, { recursive: true });
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function optimizeImage(inputPath, outputPath, size) {
  try {
    await sharp(inputPath)
      .resize(size.width, size.height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 85 })
      .toFile(outputPath);
    
    console.log(`✅ Optimizada: ${path.basename(inputPath)} -> ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`❌ Error optimizando ${inputPath}:`, error.message);
  }
}

async function processImages() {
  console.log('🔄 Iniciando optimización de imágenes...\n');
  
  if (!fs.existsSync(INPUT_DIR)) {
    console.log(`📁 Crear carpeta: ${INPUT_DIR}`);
    console.log('📝 Coloca tus imágenes originales ahí y ejecuta este script');
    return;
  }
  
  const files = fs.readdirSync(INPUT_DIR)
    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
  
  if (files.length === 0) {
    console.log('📁 No hay imágenes para procesar en:', INPUT_DIR);
    return;
  }
  
  console.log(`📸 Procesando ${files.length} imágenes...\n`);
  
  for (const file of files) {
    const inputPath = path.join(INPUT_DIR, file);
    const baseName = path.parse(file).name;
    
    // Crear versión optimizada para tarjetas
    const cardOutput = path.join(OUTPUT_DIR, `${baseName}.webp`);
    await optimizeImage(inputPath, cardOutput, SIZES.card);
    
    // Crear versión thumbnail
    const thumbOutput = path.join(OUTPUT_DIR, `${baseName}-thumb.webp`);
    await optimizeImage(inputPath, thumbOutput, SIZES.thumbnail);
  }
  
  console.log('\n🎉 ¡Optimización completada!');
  console.log('📁 Imágenes optimizadas guardadas en:', OUTPUT_DIR);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  processImages().catch(console.error);
}

module.exports = { optimizeImage, processImages };
