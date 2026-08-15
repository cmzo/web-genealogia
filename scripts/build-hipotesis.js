#!/usr/bin/env node

// Genera assets/data/hipotesis.json (content/hipotesis/*.md, curadas a mano) y
// assets/data/todo.json (pendientes `- [ ]` autogenerados de content/personas/*.md,
// clasificados por tipo de trámite). Alimenta hipotesis.html. Corre después de
// buildArbolData() — necesita assets/data/arbol.json para los nombres.

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { extractFrontMatter } = require('./lib/markdown');

const HIPOTESIS_DIR = './content/hipotesis';
const PERSONAS_DIR = './content/personas';
const ARBOL_FILE = './assets/data/arbol.json';
const HIPOTESIS_FILE = './assets/data/hipotesis.json';
const TODO_FILE = './assets/data/todo.json';
const DUDAS_FILE = './assets/data/dudas.json';

// Placeholders del template de `crear_archivo_investigacion` para personas sin
// investigar todavía — no son tareas reales, no deben contar como pendientes curables.
const BOILERPLATE_EXACT = new Set([
  'Buscar acta de nacimiento.',
  'Confirmar fecha y lugar de fallecimiento.',
  'Localizar en censos y registros disponibles.',
]);

const CATEGORIAS = [
  { id: 'archivo', label: 'Archivo (AEV / presencial)', re: /\bAEV\b|archives? de l'[ée]tat|consulta presencial|solo\b.{0,15}presencial|minutas notariales|solicitar\b.{0,25}(al AEV|reproducci[oó]n)/i },
  { id: 'nacimiento', label: 'Nacimiento / bautismo', re: /bautismo|acta de nacimiento|partida de nacimiento/i },
  { id: 'matrimonio', label: 'Matrimonio', re: /matrimonio|casamiento|cas[oó] (con|en)|\bboda\b/i },
  { id: 'defuncion', label: 'Defunción', re: /defunci[oó]n|fallecimiento|falleci[oó]|muri[oó]|entierro|inhumaci[oó]n/i },
  { id: 'censos', label: 'Censos', re: /censo/i },
  { id: 'otros', label: 'Otros / identificación', re: null },
];
function categorize(text) {
  return (CATEGORIAS.find(c => c.re && c.re.test(text)) || CATEGORIAS[CATEGORIAS.length - 1]).id;
}

// [[slug]] / [[slug|alias]] → span con el hover-popup; junto con los refs detectados
// (para poder listar, si hace falta, todas las tareas que citan una hipótesis).
function resolveLinks(text, slugSet) {
  const refs = [];
  const html = text.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (m, slug, alias) => {
    slug = slug.trim();
    const label = (alias || slug).trim();
    if (!slugSet.has(slug)) return label;
    refs.push(slug);
    return `<span class="hyp-ref" data-hyp="${slug}">${label}</span>`;
  });
  return { html, refs };
}

function buildHipotesisData() {
  const items = [];
  if (fs.existsSync(HIPOTESIS_DIR)) {
    fs.readdirSync(HIPOTESIS_DIR).filter(f => f.endsWith('.md')).forEach(file => {
      const raw = fs.readFileSync(path.join(HIPOTESIS_DIR, file), 'utf8');
      const { metadata, content } = extractFrontMatter(raw);
      if (!metadata.title) { console.warn(`⚠️  hipotesis/${file} sin título — se omite`); return; }
      const llave = metadata.llave_tarea ? {
        tarea: metadata.llave_tarea,
        donde: metadata.llave_donde || '',
        destraba: metadata.llave_destraba || '',
        nuevo: metadata.llave_nuevo || '',
      } : null;
      items.push({
        slug: file.replace(/\.md$/, ''),
        title: metadata.title,
        estado: metadata.estado || 'speculative',
        resumen: metadata.resumen || '',
        falta: metadata.falta || '',
        personas: (metadata.personas || '').split(',').map(s => s.trim()).filter(Boolean),
        llave,
        html: marked.parse(content.trim()),
      });
    });
  }
  fs.writeFileSync(HIPOTESIS_FILE, JSON.stringify(items, null, 2));
  const nLlaves = items.filter(h => h.llave).length;
  console.log(`✅ Generado: ${HIPOTESIS_FILE} (${items.length} hipótesis, ${nLlaves} llaves)`);
  return items;
}

