/**
 * timeline.js — modal de línea de tiempo por persona.
 *
 * Muestra ancestros (hacia arriba), la persona seleccionada (centro)
 * y descendientes (hacia abajo) sobre un eje temporal, con eventos
 * históricos mundiales como contexto en el carril izquierdo.
 *
 * Uso: openTimeline(personId)
 */

import { getPersona, getHijosByPersona } from './data.js';
import { getBranchColor } from './config.js';

const PX            = 20;   // píxeles por año
const YEAR_PAD      = 6;    // años de margen arriba y abajo
const AXIS_X        = 300;  // posición x del eje dentro del canvas (px)
const MIN_GAP       = 34;   // separación mínima entre nodos familiares (px)
const EVENT_MIN_GAP = 34;   // separación mínima entre eventos (px)
const GEN_GAP       = 28;   // brecha generacional estimada cuando falta fecha (años)

/* ── Eventos mundiales ──────────────────────────────────────────────────────── */
const WORLD_EVENTS = [
  { year: 1748, text: 'Tratado de Aquisgrán' },
  { year: 1776, text: 'Independencia EE.UU.' },
  { year: 1789, text: 'Revolución Francesa' },
  { year: 1804, text: 'Napoleón, Emperador' },
  { year: 1815, text: 'Congreso de Viena' },
  { year: 1848, text: 'Constitución Federal Suiza' },
  { year: 1859, text: 'El origen de las especies' },
  { year: 1869, text: 'Canal de Suez' },
  { year: 1879, text: 'Luz eléctrica (Edison)' },
  { year: 1880, text: 'Gran migración europea' },
  { year: 1903, text: 'Primer vuelo en avión' },
  { year: 1914, text: '1.ª Guerra Mundial' },
  { year: 1918, text: 'Fin WWI · Gripe española' },
  { year: 1929, text: 'Gran Depresión' },
  { year: 1939, text: '2.ª Guerra Mundial' },
  { year: 1945, text: 'Fin WWII · ONU fundada' },
  { year: 1957, text: 'Sputnik' },
  { year: 1969, text: 'Hombre en la Luna' },
  { year: 1989, text: 'Caída del Muro de Berlín' },
  { year: 1991, text: 'World Wide Web' },
  { year: 2001, text: '11 de septiembre' },
  { year: 2020, text: 'Pandemia COVID-19' },
];

/* ── Utilidades de fecha ─────────────────────────────────────────────────────── */

function parseYear(d) {
  if (!d) return null;
  const r = String(d).match(/^(\d{4})\/(\d{4})$/);
  if (r) return (parseInt(r[1]) + parseInt(r[2])) >> 1;
  const m = String(d).match(/^(\d{4})/);
  return m ? parseInt(m[1]) : null;
}

function lifeSpan(p, estimatedBirth = null) {
  const b = estimatedBirth ?? parseYear(p.birth_date);
  const d = parseYear(p.death_date);
  if (!b) return '';
  const prefix = estimatedBirth !== null ? '~' : '';
  const end = p.vivo === 'si' ? 'presente' : (d ? String(d) : '†?');
  return `${prefix}${b}–${end}`;
}

/* ── Recorrido del árbol ─────────────────────────────────────────────────────── */

function getAncestorChain(personId) {
  const chain = [];
  const seen  = new Set();
  let id = personId;
  while (id && !seen.has(id)) {
    seen.add(id);
    const p = getPersona(id);
    if (!p) break;
    chain.unshift(p);
    id = p.father_id || p.mother_id || null;
  }
  return chain;   // [oldest … root]
}

function getDescendants(personId) {
  const result = [];
  const seen   = new Set([personId]);
  function dfs(id, depth) {
    const kids = [...getHijosByPersona(id)].sort(
      (a, b) => (parseYear(a.birth_date) || 9999) - (parseYear(b.birth_date) || 9999)
    );
    for (const c of kids) {
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      result.push({ p: c, depth });
      dfs(c.id, depth + 1);
    }
  }
  dfs(personId, 1);
  return result;
}

/* ── Separación de nodos ─────────────────────────────────────────────────────── */

function separateNodes(nodes, minGap = MIN_GAP) {
  for (let i = 1; i < nodes.length; i++) {
    if (nodes[i].y - nodes[i - 1].y < minGap) {
      nodes[i].y = nodes[i - 1].y + minGap;
    }
  }
}

