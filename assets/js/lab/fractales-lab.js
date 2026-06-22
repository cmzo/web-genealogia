// Laboratorio de fractales — L-systems sobre Canvas 2D.
// Sin dependencias externas. Motor: expand(axiom, rules, N) → string;
// intérprete turtle dibuja el resultado. Canvas se autoescala al contenedor.

'use strict';

// ── Definición de fractales ───────────────────────────────────────────────────
const FRACTALS = {
  koch: {
    name: 'Koch',
    axiom: 'F--F--F',
    rules: { F: 'F+F--F+F' },
    defaultAngle: 60,
    defaultN: 4,
    maxN: 7,
    startDir: 0,
    dim: {
      formula: 'log(4) / log(3)',
      value: Math.log(4) / Math.log(3),
      desc: 'Cuatro copias de sí mismo a escala 1/3. No es línea ni superficie: existe en una dimensión intermedia.',
    },
  },
  sierpinski: {
    name: 'Sierpiński',
    axiom: 'F-G-G',
    rules: { F: 'F-G+F+G-F', G: 'GG' },
    defaultAngle: 120,
    defaultN: 4,
    maxN: 7,
    startDir: 0,
    dim: {
      formula: 'log(3) / log(2)',
      value: Math.log(3) / Math.log(2),
      desc: 'Tres copias a escala 1/2. Más cerca de superficie que de línea.',
    },
  },
  arbol: {
    name: 'Árbol',
    axiom: 'X',
    rules: { X: 'F+[[X]-X]-F[-FX]+X', F: 'FF' },
    defaultAngle: 25,
    defaultN: 5,
    maxN: 8,
    startDir: -Math.PI / 2,  // dibuja hacia arriba
    dim: {
      formula: '≈ 2 (variable con ángulo)',
      value: 2,
      desc: 'El ángulo controla la apertura de las ramas. Con ángulos grandes las ramas se solapan y el árbol rellena el plano.',
    },
  },
  dragon: {
    name: 'Dragón',
    axiom: 'FX',
    rules: { X: 'X+YF+', Y: '-FX-Y' },
    defaultAngle: 90,
    defaultN: 12,
    maxN: 16,
    startDir: 0,
    dim: {
      formula: 'log(2) / log(√2) = 2',
      value: 2,
      desc: 'Emerge de doblar papel a la mitad repetidamente. Rellena el plano — dimensión entera pese a la forma fractal.',
    },
  },
};

// ── Estado ────────────────────────────────────────────────────────────────────
const state = { fractal: 'koch', N: 4, angle: 60, colorMode: 'mono' };

const canvas = document.getElementById('fracCanvas');
const ctx    = canvas.getContext('2d');

// ── Motor L-system ────────────────────────────────────────────────────────────
function expand(axiom, rules, n) {
  let s = axiom;
  for (let i = 0; i < n; i++) {
    let next = '';
    for (const ch of s) next += rules[ch] !== undefined ? rules[ch] : ch;
    s = next;
  }
  return s;
}

// ── Bounding box (pasada en seco, escala unitaria) ────────────────────────────
function bbox(str, angleDeg, startDir) {
  const rad = angleDeg * Math.PI / 180;
  let x = 0, y = 0, a = startDir;
  let minX = 0, maxX = 0, minY = 0, maxY = 0;
  const stack = [];
  for (const ch of str) {
    if (ch === 'F' || ch === 'G') {
      x += Math.cos(a); y += Math.sin(a);
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    } else if (ch === '+') { a += rad;
    } else if (ch === '-') { a -= rad;
    } else if (ch === '[') { stack.push({ x, y, a });
    } else if (ch === ']') { const s = stack.pop(); x = s.x; y = s.y; a = s.a; }
  }
  const w = maxX - minX || 1;
  const h = maxY - minY || 1;
  return { minX, minY, w, h };
}

// ── Helpers de color ──────────────────────────────────────────────────────────
function tok(name, fb) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fb;
}

function depthColor(d, maxD) {
  const t = maxD > 0 ? d / maxD : 0;
  // dark accent → light green
  const r = Math.round(45  + (140 - 45)  * t);
  const g = Math.round(74  + (195 - 74)  * t);
  const b = Math.round(62  + (120 - 62)  * t);
  return `rgb(${r},${g},${b})`;
}