// Extrae los bloques `> [!duda] texto…` de una nota de persona. El texto va
// inline tras el marcador (a veces con continuación en líneas "> " siguientes).
function extractDudas(content) {
  const dudas = [];
  const lines = content.split('\n');
  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(/^\s*>\s*\[!duda\]\s*(.*)$/);
    if (m) {
      const block = m[1].trim() ? [m[1].trim()] : [];
      i++;
      while (i < lines.length && lines[i].trim().startsWith('>') && !lines[i].includes('[!')) {
        const cont = lines[i].trim().replace(/^>\s*/, '').trim();
        if (cont) block.push(cont);
        i++;
      }
      const texto = block.join(' ').trim();
      if (texto) dudas.push(texto);
    } else {
      i++;
    }
  }
  return dudas;
}

function buildDudasData() {
  const dudasPorPersona = {};
  if (fs.existsSync(PERSONAS_DIR)) {
    fs.readdirSync(PERSONAS_DIR).filter(f => f.endsWith('.md')).forEach(file => {
      const pid = file.replace(/\.md$/, '');
      const { content } = extractFrontMatter(fs.readFileSync(path.join(PERSONAS_DIR, file), 'utf8'));
      const dudas = extractDudas(content);
      if (dudas.length) dudasPorPersona[pid] = dudas;
    });
  }
  fs.writeFileSync(DUDAS_FILE, JSON.stringify(dudasPorPersona, null, 2));
  console.log(`✅ Generado: ${DUDAS_FILE} (${Object.keys(dudasPorPersona).length} personas con dudas)`);
  return dudasPorPersona;
}

function buildTodoData(hipotesisItems) {
  const slugSet = new Set(hipotesisItems.map(h => h.slug));
  let nombrePorId = {};
  if (fs.existsSync(ARBOL_FILE)) {
    const arbol = JSON.parse(fs.readFileSync(ARBOL_FILE, 'utf8'));
    nombrePorId = Object.fromEntries((arbol.personas || []).map(p => [p.id, p.name]));
  }

  const tareas = [];
  if (fs.existsSync(PERSONAS_DIR)) {
    fs.readdirSync(PERSONAS_DIR).filter(f => f.endsWith('.md')).forEach(file => {
      const pid = file.replace(/\.md$/, '');
      const raw = fs.readFileSync(path.join(PERSONAS_DIR, file), 'utf8');
      const { content } = extractFrontMatter(raw);
      // «## Versión anterior» marca investigación superada, conservada como
      // historial — todo lo que sigue queda afuera (si no, tareas ya resueltas
      // o duplicadas de la sección vigente reaparecían como pendientes).
      const vigente = content.split(/^##\s*Versión anterior\b.*$/m)[0];
      vigente.split('\n').forEach(line => {
        const m = line.match(/^\s*-\s*\[ \]\s*(.+)$/);
        if (!m) return;
        const text = m[1].trim();
        if (BOILERPLATE_EXACT.has(text)) return;
        const { html, refs } = resolveLinks(text, slugSet);
        tareas.push({ persona: pid, nombre: nombrePorId[pid] || pid, categoria: categorize(text), html: marked.parseInline(html), refs });
      });
    });
  }
  fs.writeFileSync(TODO_FILE, JSON.stringify(tareas, null, 2));
  console.log(`✅ Generado: ${TODO_FILE} (${tareas.length} tareas)`);
}

function build() {
  const hip = buildHipotesisData();
  buildDudasData();
  buildTodoData(hip);
}

if (require.main === module) build();
module.exports = { build };
