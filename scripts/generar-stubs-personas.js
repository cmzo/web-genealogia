#!/usr/bin/env node

// Crea un archivo de investigación stub (plantilla Híbrida) para cada persona de
// arbol.json que todavía NO tenga `content/personas/p{id}.md`.
//
// Nunca sobreescribe notas existentes — es idempotente y seguro de re-correr.
// Pre-rellena lo que sabemos (cronología n./f. desde arbol.json) y deja
// marcadores «pendiente» + líneas de investigación para que el agente/Matías completen.
//
//   node scripts/generar-stubs-personas.js          # crea los que faltan
//   node scripts/generar-stubs-personas.js --dry     # solo informa, no escribe

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ARBOL_JSON = path.join(ROOT, 'assets/data/arbol.json');
const PERSONAS_DIR = path.join(ROOT, 'content/personas');
const DRY = process.argv.includes('--dry');

const year = d => (String(d || '').match(/\d{4}/) || [''])[0];

// Plantilla Híbrida pre-rellenada para una persona sin nota.
function stub(p) {
  const bY = year(p.birth_date), dY = year(p.death_date);
  const bPlace = (p.birth_place || '').trim();
  const dPlace = (p.death_place || '').trim();

  // Cronología: filas solo para lo que conocemos
  const rows = [];
  if (bY || bPlace) rows.push(`| ${bY || '—'} | árbol | Nace${bPlace ? ` en ${bPlace}` : ''} |`);
  if (dY || dPlace) rows.push(`| ${dY || '—'} | árbol | Fallece${dPlace ? ` en ${dPlace}` : ''} |`);
  const cronologia = rows.length
    ? `| Año | Fuente | Qué dice |\n|-----|--------|----------|\n${rows.join('\n')}`
    : `_Sin fechas registradas en el árbol todavía._`;

  // Líneas de investigación según lo que falte
  const tareas = [];
  tareas.push(`- [ ] Buscar acta de nacimiento${bPlace ? ` en ${bPlace}` : ''}.`);
  if (!dY) tareas.push('- [ ] Confirmar fecha y lugar de fallecimiento.');
  tareas.push('- [ ] Localizar en censos y registros disponibles.');

  return `---
summary: ""
---

# Investigación: ${p.name}

## La historia

_Investigación pendiente._

## Cronología

${cronologia}

## Qué falta / hipótesis

_(pendiente)_

## Líneas de investigación

${tareas.join('\n')}

## Fuentes

_(ninguna registrada aún)_
`;
}

function main() {
  const personas = JSON.parse(fs.readFileSync(ARBOL_JSON, 'utf8')).personas || [];
  if (!fs.existsSync(PERSONAS_DIR)) fs.mkdirSync(PERSONAS_DIR, { recursive: true });

  let creados = 0, existentes = 0;
  personas.forEach(p => {
    const file = path.join(PERSONAS_DIR, `${p.id}.md`);
    if (fs.existsSync(file)) { existentes++; return; }
    if (DRY) { console.log(`  + (dry) ${p.id} — ${p.name}`); creados++; return; }
    fs.writeFileSync(file, stub(p));
    console.log(`  ✅ ${p.id} — ${p.name}`);
    creados++;
  });

  console.log(`\n${DRY ? '[dry] ' : ''}Stubs ${DRY ? 'a crear' : 'creados'}: ${creados} · ya existían: ${existentes} · total personas: ${personas.length}`);
}

main();
