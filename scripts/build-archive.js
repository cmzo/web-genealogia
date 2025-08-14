#!/usr/bin/env node
/*
  build-archive.js
  - Lee Google Sheets (People + Media) o un CSV/JSON local
  - Genera content/data/archive.json con índice y medios por persona

  Uso básico:
    node scripts/build-archive.js \
      --sheet-id <SHEET_ID> \
      --people-gid <GID> \
      --media-gid <GID>

  Opcionales:
    --out content/data/archive.json
*/

const fs = require('fs');
const path = require('path');

function arg(key, def = '') {
  const idx = process.argv.indexOf(`--${key}`);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return def;
}

const SHEET_ID = arg('sheet-id', '');
const PEOPLE_GID = arg('people-gid', '');
const MEDIA_GID = arg('media-gid', '');
const OUT_PATH = arg('out', path.join(process.cwd(), 'content/data/archive.json'));

async function fetchSheetJson(sheetId, gid) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}`;
  const res = await fetch(url);
  const text = await res.text();
  const jsonText = text.startsWith('/*O_o*/') ? text.replace(/^\/\*O_o\*\/\s*/, '') : text;
  const match = jsonText.match(/\{[\s\S]*\}/);
  if (!match) {
    console.error('Respuesta GViz inválida (primeros 200 chars):', jsonText.slice(0, 200));
    console.error('URL:', url);
    throw new Error('No se encontró JSON válido en la respuesta (¿hoja no pública o ID/GID incorrectos?)');
  }
  let data;
  try {
    data = JSON.parse(match[0]);
  } catch (e) {
    console.error('Parse falló. Fragmento:', match[0].slice(0, 200));
    console.error('URL:', url);
    throw e;
  }
  return data;
}

function sheetToRows(data) {
  const cols = data.table.cols || [];
  const colIndex = {};
  cols.forEach((col, idx) => {
    const key = (col.label || col.id || '').toString().trim().toLowerCase();
    if (key) colIndex[key] = idx;
  });
  function get(cells, label, fallback = '') {
    const idx = colIndex[label];
    return idx !== undefined ? (cells[idx]?.v ?? fallback) : fallback;
  }
  return (data.table.rows || []).map(row => {
    const c = row.c || [];
    return { get: (label, fb) => get(c, label, fb) };
  });
}

function toSlug(s) {
  return String(s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

async function main() {
  let people = [];
  let mediaByPerson = {};

  let meta = { source: 'example', generatedAt: new Date().toISOString() };

  if (SHEET_ID && PEOPLE_GID) {
    console.log('Leyendo Google Sheets…');
    const peopleRaw = await fetchSheetJson(SHEET_ID, PEOPLE_GID);
    const pRows = sheetToRows(peopleRaw);

    people = pRows.map(r => {
      const id = String(r.get('id', '')).trim();
      const name = String(r.get('name', '')).trim();
      return {
        id,
        slug: toSlug(r.get('slug', '') || name || id),
        name,
        years: String(r.get('years', '') || '').trim(),
        branch: String(r.get('branch', '') || '').trim(),
        generation: Number(r.get('generation', '') || 0),
        place: String(r.get('place', '') || '').trim(),
        tags: String(r.get('tags', '') || '').trim(),
        count_media: 0,
        bio_short: String(r.get('bio_short', '') || '').trim(),
        story_long: String(r.get('story_long', '') || '').trim(),
        tree_id: String(r.get('tree_id', '') || '').trim(),
        sources: String(r.get('sources', '') || '').trim()
      };
    });

    mediaByPerson = {};
    if (MEDIA_GID) {
      const mediaRaw = await fetchSheetJson(SHEET_ID, MEDIA_GID);
      const mRows = sheetToRows(mediaRaw);
      mRows.forEach(r => {
        const personId = String(r.get('person_id', '')).trim();
        const type = String(r.get('type', 'photo')).trim().toLowerCase();
        const entry = {
          type,
          date: String(r.get('date', '') || '').trim(),
          place: String(r.get('place', '') || '').trim(),
          caption: String(r.get('caption', '') || '').trim(),
          source: String(r.get('source', '') || '').trim(),
          license: String(r.get('license', '') || '').trim(),
          thumb: String(r.get('thumb', '') || r.get('filename', '') || r.get('url', '') || '').trim(),
          full: String(r.get('full', '') || r.get('url', '') || r.get('filename', '') || '').trim(),
          url: String(r.get('url', '') || '').trim(),
          title: String(r.get('title', '') || '').trim()
        };
        if (!mediaByPerson[personId]) mediaByPerson[personId] = [];
        mediaByPerson[personId].push(entry);
      });
    }

    // contar medios (si no hay media sheet, queda 0)
    const countMap = Object.fromEntries(Object.entries(mediaByPerson).map(([pid, arr]) => [pid, arr.length]));
    people = people.map(p => ({ ...p, count_media: countMap[p.id] || 0 }));
    meta.source = 'sheet';
  } else {
    console.log('Sin parámetros de Sheets. Generando archivo mínimo de ejemplo.');
    people = [
      { id: 'p1', slug: 'francisco-clemenzo', name: 'Francisco Clemenzo', years: '1856–1928', branch: 'clemenzo', generation: 5, place: 'Entre Ríos', count_media: 2, bio_short: 'Artesano suizo.', story_long: 'Anécdota…' },
      { id: 'p2', slug: 'celestina-roch', name: 'Celestina Roch', years: '1887–1968', branch: 'roch', generation: 5, place: 'Suiza', count_media: 1 }
    ];
    mediaByPerson = {
      'p1': [
        { type:'photo', thumb:'assets/images/cards/arbol.webp', full:'assets/images/cards/arbol.webp', caption:'Retrato' },
        { type:'doc', url:'assets/images/posts/FJHC_1859_firma.png', title:'Firma 1859' }
      ],
      'p2': [ { type:'photo', thumb:'assets/images/cards/quiensoy.webp', full:'assets/images/cards/quiensoy.webp', caption:'Foto' } ]
    };
  }

  // salida
  const outDir = path.dirname(OUT_PATH);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify({ meta, people, media: mediaByPerson }, null, 2), 'utf8');
  console.log('OK →', OUT_PATH, `(personas: ${people.length})`);
}

// Node 18+ trae fetch; si no, avisar
if (typeof fetch !== 'function') {
  console.error('Este script requiere Node 18+ (fetch nativo).');
  process.exit(1);
}

main().catch(e => {
  console.error('Error en build-archive:', e);
  process.exit(1);
});