// ── Dibujo ────────────────────────────────────────────────────────────────────
function drawFractal(str, angleDeg, startDir, tx, ty, scale, colorMode) {
  const rad = angleDeg * Math.PI / 180;
  let x = tx, y = ty, a = startDir, depth = 0;
  const stack = [];

  let maxDepth = 0;
  if (colorMode === 'gradient') {
    let d = 0;
    for (const ch of str) {
      if (ch === '[') { d++; if (d > maxDepth) maxDepth = d; }
      else if (ch === ']') d--;
    }
  }

  const accent = tok('--accent', '#2d4a3e');
  const lw = Math.max(0.4, Math.min(2, 1.2 / Math.sqrt(str.length / 12)));

  if (colorMode === 'mono') {
    ctx.beginPath();
    ctx.strokeStyle = accent;
    ctx.lineWidth = lw;
    ctx.moveTo(x, y);
    for (const ch of str) {
      if (ch === 'F' || ch === 'G') {
        x += Math.cos(a) * scale; y += Math.sin(a) * scale;
        ctx.lineTo(x, y);
      } else if (ch === 'f') {
        x += Math.cos(a) * scale; y += Math.sin(a) * scale;
        ctx.moveTo(x, y);
      } else if (ch === '+') { a += rad;
      } else if (ch === '-') { a -= rad;
      } else if (ch === '[') { stack.push({ x, y, a }); ctx.moveTo(x, y);
      } else if (ch === ']') {
        const s = stack.pop(); x = s.x; y = s.y; a = s.a; ctx.moveTo(x, y);
      }
    }
    ctx.stroke();
  } else {
    // Gradiente: segmento a segmento
    ctx.lineWidth = lw;
    for (const ch of str) {
      if (ch === 'F' || ch === 'G') {
        const nx = x + Math.cos(a) * scale;
        const ny = y + Math.sin(a) * scale;
        ctx.beginPath();
        ctx.strokeStyle = depthColor(depth, maxDepth);
        ctx.moveTo(x, y);
        x = nx; y = ny;
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (ch === 'f') {
        x += Math.cos(a) * scale; y += Math.sin(a) * scale;
      } else if (ch === '+') { a += rad;
      } else if (ch === '-') { a -= rad;
      } else if (ch === '[') { depth++; stack.push({ x, y, a });
      } else if (ch === ']') {
        const s = stack.pop(); x = s.x; y = s.y; a = s.a; depth--;
      }
    }
  }
}

// ── Render principal ──────────────────────────────────────────────────────────
function render() {
  const frac = FRACTALS[state.fractal];
  const str  = expand(frac.axiom, frac.rules, state.N);

  // Ajustar el canvas al tamaño físico del contenedor (HiDPI)
  const rect = canvas.getBoundingClientRect();
  const dpr  = devicePixelRatio || 1;
  canvas.width  = rect.width  * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const W = rect.width, H = rect.height, PAD = 36;
  ctx.clearRect(0, 0, W, H);

  if (str.length === 0) return;

  const bb    = bbox(str, state.angle, frac.startDir);
  const scale = Math.min((W - PAD * 2) / bb.w, (H - PAD * 2) / bb.h);
  const tx    = W / 2 - (bb.minX + bb.w / 2) * scale;
  const ty    = H / 2 - (bb.minY + bb.h / 2) * scale;

  drawFractal(str, state.angle, frac.startDir, tx, ty, scale, state.colorMode);
  updateInfo(frac);
  updateRecipe(frac, str);
}

// ── Panel de información ──────────────────────────────────────────────────────
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function updateInfo(frac) {
  // Gramática
  document.getElementById('fracAxiom').textContent = frac.axiom;
  const rulesEl = document.getElementById('fracRules');
  rulesEl.innerHTML = Object.entries(frac.rules).map(([k, v]) =>
    `<div class="frac-grammar-row">
       <span class="frac-grammar-key">${esc(k)}</span>
       <span class="frac-grammar-arrow">→</span>
       <code class="frac-grammar-code">${esc(v)}</code>
     </div>`
  ).join('');

  // Iteración: expandir paso a paso hasta state.N, mostrar máx 8 filas
  const iterEl = document.getElementById('fracIter');
  const MAX_SHOW = 8, TRUNCATE = 72;
  const rows = [];
  let s = frac.axiom;
  const limit = Math.min(state.N, MAX_SHOW);

  for (let i = 0; i <= limit; i++) {
    const isCurrent = i === state.N;
    if (s.length > TRUNCATE) {
      rows.push(`<div class="frac-iter-row">
        <span class="frac-iter-n">N=${i}</span>
        <span class="frac-iter-str frac-iter-str--long ${isCurrent ? 'frac-iter-str--current' : ''}">(${s.length} símbolos)</span>
      </div>`);
    } else {
      rows.push(`<div class="frac-iter-row">
        <span class="frac-iter-n">N=${i}</span>
        <span class="frac-iter-str ${isCurrent ? 'frac-iter-str--current' : ''}">${esc(s)}</span>
      </div>`);
    }
    if (i < limit) {
      let next = '';
      for (const ch of s) next += frac.rules[ch] !== undefined ? frac.rules[ch] : ch;
      s = next;
      if (s.length > 500_000) {
        rows.push(`<div class="frac-iter-row">
          <span class="frac-iter-n">N=${i + 1}</span>
          <span class="frac-iter-str frac-iter-str--long">(string demasiado largo)</span>
        </div>`);
        break;
      }
    }
  }

  if (state.N > MAX_SHOW) {
    rows.push(`<div class="frac-iter-row">
      <span class="frac-iter-n">…</span>
      <span class="frac-iter-str frac-iter-str--long">N=${state.N} omitido por longitud</span>
    </div>`);
  }

  iterEl.innerHTML = rows.join('');

  // Dimensión
  document.getElementById('fracDim').innerHTML = `
    <div class="frac-dim-formula">${esc(frac.dim.formula)}</div>
    <div class="frac-dim-value">${frac.dim.value.toFixed(3)}</div>
    <div class="frac-dim-desc">${frac.dim.desc}</div>
  `;
}

// ── Receta ────────────────────────────────────────────────────────────────────
function updateRecipe(frac, str) {
  const rulesStr = Object.entries(frac.rules).map(([k, v]) => `  ${k} → ${v}`).join('\n');
  document.getElementById('fracRecipe').textContent =
`Fractal: ${frac.name}
Generado por un L-system (sistema de Lindenmayer) + intérprete turtle en Canvas 2D.

Gramática:
  Axioma: ${frac.axiom}
  Reglas:
${rulesStr}

Parámetros:
  N (iteraciones): ${state.N}
  Ángulo de giro: ${state.angle}°
  Color: ${state.colorMode}

Instrucciones del intérprete turtle:
  F / G → avanzar un paso y trazar línea
  f     → avanzar sin trazar (levantar el lápiz)
  +     → girar a la izquierda ${state.angle}°
  -     → girar a la derecha ${state.angle}°
  [     → guardar posición y ángulo en la pila
  ]     → restaurar posición y ángulo desde la pila

String en N=${state.N}: ${str.length > 120 ? str.slice(0, 117) + '…' : str}
Longitud total: ${str.length} símbolos

Dimensión fractal: ${frac.dim.formula} = ${frac.dim.value.toFixed(4)}
${frac.dim.desc}`;
}

// ── Controles ─────────────────────────────────────────────────────────────────
function buildControls() {
  // Selector de fractales
  const selectorEl = document.getElementById('fracSelector');
  Object.entries(FRACTALS).forEach(([key, frac]) => {
    const btn = document.createElement('button');
    btn.className = 'frac-selector-btn' + (key === state.fractal ? ' is-active' : '');
    btn.textContent = frac.name;
    btn.dataset.key = key;
    btn.addEventListener('click', () => {
      state.fractal = key;
      state.N     = frac.defaultN;
      state.angle = frac.defaultAngle;
      // sync sliders
      const nCtl = document.getElementById('ctlN');
      nCtl.max   = frac.maxN;
      nCtl.value = frac.defaultN;
      document.getElementById('outN').textContent = frac.defaultN;
      const aCtl = document.getElementById('ctlAngle');
      aCtl.value = frac.defaultAngle;
      document.getElementById('outAngle').textContent = frac.defaultAngle + '°';
      // mark active
      selectorEl.querySelectorAll('.frac-selector-btn').forEach(b =>
        b.classList.toggle('is-active', b.dataset.key === key)
      );
      render();
    });
    selectorEl.appendChild(btn);
  });

  // Slider N
  const ctlN = document.getElementById('ctlN');
  ctlN.max   = FRACTALS[state.fractal].maxN;
  ctlN.addEventListener('input', () => {
    state.N = parseInt(ctlN.value);
    document.getElementById('outN').textContent = ctlN.value;
    render();
  });

  // Slider ángulo
  const ctlAngle = document.getElementById('ctlAngle');
  ctlAngle.addEventListener('input', () => {
    state.angle = parseInt(ctlAngle.value);
    document.getElementById('outAngle').textContent = ctlAngle.value + '°';
    render();
  });

  // Píldoras de color
  document.getElementById('fracColorPills').addEventListener('click', e => {
    const pill = e.target.closest('.frac-color-pill');
    if (!pill) return;
    state.colorMode = pill.dataset.mode;
    document.querySelectorAll('.frac-color-pill').forEach(p =>
      p.classList.toggle('is-active', p.dataset.mode === state.colorMode)
    );
    render();
  });

  // Copiar receta
  document.getElementById('fracCopy').addEventListener('click', async () => {
    await navigator.clipboard.writeText(document.getElementById('fracRecipe').textContent);
    const btn = document.getElementById('fracCopy');
    const prev = btn.textContent;
    btn.textContent = '¡Copiado!';
    setTimeout(() => btn.textContent = prev, 1400);
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────
buildControls();
render();

// Re-render al redimensionar (debounced)
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(render, 120);
});

// Re-render al cambiar tema (colores cambian)
window.addEventListener('themechange', render);
document.addEventListener('themechange', render);
// Fallback: observar el atributo data-theme
const themeObserver = new MutationObserver(render);
themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