/* ── API pública ─────────────────────────────────────────────────────────────── */

export function openTimeline(personId) {
  const root = getPersona(personId);
  if (!root) return;
  document.querySelector('.tl-modal')?.remove();

  const chain     = getAncestorChain(personId);   // [oldest … root]
  const ancestors = chain.slice(0, -1);
  const desc      = getDescendants(personId);

  /* ── Paso 1: año de la raíz (real o estimado desde descendientes) ── */
  const rootKnownYr = parseYear(root.birth_date);
  const descYears   = desc.map(d => parseYear(d.p.birth_date)).filter(Boolean);
  const rootYr      = rootKnownYr
    ?? (descYears.length ? Math.min(...descYears) - GEN_GAP : null);
  const rootEstimated = rootKnownYr === null && rootYr !== null;

  if (rootYr === null) return;   // sin ninguna fecha de referencia, no hay nada que renderizar

  /* ── Paso 2: años efectivos de toda la cadena (propagación hacia atrás) ── */
  // chain = [oldest, ..., root]. Partimos del rootYr conocido/estimado y subimos,
  // estimando cada ancestro sin fecha a partir del año efectivo de su hijo en la cadena.
  // Así la estimación se propaga aunque haya varios ancestros consecutivos sin fecha.
  const chainEffectiveYrs = new Array(chain.length).fill(null);
  chainEffectiveYrs[chain.length - 1] = rootYr;
  for (let i = chain.length - 2; i >= 0; i--) {
    const knownYr = parseYear(chain[i].birth_date);
    chainEffectiveYrs[i] = knownYr !== null
      ? knownYr
      : (chainEffectiveYrs[i + 1] !== null ? chainEffectiveYrs[i + 1] - GEN_GAP : null);
  }

  const ancestorEntries = ancestors.map((p, i) => ({
    p,
    yr:        chainEffectiveYrs[i],
    estimated: parseYear(p.birth_date) === null,
  }));

  /* ── Paso 3: "otro padre" del nodo raíz ── */
  // getAncestorChain sigue father_id primero; si hay madre también, la incluimos aquí.
  const chainIds = new Set(chain.map(p => String(p.id)));
  let otherParentEntry = null;
  if (root.father_id && root.mother_id) {
    const otherId = chainIds.has(String(root.father_id))
      ? String(root.mother_id)
      : String(root.father_id);
    const otherP = getPersona(otherId);
    if (otherP) {
      const yr    = parseYear(otherP.birth_date);
      const estYr = yr ?? (rootYr ? rootYr - GEN_GAP : null);
      if (estYr !== null) {
        otherParentEntry = { p: otherP, yr: estYr, estimated: yr === null };
      }
    }
  }

  /* ── Paso 4: rango de años (incluye todas las estimaciones) ── */
  const allYears = [
    rootYr,
    ...ancestorEntries.map(e => e.yr),
    otherParentEntry?.yr ?? null,
    ...descYears,
    new Date().getFullYear(),
  ].filter(y => y !== null);

  const minY = Math.min(...allYears) - YEAR_PAD;
  const maxY = Math.max(...allYears) + YEAR_PAD;
  const toY  = yr => Math.round((yr - minY) * PX);

  /* ── Paso 5: construir nodos ── */
  const nodeObjects = [];

  for (const { p, yr, estimated } of ancestorEntries) {
    if (yr !== null) {
      nodeObjects.push({ p, role: 'anc', y: toY(yr), estimatedBirth: estimated ? yr : null });
    }
  }

  if (otherParentEntry) {
    nodeObjects.push({
      p: otherParentEntry.p,
      role: 'anc',
      y: toY(otherParentEntry.yr),
      estimatedBirth: otherParentEntry.estimated ? otherParentEntry.yr : null,
    });
  }

  nodeObjects.push({
    p: root,
    role: 'sel',
    y: toY(rootYr),
    estimatedBirth: rootEstimated ? rootYr : null,
  });

  for (const { p } of desc) {
    const yr = parseYear(p.birth_date);
    if (yr) nodeObjects.push({ p, role: 'desc', y: toY(yr), estimatedBirth: null });
  }

  nodeObjects.sort((a, b) => a.y - b.y);
  separateNodes(nodeObjects);

  /* ── Altura del canvas ── */
  const H = Math.max(
    (maxY - minY) * PX,
    nodeObjects.length ? nodeObjects[nodeObjects.length - 1].y + 60 : 0
  );

  const rootNode  = nodeObjects.find(n => n.p.id === root.id);
  const topNode   = ancestors.length ? nodeObjects.find(n => n.p.id === chain[0].id) : null;
  const rootColor = getBranchColor(root.branch);

  /* ── Eventos mundiales: posicionar y separar ── */
  const eventObjects = WORLD_EVENTS
    .filter(e => e.year > minY && e.year < maxY)
    .map(e => ({ ...e, y: toY(e.year) }));
  for (let i = 1; i < eventObjects.length; i++) {
    if (eventObjects[i].y - eventObjects[i - 1].y < EVENT_MIN_GAP) {
      eventObjects[i].y = eventObjects[i - 1].y + EVENT_MIN_GAP;
    }
  }

  /* ── Ticks de año (cada 25 años) ── */
  const ticks = [];
  for (let y = Math.ceil(minY / 25) * 25; y <= maxY; y += 25) ticks.push(y);

  /* ── HTML ───────────────────────────────────────────────────────────────────── */

  const ticksHTML = ticks.map(y =>
    `<div class="tl-tick" style="top:${toY(y)}px"><span>${y}</span></div>`
  ).join('');

  const eventsHTML = eventObjects.map(e =>
    `<div class="tl-event" style="top:${e.y}px">
      <div class="tl-event-inner">
        <span class="tl-event-text">${e.text}</span>
        <span class="tl-event-year">${e.year}</span>
      </div>
      <div class="tl-event-pip"></div>
    </div>`
  ).join('');

  const nodesHTML = nodeObjects.map(({ p, role, y, estimatedBirth }) => {
    const color = getBranchColor(p.branch);
    return `<div class="tl-node tl-node--${role}" data-id="${p.id}" style="top:${y}px">
      <div class="tl-node-pip" style="--c:${color}"></div>
      <div class="tl-node-text">
        <span class="tl-node-name">${p.name}</span>
        <span class="tl-node-life">${lifeSpan(p, estimatedBirth)}</span>
      </div>
    </div>`;
  }).join('');

  /* Espina ancestral (SVG): usa posiciones ya separadas */
  const spine = (rootNode && topNode && chain.length > 1)
    ? `<svg class="tl-spine" width="100%" height="${H}" aria-hidden="true">
        <line x1="${AXIS_X}" y1="${topNode.y}"
              x2="${AXIS_X}" y2="${rootNode.y}"
              stroke="${rootColor}" stroke-width="2.5"
              stroke-opacity="0.4" stroke-linecap="round"/>
       </svg>`
    : '';

  /* ── Modal ──────────────────────────────────────────────────────────────────── */

  const modal = document.createElement('div');
  modal.className = 'tl-modal';
  modal.innerHTML = `
    <div class="tl-dialog" role="dialog" aria-modal="true"
         aria-label="Línea de tiempo — ${root.name}">

      <header class="tl-head">
        <div>
          <p class="tl-head-eyebrow">Línea de tiempo</p>
          <h2 class="tl-head-name">${root.name}</h2>
        </div>
        <button class="tl-close" aria-label="Cerrar línea de tiempo">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
               stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6"  y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </header>

      <div class="tl-scroll">
        <div class="tl-canvas" style="height:${H}px">
          <div class="tl-axis-line"></div>
          ${spine}
          <div class="tl-ticks">${ticksHTML}</div>
          <div class="tl-events-col">${eventsHTML}</div>
          <div class="tl-nodes-col">${nodesHTML}</div>
        </div>
      </div>
    </div>`;

  document.body.appendChild(modal);

  /* Cerrar */
  modal.querySelector('.tl-close').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  addEventListener('keydown', function onEsc(e) {
    if (e.key !== 'Escape') return;
    modal.remove();
    removeEventListener('keydown', onEsc);
  });

  /* Scroll inicial: persona seleccionada al 38% del área visible */
  if (rootNode) {
    requestAnimationFrame(() => {
      const scroll = modal.querySelector('.tl-scroll');
      scroll.scrollTop = Math.max(0, rootNode.y - scroll.clientHeight * 0.38);
    });
  }
}
