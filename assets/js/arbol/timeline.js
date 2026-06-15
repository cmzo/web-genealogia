/**
 * timeline.js — modal de línea de tiempo por persona.
 */

import { getPersona, getHijosByPersona, getMatrimoniosByPersona } from './data.js';
import { getBranchColor } from './config.js';
import { setSelected } from './store.js';

const PX            = 20;
const YEAR_PAD      = 6;
const AXIS_X        = 180;  // x del eje dentro del SVG/eventos (relativo al inicio --cl)
const MIN_GAP       = 34;
const EVENT_MIN_GAP = 34;
const GEN_GAP       = 28;

/* Líneas de fase geográfica. La columna de la línea de tiempo es compacta (--cl=40px)
   y la tarjeta de detalle ocupa el resto. SVG coords = canvas_x - --cl(40). */
const TL_CL           = 40;                       // = --cl en CSS (margen izquierdo)
const PHASE_SVG_XS    = [500, 550, 600, 650];                 // coords SVG
const PHASE_CANVAS_XS = PHASE_SVG_XS.map(x => x + TL_CL);     // [540,590,640,690] (sticky reader)
const PHASE_LABELS    = ['nació', 'creció', 'vivió', 'murió'];

/* ── Eventos mundiales ──────────────────────────────────────────────────────── */
const WORLD_EVENTS = [
  { year: 1748, text: 'Tratado de Aquisgrán', wiki: 'Tratado de Aquisgrán (1748)',
    desc: 'Puso fin a la guerra de sucesión austriaca y restableció el equilibrio de poder en Europa central.' },
  { year: 1776, text: 'Independencia EE.UU.', wiki: 'Declaración de Independencia de los Estados Unidos',
    desc: 'La Declaración de Independencia proclamó que las Trece Colonias norteamericanas se separaban del Imperio Británico.' },
  { year: 1789, text: 'Revolución Francesa', wiki: 'Revolución francesa',
    desc: 'Derrocó el Antiguo Régimen en Francia e instauró los principios de libertad, igualdad y fraternidad, transformando Europa.' },
  { year: 1804, text: 'Napoleón, Emperador', wiki: 'Primer Imperio francés',
    desc: 'Napoleón Bonaparte proclamó el Primer Imperio francés y dominó gran parte de Europa continental durante una década.' },
  { year: 1815, text: 'Congreso de Viena', wiki: 'Congreso de Viena',
    desc: 'Reorganizó Europa tras las guerras napoleónicas y restauró el equilibrio entre potencias que perduró casi un siglo.' },
  { year: 1848, text: 'Constitución Federal Suiza', wiki: 'Constitución Federal Suiza',
    desc: 'Transformó la Confederación de cantones en un Estado federal moderno, unificando el sistema político, jurídico y monetario suizo.' },
  { year: 1859, text: 'El origen de las especies', wiki: 'El origen de las especies',
    desc: 'Charles Darwin explicó la diversidad de la vida mediante la selección natural, sentando las bases de la biología evolutiva.' },
  { year: 1869, text: 'Canal de Suez', wiki: 'Canal de Suez',
    desc: 'Canal artificial en Egipto que une el Mediterráneo con el mar Rojo, acortando las rutas marítimas entre Europa y Asia.' },
  { year: 1879, text: 'Luz eléctrica (Edison)', wiki: 'Lámpara incandescente',
    desc: 'Thomas Edison desarrolló la primera lámpara incandescente práctica, inaugurando la era de la iluminación eléctrica doméstica.' },
  { year: 1880, text: 'Gran migración europea', wiki: 'Inmigración en Argentina',
    desc: 'Entre 1880 y 1930, cerca de 60 millones de europeos emigraron a América. Suizos e italianos llegaron masivamente a Argentina.' },
  { year: 1903, text: 'Primer vuelo en avión', wiki: 'Hermanos Wright',
    desc: 'Los hermanos Wright realizaron el primer vuelo motorizado controlado de la historia, en Kitty Hawk, Carolina del Norte.' },
  { year: 1914, text: '1.ª Guerra Mundial', wiki: 'Primera Guerra Mundial',
    desc: 'Conflicto armado que involucró a la mayoría de las potencias mundiales. Causó más de 17 millones de muertos entre 1914 y 1918.' },
  { year: 1918, text: 'Fin WWI · Gripe española', wiki: 'Gripe de 1918',
    desc: 'La pandemia de gripe española infectó a 500 millones de personas en todo el mundo, causando entre 50 y 100 millones de muertes.' },
  { year: 1929, text: 'Gran Depresión', wiki: 'Gran Depresión',
    desc: 'El crack bursátil de Wall Street desencadenó la mayor crisis económica del siglo XX, con desempleo masivo en todo el mundo.' },
  { year: 1939, text: '2.ª Guerra Mundial', wiki: 'Segunda Guerra Mundial',
    desc: 'Conflicto global entre 1939 y 1945 que causó entre 70 y 85 millones de muertos, incluyendo el Holocausto.' },
  { year: 1945, text: 'Fin WWII · ONU fundada', wiki: 'Organización de las Naciones Unidas',
    desc: 'La ONU fue fundada el 26 de junio de 1945 para mantener la paz y la cooperación entre naciones tras la Segunda Guerra Mundial.' },
  { year: 1957, text: 'Sputnik', wiki: 'Sputnik 1',
    desc: 'Primer satélite artificial de la historia, lanzado por la URSS. Inició la carrera espacial entre las superpotencias.' },
  { year: 1969, text: 'Hombre en la Luna', wiki: 'Apolo 11',
    desc: 'La misión Apolo 11 llevó a Neil Armstrong y Buzz Aldrin a la superficie lunar el 20 de julio de 1969.' },
  { year: 1989, text: 'Caída del Muro de Berlín', wiki: 'Caída del Muro de Berlín',
    desc: 'El Muro de Berlín cayó el 9 de noviembre de 1989, marcando el fin de la Guerra Fría y el camino a la reunificación alemana.' },
  { year: 1991, text: 'World Wide Web', wiki: 'World Wide Web',
    desc: 'Tim Berners-Lee creó la World Wide Web como sistema de hipervínculos accesible por internet, transformando la comunicación global.' },
  { year: 2001, text: '11 de septiembre', wiki: 'Atentados del 11 de septiembre de 2001',
    desc: 'Cuatro atentados suicidas coordinados por Al Qaeda mataron a casi 3.000 personas en Nueva York, Washington y Pensilvania.' },
  { year: 2020, text: 'Pandemia COVID-19', wiki: 'Pandemia de COVID-19',
    desc: 'La pandemia causada por el virus SARS-CoV-2 se extendió globalmente causando millones de muertes y una profunda crisis socioeconómica.' },
];

/* ── Utilidades ──────────────────────────────────────────────────────────────── */

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

const MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function formatDate(d) {
  if (!d) return null;
  const s = String(d);
  if (s.includes('/')) return s.replace('/', '–');
  const mFull = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (mFull) return `${parseInt(mFull[3])} ${MONTHS[parseInt(mFull[2]) - 1]}. ${mFull[1]}`;
  return s.match(/^\d{4}$/)?.[0] ?? s;
}

function esc(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function getCountry(p) {
  const bp = (p.birth_place  || '').toLowerCase();
  const dp = (p.death_place  || '').toLowerCase();
  const isCH = s => /valais|riddes|ardon|sion|martigny|salins|conthey|suiza|suisse|schweiz/.test(s);
  const isAR = s => /argentina|entre r[ií]os|buenos aires|caba|concordia|gualeguay|concepci[oó]n del uruguay|col[oó]n|santa fe/.test(s);
  if (isCH(bp) && isAR(dp)) return 'MIGR';
  if (isCH(bp) || isCH(dp)) return 'CH';
  if (isAR(bp) || isAR(dp)) return 'AR';
  return null;
}

function getPhases(p, estimatedBirth, toY) {
  const country = getCountry(p);
  const birthYr = estimatedBirth ?? parseYear(p.birth_date);
  const deathYr = parseYear(p.death_date);
  const endYr   = p.vivo === 'si' ? new Date().getFullYear() : deathYr;
  if (!birthYr) return null;

  const migrYr = (country === 'MIGR' && endYr)
    ? Math.round(birthYr + (endYr - birthYr) * 0.45)
    : null;
  const countryAt = yr => {
    if (!country) return null;
    if (country === 'MIGR') return (migrYr && yr < migrYr) ? 'CH' : 'AR';
    return country;
  };

  const p2yr = birthYr + 20;
  const p3yr = birthYr + 40;
  return [
    { label: 'nació',  yr: birthYr, y: toY(birthYr),                                 country: countryAt(birthYr)      },
    { label: 'creció', yr: p2yr,    y: (!endYr || p2yr <= endYr) ? toY(p2yr) : null, country: countryAt(p2yr)         },
    { label: 'vivió',  yr: p3yr,    y: (!endYr || p3yr <= endYr) ? toY(p3yr) : null, country: countryAt(p3yr)         },
    { label: 'murió',  yr: endYr,   y: endYr ? toY(endYr) : null,                    country: countryAt(endYr ?? 9999) },
  ];
}

function renderStickyReader(el, n, toY) {
  if (!el || !n) return;
  const phases = getPhases(n.p, n.estimatedBirth, toY);
  const geoFlag = c => c === 'CH' ? '🇨🇭' : c === 'AR' ? '🇦🇷' : '';
  /* Solo banderas — el nombre ya está en el canvas y "pasa" por debajo del reader */
  const cellsHTML = (phases || []).map((ph, i) =>
    `<span class="tl-sr-cell" style="left:${PHASE_CANVAS_XS[i]}px">
       <span class="tl-sr-flag">${ph.country ? geoFlag(ph.country) : '<span class="tl-sr-empty">·</span>'}</span>
       <span class="tl-sr-label">${PHASE_LABELS[i]}</span>
     </span>`
  ).join('');
  el.innerHTML = cellsHTML;
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
  return chain;
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

function separateNodes(nodes, minGap = MIN_GAP) {
  for (let i = 1; i < nodes.length; i++) {
    if (nodes[i].y - nodes[i - 1].y < minGap) {
      nodes[i].y = nodes[i - 1].y + minGap;
    }
  }
}

/* ── Wikipedia (resumen + miniatura, cliente, con caché) ─────────────────────── */

const _wikiCache = new Map();   // título -> { thumb, url, extract } | null

async function fetchWiki(title) {
  if (!title) return null;
  if (_wikiCache.has(title)) return _wikiCache.get(title);
  const ssKey = 'tlwiki2:' + title;   // v2: la forma cacheada ahora incluye extract
  try {
    const cached = sessionStorage.getItem(ssKey);
    if (cached) { const v = JSON.parse(cached); _wikiCache.set(title, v); return v; }
  } catch { /* sessionStorage no disponible */ }
  try {
    const r = await fetch(
      `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { headers: { Accept: 'application/json' } }
    );
    if (!r.ok) throw new Error('wiki ' + r.status);
    const j = await r.json();
    const v = {
      thumb:   j.thumbnail?.source || null,
      url:     j.content_urls?.desktop?.page || `https://es.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      extract: j.extract || null,
    };
    _wikiCache.set(title, v);
    try { sessionStorage.setItem(ssKey, JSON.stringify(v)); } catch { /* ignore */ }
    return v;
  } catch {
    return null;   // no cachear el fallo: permite reintentar en la próxima apertura
  }
}

/* ── Panel de detalle ─────────────────────────────────────────────────────────── */

const wikiUrl = t => `https://es.wikipedia.org/wiki/${encodeURIComponent(String(t).replace(/ /g, '_'))}`;

/* ── Etiqueta de relación con la persona en foco ─────────────────────────────── */

const ANC_TERMS = [
  null,
  { m: 'Padre',       f: 'Madre',       n: 'Padre/Madre'   },
  { m: 'Abuelo',      f: 'Abuela',      n: 'Abuelo/a'      },
  { m: 'Bisabuelo',   f: 'Bisabuela',   n: 'Bisabuelo/a'   },
  { m: 'Tatarabuelo', f: 'Tatarabuela', n: 'Tatarabuelo/a' },
];
const DESC_TERMS = [
  null,
  { m: 'Hijo',        f: 'Hija',        n: 'Hijo/a'        },
  { m: 'Nieto',       f: 'Nieta',       n: 'Nieto/a'       },
  { m: 'Bisnieto',    f: 'Bisnieta',    n: 'Bisnieto/a'    },
  { m: 'Tataranieto', f: 'Tataranieta', n: 'Tataranieto/a' },
];

function genderTerm(t, gender) {
  return gender === 'M' ? t.m : gender === 'F' ? t.f : t.n;
}

/** role: 'sel'|'anc'|'desc' · dist: distancia generacional · gender · rootFirst: nombre de pila raíz */
function relationLabel(role, dist, gender, rootFirst) {
  if (role === 'sel') return 'Persona en foco';
  if (role === 'anc') {
    const t = ANC_TERMS[dist];
    return t ? `${genderTerm(t, gender)} de ${rootFirst}` : `Ascendiente de ${rootFirst}`;
  }
  if (role === 'desc') {
    const t = DESC_TERMS[dist];
    return t ? `${genderTerm(t, gender)} de ${rootFirst}` : `Descendiente de ${rootFirst}`;
  }
  return '';
}

/* ── Builders de contenido del panel ─────────────────────────────────────────── */

function buildEventHTML(ev) {
  return `<p class="tl-popup-eyebrow">${esc(ev.year)} · Contexto histórico</p>
    <h3 class="tl-popup-title">${esc(ev.text)}</h3>
    <div class="tl-popup-media" hidden></div>
    <p class="tl-popup-body">${esc(ev.desc)}</p>
    ${ev.wiki ? `<div class="tl-detail-block tl-popup-wiki" hidden>
       <p class="tl-detail-subhead">Según Wikipedia</p>
       <p class="tl-popup-wiki-text"></p>
     </div>
     <a class="tl-popup-link" href="${esc(wikiUrl(ev.wiki))}" target="_blank" rel="noopener noreferrer">Leer en Wikipedia ↗</a>` : ''}`;
}

function buildPersonHTML(nodeData, rootFirst) {
  const { p, estimatedBirth = null, role, dist, rel } = nodeData;
  const relText = rel || relationLabel(role, dist, p.gender, rootFirst);

  const bFmt  = estimatedBirth ? `~${estimatedBirth}` : formatDate(p.birth_date);
  const born  = [bFmt, p.birth_place].filter(Boolean).join(', ');

  let died = '';
  if (p.vivo !== 'si' && (p.death_date || p.death_place)) {
    died = [formatDate(p.death_date), p.death_place].filter(Boolean).join(', ') || '†';
  }

  /* Matrimonios con cónyuge y fecha/lugar */
  const marriages = getMatrimoniosByPersona(p.id) || [];
  const marrRows = marriages.map(m => {
    const otherId = String(m.spouse1_id) === String(p.id) ? m.spouse2_id : m.spouse1_id;
    const sp = otherId ? getPersona(otherId) : null;
    if (!sp) return '';
    const when = [formatDate(m.marriage_date), m.marriage_place].filter(Boolean).join(', ');
    return `<span class="tl-popup-row"><span class="tl-popup-k">∞</span> ${esc(sp.name)}${when ? ` · ${esc(when)}` : ''}</span>`;
  }).filter(Boolean).join('');

  const kids  = getHijosByPersona(p.id) || [];
  const note  = p.notes ? String(p.notes).replace(/\s+/g, ' ').trim() : '';
  const media = p.media || [];

  const docsList = media.length
    ? `<div class="tl-detail-block">
        <p class="tl-detail-subhead">${media.length} ${media.length === 1 ? 'documento' : 'documentos'}</p>
        ${media.slice(0, 8).map(m =>
          `<span class="tl-detail-doc">${esc(m.caption || m.source_label || 'Documento')}${m.date ? ` · ${esc(formatDate(m.date))}` : ''}</span>`
        ).join('')}
        ${media.length > 8 ? `<span class="tl-detail-doc tl-detail-more">+${media.length - 8} más</span>` : ''}
      </div>`
    : '';

  const verified = p.status === 'verificado'
    ? `<span class="tl-popup-verified">✓ Verificado</span>` : '';

  return `<p class="tl-popup-eyebrow">${esc(relText)}</p>
    <h3 class="tl-popup-title">${esc(p.name)}</h3>
    <div class="tl-popup-rows">
      ${born ? `<span class="tl-popup-row"><span class="tl-popup-k">n.</span> ${esc(born)}</span>` : ''}
      ${died ? `<span class="tl-popup-row"><span class="tl-popup-k">†</span> ${esc(died)}</span>` : ''}
      ${p.vivo === 'si' ? `<span class="tl-popup-row tl-popup-alive">vive</span>` : ''}
      ${marrRows}
      ${kids.length ? `<span class="tl-popup-row"><span class="tl-popup-k">⌖</span> ${kids.length} ${kids.length === 1 ? 'hijo/a' : 'hijos'}</span>` : ''}
    </div>
    ${note ? `<p class="tl-popup-note">${esc(note)}</p>` : ''}
    ${docsList}
    <div class="tl-popup-foot">
      <span class="tl-popup-meta">
        ${p.branch ? `<span class="tl-popup-branch">${esc(p.branch)}</span>` : ''}
        ${verified}
      </span>
      <button class="tl-popup-action" data-tl-ficha="${esc(p.id)}">Abrir ficha →</button>
    </div>`;
}

/* ── API pública ─────────────────────────────────────────────────────────────── */

export function openTimeline(personId) {
  const root = getPersona(personId);
  if (!root) return;
  document.querySelector('.tl-modal')?.remove();

  const chain     = getAncestorChain(personId);
  const ancestors = chain.slice(0, -1);
  const desc      = getDescendants(personId);

  /* ── Año raíz: real o estimado desde descendientes ── */
  const rootKnownYr = parseYear(root.birth_date);
  const descYears   = desc.map(d => parseYear(d.p.birth_date)).filter(Boolean);
  const rootYr      = rootKnownYr ?? (descYears.length ? Math.min(...descYears) - GEN_GAP : null);
  const rootEstimated = rootKnownYr === null && rootYr !== null;
  if (rootYr === null) return;

  /* ── Años efectivos de la cadena (propagación hacia atrás) ── */
  const chainEffYrs = new Array(chain.length).fill(null);
  chainEffYrs[chain.length - 1] = rootYr;
  for (let i = chain.length - 2; i >= 0; i--) {
    const kyr = parseYear(chain[i].birth_date);
    chainEffYrs[i] = kyr !== null
      ? kyr
      : (chainEffYrs[i + 1] !== null ? chainEffYrs[i + 1] - GEN_GAP : null);
  }
  const ancestorEntries = ancestors.map((p, i) => ({
    p, yr: chainEffYrs[i], estimated: parseYear(p.birth_date) === null,
  }));

  /* ── Otro padre del nodo raíz ── */
  const chainIds = new Set(chain.map(p => String(p.id)));
  let otherParentEntry = null;
  if (root.father_id && root.mother_id) {
    const otherId = chainIds.has(String(root.father_id))
      ? String(root.mother_id) : String(root.father_id);
    const otherP = getPersona(otherId);
    if (otherP) {
      const yr    = parseYear(otherP.birth_date);
      const estYr = yr ?? (rootYr ? rootYr - GEN_GAP : null);
      if (estYr !== null) otherParentEntry = { p: otherP, yr: estYr, estimated: yr === null };
    }
  }

  /* ── Rango de años ── */
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

  /* ── Nodos ── */
  const rootFirst = String(root.name).trim().split(/\s+/)[0];
  const mkRel = (role, dist, gender) => relationLabel(role, dist, gender, rootFirst);

  const nodeObjects = [];
  ancestorEntries.forEach(({ p, yr, estimated }, i) => {
    if (yr === null) return;
    const dist = ancestors.length - i;  // último ancestro = padre/madre (dist 1)
    nodeObjects.push({ p, role: 'anc', dist, rel: mkRel('anc', dist, p.gender),
      y: toY(yr), estimatedBirth: estimated ? yr : null });
  });
  if (otherParentEntry) {
    const p = otherParentEntry.p;
    nodeObjects.push({ p, role: 'anc', dist: 1, rel: mkRel('anc', 1, p.gender),
      y: toY(otherParentEntry.yr),
      estimatedBirth: otherParentEntry.estimated ? otherParentEntry.yr : null });
  }
  nodeObjects.push({ p: root, role: 'sel', dist: 0, rel: 'Persona en foco',
    y: toY(rootYr), estimatedBirth: rootEstimated ? rootYr : null });
  for (const { p, depth } of desc) {
    const yr = parseYear(p.birth_date);
    if (yr) nodeObjects.push({ p, role: 'desc', dist: depth, rel: mkRel('desc', depth, p.gender),
      y: toY(yr), estimatedBirth: null });
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

  /* ── Eventos mundiales ── */
  const eventObjects = WORLD_EVENTS
    .filter(e => e.year > minY && e.year < maxY)
    .map(e => ({ ...e, y: toY(e.year) }));
  for (let i = 1; i < eventObjects.length; i++) {
    if (eventObjects[i].y - eventObjects[i - 1].y < EVENT_MIN_GAP)
      eventObjects[i].y = eventObjects[i - 1].y + EVENT_MIN_GAP;
  }

  /* ── Ticks ── */
  const ticks = [];
  for (let y = Math.ceil(minY / 25) * 25; y <= maxY; y += 25) ticks.push(y);

  /* ── HTML ── */
  const ticksHTML = ticks.map(y =>
    `<div class="tl-tick" style="top:${toY(y)}px"><span>${y}</span></div>`
  ).join('');

  const eventsHTML = eventObjects.map((e, i) =>
    `<div class="tl-event" style="top:${e.y}px" data-ev="${i}">
      <div class="tl-event-inner">
        <span class="tl-event-text">${esc(e.text)}</span>
        <span class="tl-event-year">${e.year}</span>
      </div>
      <div class="tl-event-pip"></div>
    </div>`
  ).join('');

  const nodesHTML = nodeObjects.map(({ p, role, y, estimatedBirth }) => {
    const color = getBranchColor(p.branch);
    return `<div class="tl-node tl-node--${role}" data-id="${esc(p.id)}" style="top:${y}px">
      <div class="tl-node-pip" style="--c:${color}"></div>
      <div class="tl-node-text">
        <span class="tl-node-name">${esc(p.name)}</span>
        <span class="tl-node-life">${esc(lifeSpan(p, estimatedBirth))}</span>
      </div>
    </div>`;
  }).join('');

  /* ── Barras de vida + espina (SVG) ── */
  const lifeBarsHTML = nodeObjects.map(n => {
    const deathYr = parseYear(n.p.death_date);
    const endYr   = n.p.vivo === 'si' ? new Date().getFullYear() : deathYr;
    if (!endYr) return '';
    const bottomY = toY(endYr);
    if (bottomY <= n.y) return '';
    return `<line x1="${AXIS_X}" y1="${n.y}" x2="${AXIS_X}" y2="${bottomY}"
      stroke="${getBranchColor(n.p.branch)}" stroke-width="3"
      stroke-opacity="0.28" stroke-linecap="round"/>`;
  }).join('');

  /* ── Líneas de fase geográfica + dots ── */
  const phaseLinesHTML = PHASE_SVG_XS.map(x =>
    `<line x1="${x}" y1="0" x2="${x}" y2="${H}"
       stroke="var(--border)" stroke-width="0.75" stroke-dasharray="3 6" stroke-opacity="0.45"/>`
  ).join('');

  const spineLineHTML = (rootNode && topNode && chain.length > 1)
    ? `<line x1="${AXIS_X}" y1="${topNode.y}" x2="${AXIS_X}" y2="${rootNode.y}"
             stroke="${rootColor}" stroke-width="2.5" stroke-opacity="0.45" stroke-linecap="round"/>`
    : '';

  const svgOverlay = `<svg class="tl-spine" width="100%" height="${H}" aria-hidden="true">
    ${phaseLinesHTML}
    ${lifeBarsHTML}
    ${spineLineHTML}
  </svg>`;

  /* ── Modal ── */
  const modal = document.createElement('div');
  modal.className = 'tl-modal';
  modal.innerHTML = `
    <div class="tl-dialog" role="dialog" aria-modal="true"
         aria-label="Línea de tiempo — ${esc(root.name)}">
      <header class="tl-head">
        <div>
          <p class="tl-head-eyebrow">Línea de tiempo</p>
          <h2 class="tl-head-name">${esc(root.name)}</h2>
        </div>
        <button class="tl-close" aria-label="Cerrar línea de tiempo">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
               stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6"  y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </header>
      <div class="tl-body">
        <div class="tl-scroll">
          <div class="tl-sticky-reader" id="tl-sr" aria-live="polite" aria-label="Persona en foco"></div>
          <div class="tl-canvas" style="height:${H}px">
            <div class="tl-axis-line"></div>
            ${svgOverlay}
            <div class="tl-ticks">${ticksHTML}</div>
            <div class="tl-events-col">${eventsHTML}</div>
            <div class="tl-nodes-col">${nodesHTML}</div>
          </div>
        </div>
        <aside class="tl-detail" id="tl-detail" aria-live="polite"></aside>
      </div>
    </div>`;

  document.body.appendChild(modal);

  /* ── Panel de detalle fijo (master-detail) ──
     Reemplaza al popup flotante: muestra el contexto del evento o la persona sobre
     la que estás (hover) o que clickeás. Siempre en el mismo lugar; arranca en la raíz. */
  const detailEl = modal.querySelector('#tl-detail');
  const evCol = modal.querySelector('.tl-events-col');
  const ndCol = modal.querySelector('.tl-nodes-col');

  const renderPersonDetail = (nodeData) => {
    if (!nodeData) return;
    delete detailEl.dataset.evKey;
    detailEl.innerHTML = buildPersonHTML(nodeData, rootFirst);
  };

  const renderEventDetail = (evEl) => {
    const ev = eventObjects[+evEl.dataset.ev];
    if (!ev) return;
    const key = evEl.dataset.ev;
    detailEl.dataset.evKey = key;
    detailEl.innerHTML = buildEventHTML(ev);
    if (!ev.wiki) return;
    fetchWiki(ev.wiki).then(w => {
      if (!w || detailEl.dataset.evKey !== key) return;   // el panel ya muestra otra cosa
      if (w.thumb) {
        const media = detailEl.querySelector('.tl-popup-media');
        if (media) {
          const img = new Image();
          img.alt = '';
          img.loading = 'lazy';
          img.onload  = () => { media.hidden = false; };
          img.onerror = () => { media.hidden = true; };
          media.replaceChildren(img);
          img.src = w.thumb;
        }
      }
      if (w.extract) {
        const block = detailEl.querySelector('.tl-popup-wiki');
        const text  = detailEl.querySelector('.tl-popup-wiki-text');
        if (block && text) { text.textContent = w.extract; block.hidden = false; }
      }
      const link = detailEl.querySelector('.tl-popup-link');
      if (link && w.url) link.href = w.url;
    });
  };

  /* Estado inicial: la persona en foco */
  renderPersonDetail(rootNode || nodeObjects[0]);

  /* Hover y clic actualizan el panel persistente */
  const onEvtPoint  = e => { const el = e.target.closest('.tl-event[data-ev]'); if (el) renderEventDetail(el); };
  const onNodePoint = e => {
    const el = e.target.closest('.tl-node[data-id]');
    if (el) renderPersonDetail(nodeObjects.find(n => String(n.p.id) === String(el.dataset.id)));
  };
  evCol.addEventListener('mouseover', onEvtPoint);
  evCol.addEventListener('click', onEvtPoint);
  ndCol.addEventListener('mouseover', onNodePoint);
  ndCol.addEventListener('click', onNodePoint);

  /* "Abrir ficha" dentro del panel */
  detailEl.addEventListener('click', e => {
    const ficha = e.target.closest('[data-tl-ficha]');
    if (ficha) { closeModal(); setSelected(ficha.getAttribute('data-tl-ficha')); }
  });

  /* ── Cerrar ── */
  function closeModal() { modal.remove(); removeEventListener('keydown', onEsc); }
  function onEsc(e) { if (e.key === 'Escape') closeModal(); }
  modal.querySelector('.tl-close').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  addEventListener('keydown', onEsc);

  /* ── Sticky reader + efecto slot-machine ── */
  const srEl      = modal.querySelector('#tl-sr');
  const scroll    = modal.querySelector('.tl-scroll');
  const nodesColEl = modal.querySelector('.tl-nodes-col');

  const setActiveNode = n => {
    nodesColEl.querySelectorAll('.tl-node--active').forEach(el => el.classList.remove('tl-node--active'));
    const el = nodesColEl.querySelector(`.tl-node[data-id="${n.p.id}"]`);
    if (el) el.classList.add('tl-node--active');
  };

  const initial = rootNode || nodeObjects[0];
  renderStickyReader(srEl, initial, toY);
  if (initial) setActiveNode(initial);

  /* La barra es transparente sobre la columna de nombres: el nombre NUNCA se oculta,
     viaja visible a través de la barra y se pone en negrita cuando queda a la misma
     altura que la fila de banderas. Detección por geometría real (getBoundingClientRect). */
  const rectCenter = el => { const r = el.getBoundingClientRect(); return r.top + r.height / 2; };

  const nodeEls = new Map();   // n -> elemento .tl-node
  for (const n of nodeObjects) {
    const el = nodesColEl.querySelector(`.tl-node[data-id="${n.p.id}"]`);
    if (el) nodeEls.set(n, el);
  }

  /* Calibrar el desfase real pip→nombre con un nodo sin animar (auto-deriva el "número mágico"). */
  let NAME_PIP_OFFSET = 10;
  {
    const sample = nodesColEl.querySelector('.tl-node:not(.tl-node--active)') || nodesColEl.querySelector('.tl-node');
    const sPip  = sample?.querySelector('.tl-node-pip');
    const sName = sample?.querySelector('.tl-node-name');
    if (sPip && sName) NAME_PIP_OFFSET = rectCenter(sPip) - rectCenter(sName);
  }

  /* Objetivo = altura del pip cuyo NOMBRE queda alineado con el centro de las banderas. */
  const readingTarget = () => {
    const r = srEl.getBoundingClientRect();
    return r.top + r.height / 2 + NAME_PIP_OFFSET;
  };

  let srLastId = initial ? initial.p.id : null;
  let rafPending = false;
  const updateActive = () => {
    rafPending = false;
    const target = readingTarget();
    let best = null, bestDist = Infinity;
    for (const [n, el] of nodeEls) {
      const pip = el.querySelector('.tl-node-pip') || el;
      const d = Math.abs(rectCenter(pip) - target);
      if (d < bestDist) { bestDist = d; best = n; }
    }
    if (best && best.p.id !== srLastId) {
      srLastId = best.p.id;
      renderStickyReader(srEl, best, toY);
      setActiveNode(best);
    }
  };
  scroll.addEventListener('scroll', () => {
    if (!rafPending) { rafPending = true; requestAnimationFrame(updateActive); }
  }, { passive: true });

  /* Scroll inicial: alinear el nombre del root con la fila de banderas (midiendo el DOM real). */
  requestAnimationFrame(() => {
    const rootEl = nodeEls.get(rootNode) || nodeEls.get(nodeObjects[0]);
    const rootPip = rootEl?.querySelector('.tl-node-pip') || rootEl;
    if (rootPip) scroll.scrollTop += rectCenter(rootPip) - readingTarget();
    requestAnimationFrame(updateActive);
  });
}
