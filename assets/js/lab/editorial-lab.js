// Laboratorio editorial — maqueta viva de la tipografía de los posts.
// Un fragmento de artículo real (clan-clemenzo) renderizado con una COPIA
// parametrizada de los estilos de `.article-content` (variables CSS sobre
// `.ed-spec`, definidas en lab.css). Los diales editan las variables en vivo;
// la receta lista SOLO los valores que difieren del estado actual del sitio,
// listos para pegar en el chat y aplicar a styles.css.
//
// Reimplementación deliberadamente standalone (mismo criterio que lab-grafo):
// no toca styles.css ni los posts reales.

// ── Estado actual del sitio (defaults de los diales) ──────────────────────────
// Espejo de los valores reales en assets/css/styles.css (.article-content).
// Si cambian allá, actualizarlos acá para que la maqueta arranque fiel.
const DEFAULTS = {
  measure:    { value: 1020, css: '.article-content { max-width }',            unit: 'px' },
  bodyFont:   { value: 'Source Serif 4', css: '.article-content p { font-family }' },
  bodySize:   { value: 19.5, css: '.article-content p { font-size }',          unit: 'px' },
  lineHeight: { value: 1.75, css: '.article-content p { line-height }' },
  pSpace:     { value: 26,   css: '.article-content p { margin-bottom }',      unit: 'px' },
  displayFont:{ value: 'Hanken Grotesk', css: '.article-content h2/h3 { font-family }' },
  h2Size:     { value: 42,   css: '.article-content h2 { font-size } (clamp: tope desktop)', unit: 'px' },
  h2Weight:   { value: 700,  css: '.article-content h2 { font-weight }' },
  h2Top:      { value: 60,   css: '.article-content h2 { margin-top }',        unit: 'px' },
  h3Size:     { value: 28,   css: '.article-content h3 { font-size } (clamp: tope desktop)', unit: 'px' },
  figMargin:  { value: 80,   css: '.article-content figure { margin } (vertical)', unit: 'px' },
  figRadius:  { value: 6,    css: '.article-content figure img { border-radius }', unit: 'px' },
  capSize:    { value: 13.5, css: '.article-content figure figcaption { font-size }', unit: 'px' },
};

// Fuentes elegibles. Las «del sitio» están self-hosted (fonts.css); las «del
// sistema» no requieren hosting — si una gusta, va al CSS como font-stack.
const FONT_STACKS = {
  'Source Serif 4':  "'Source Serif 4', Georgia, serif",
  'IBM Plex Sans':   "'IBM Plex Sans', 'Helvetica Neue', sans-serif",
  'IBM Plex Mono':   "'IBM Plex Mono', monospace",
  'Inter':           "'Inter', 'Helvetica Neue', sans-serif",
  'Hanken Grotesk':  "'Hanken Grotesk', 'Helvetica Neue', sans-serif",
  'JetBrains Mono':  "'JetBrains Mono', monospace",
  'Georgia':         "Georgia, 'Times New Roman', serif",
  'Palatino':        "'Palatino Linotype', Palatino, 'Book Antiqua', serif",
  'Charter':         "Charter, 'Bitstream Charter', Georgia, serif",
  'Baskerville':     "Baskerville, 'Libre Baskerville', Georgia, serif",
  'Iowan Old Style': "'Iowan Old Style', 'Palatino Linotype', Georgia, serif",
  'Times New Roman': "'Times New Roman', Times, serif",
  'Helvetica Neue':  "'Helvetica Neue', Helvetica, Arial, sans-serif",
  'Verdana':         "Verdana, Geneva, sans-serif",
  'Trebuchet MS':    "'Trebuchet MS', 'Helvetica Neue', sans-serif",
  'system-ui':       "system-ui, -apple-system, 'Segoe UI', sans-serif",
};
const SITE_FONTS = ['Source Serif 4', 'IBM Plex Sans', 'IBM Plex Mono', 'Inter', 'Hanken Grotesk', 'JetBrains Mono'];
const FONTS_BODY = [
  { group: 'Del sitio (self-hosted)', items: ['Source Serif 4', 'IBM Plex Sans', 'Inter', 'Hanken Grotesk', 'IBM Plex Mono'] },
  { group: 'Serif del sistema', items: ['Georgia', 'Palatino', 'Charter', 'Baskerville', 'Iowan Old Style', 'Times New Roman'] },
  { group: 'Sans del sistema', items: ['Helvetica Neue', 'Verdana', 'Trebuchet MS', 'system-ui'] },
];
const FONTS_DISPLAY = [
  { group: 'Del sitio (self-hosted)', items: ['Hanken Grotesk', 'Source Serif 4', 'IBM Plex Sans', 'IBM Plex Mono'] },
  { group: 'Serif del sistema', items: ['Georgia', 'Palatino', 'Charter', 'Baskerville', 'Times New Roman'] },
  { group: 'Sans del sistema', items: ['Helvetica Neue', 'Verdana', 'Trebuchet MS', 'system-ui'] },
];

const CONTROLS = [
  { key: 'measure',    label: 'Ancho de la caja', min: 480, max: 1080, step: 10, group: 'caja' },
  { key: 'showBox',    label: 'Mostrar bordes de la caja', type: 'check', group: 'caja' },
  { key: 'bodyFont',   label: 'Familia del cuerpo', type: 'select', options: FONTS_BODY, group: 'cuerpo' },
  { key: 'bodySize',   label: 'Tamaño del cuerpo', min: 15, max: 22, step: 0.5, group: 'cuerpo' },
  { key: 'lineHeight', label: 'Interlineado', min: 1.4, max: 2.1, step: 0.05, group: 'cuerpo' },
  { key: 'pSpace',     label: 'Espacio entre párrafos', min: 10, max: 44, step: 2, group: 'cuerpo' },
  { key: 'displayFont',label: 'Familia de títulos', type: 'select', options: FONTS_DISPLAY, group: 'títulos' },
  { key: 'h2Size',     label: 'Tamaño h2', min: 24, max: 52, step: 1, group: 'títulos' },
  { key: 'h2Weight',   label: 'Peso h2', min: 500, max: 800, step: 100, group: 'títulos' },
  { key: 'h2Top',      label: 'Aire sobre h2', min: 24, max: 96, step: 4, group: 'títulos' },
  { key: 'h3Size',     label: 'Tamaño h3', min: 18, max: 36, step: 1, group: 'títulos' },
  { key: 'figMargin',  label: 'Margen de figuras', min: 16, max: 80, step: 4, group: 'figuras' },
  { key: 'figRadius',  label: 'Radio de imágenes', min: 0, max: 14, step: 1, group: 'figuras' },
  { key: 'capSize',    label: 'Tamaño del pie de foto', min: 10, max: 16, step: 0.5, group: 'figuras' },
];

const state = { showBox: true };
Object.entries(DEFAULTS).forEach(([k, d]) => { state[k] = d.value; });

// ── Espécimen: fragmento real de «Clan Clemenzo» ──────────────────────────────
const SPECIMEN = `
  <h2>Los censos del Valais</h2>
  <p>Siete censos valaisanos digitalizados cubren el período <strong>1802–1870</strong>. Cada uno es una fotografía de la familia en un momento distinto: dónde vivían, qué profesión tenían, cuántos eran. Juntos trazan el movimiento de los Clemenzo entre <a href="#">Ardon</a> y <a href="#">Riddes</a>, y permiten identificar a las personas concretas que aparecen en los documentos con los individuos del árbol.</p>
  <p>Investigar la propia familia es encontrar <em>personas</em> detrás de los nombres escritos en un padrón. Las fuentes principales son los censos digitalizados del Valais, el <em>Armorial Valaisan</em> en dos ediciones, y las memorias del oficial napoleónico <mark>Hyacinthe Clemenzo</mark>.</p>
  <h3>1802 — Ardon</h3>
  <p>Primera aparición de los Clemenzo en los registros censales. Se identifican dos hogares consecutivos relacionados:</p>
  <blockquote><p>"Baptiste Clemenzo et sa fame Marie [al/ab?] et leur enfans jean Baptiste, et jean joseph"</p></blockquote>
  <ul>
    <li><strong>Baptiste Clemenzo</strong> — père, patriarca del clan, n.c. 1745–1755</li>
    <li><strong>Jean Baptiste</strong> — fils, el hermano que permanecerá en Ardon</li>
    <li><strong>Jean Joseph</strong> — fils, quien migrará a Riddes y será abuelo de la rama argentina</li>
  </ul>
  <figure class="article-image"><img src="./assets/images/posts/censo_1802_ardon.png" alt="" loading="lazy"><figcaption>Censo de 1802 en Ardon — el registro nominativo más antiguo disponible de la familia</figcaption></figure>
  <h3>Correspondencia con el árbol</h3>
  <div class="table-wrapper"><table>
    <thead><tr><th>Línea</th><th>ID</th><th>Nombre en árbol</th></tr></thead>
    <tbody>
      <tr><td>21</td><td>p57</td><td>Jean Joseph Clemenzo</td></tr>
      <tr><td>22</td><td>p58</td><td>Catherine Fortuneé Cerisier</td></tr>
      <tr><td>24</td><td>p36</td><td>François Clemenzoz</td></tr>
    </tbody>
  </table></div>
  <p>El <strong>"4" al margen</strong> indica recuento total: Baptiste + Marie + Jean Baptiste + Jean Joseph = 4 personas. El apellido de la esposa Marie no es legible con certeza.</p>
  <div class="image-gallery">
    <figure class="article-image"><img src="./assets/images/posts/censo_1829_riddes_2clase_1.png" alt="" loading="lazy"></figure>
    <figure class="article-image"><img src="./assets/images/posts/censo_1829_riddes_2clase_2.png" alt="" loading="lazy"></figure>
  </div>
  <div class="mermaid">flowchart TD
    BAP["Baptiste Clemenzo\\n✶c. 1745–1755 · Ardon"]
    JJC["Jean Joseph · p57\\n✶c. 1780"]
    JBC["Jean Baptiste\\n✶c. 1774"]
    BAP --> JJC
    BAP --> JBC</div>
  <p>La identificación de Baptiste como padre de Jean Joseph es una hipótesis sólida pero <strong>no confirmada documentalmente</strong> — falta el acta de bautismo que nombre al padre.</p>
`;

// ── Aplicar estado → variables CSS del espécimen ──────────────────────────────
const spec = document.getElementById('edSpec');
const wrapEl = document.getElementById('edSpecWrap');

function apply() {
  const s = spec.style;
  s.setProperty('--ed-measure', state.measure + 'px');
  s.setProperty('--ed-body-font', FONT_STACKS[state.bodyFont] || state.bodyFont);
  s.setProperty('--ed-body-size', state.bodySize + 'px');
  s.setProperty('--ed-lh', state.lineHeight);
  s.setProperty('--ed-pspace', state.pSpace + 'px');
  s.setProperty('--ed-display-font', FONT_STACKS[state.displayFont] || state.displayFont);
  s.setProperty('--ed-h2-size', state.h2Size + 'px');
  s.setProperty('--ed-h2-weight', state.h2Weight);
  s.setProperty('--ed-h2-top', state.h2Top + 'px');
  s.setProperty('--ed-h3-size', state.h3Size + 'px');
  s.setProperty('--ed-fig-my', state.figMargin + 'px');
  s.setProperty('--ed-fig-radius', state.figRadius + 'px');
  s.setProperty('--ed-cap-size', state.capSize + 'px');
  spec.classList.toggle('ed-spec--box', !!state.showBox);
  updateRecipe();
  checkFit();
}

// Si el ancho pedido no entra en el área visible, sugerir el modo amplio
function checkFit() {
  const hint = document.getElementById('edHint');
  if (!hint) return;
  const clipped = spec.clientWidth < state.measure - 4;
  hint.hidden = !clipped || document.querySelector('.ed-sandbox').classList.contains('ed-sandbox--full');
}

// ── Receta: solo los deltas vs. DEFAULTS ──────────────────────────────────────
function updateRecipe() {
  const changes = Object.entries(DEFAULTS)
    .filter(([k, d]) => state[k] !== d.value)
    .map(([k, d]) => {
      const u = d.unit || '';
      return `  ${d.css}:  ${d.value}${u}  →  ${state[k]}${u}`;
    });

  // Nota si alguna fuente elegida es del sistema (va como font-stack, sin self-hosting)
  const sysFonts = [state.bodyFont, state.displayFont].filter(f => !SITE_FONTS.includes(f));
  const sysNote = sysFonts.length
    ? `\n\nNota: ${[...new Set(sysFonts)].join(' y ')} ${sysFonts.length > 1 ? 'son fuentes' : 'es fuente'} del sistema —
se aplica como font-stack CSS (${[...new Set(sysFonts)].map(f => FONT_STACKS[f]).join(' · ')}), sin self-hosting.`
    : '';

  const el = document.getElementById('edRecipe');
  el.textContent = changes.length
    ? `Tipografía editorial del blog — cambios pedidos (vs. estado actual del sitio):

${changes.join('\n')}

Aplicar en assets/css/styles.css (sección .article-content) y reflejar en
design-system.html. Los tamaños de h2/h3 usan clamp(): el valor indicado es
el tope desktop — mantener la proporción del clamp actual.${sysNote}`
    : 'Sin cambios: la maqueta está mostrando el estado actual del sitio.\nMové los diales y acá va a aparecer solo lo que difiera, listo para copiar y pegar en el chat.';
}

// ── Panel de controles (patrón de lab-grafo) ──────────────────────────────────
function buildControls() {
  const groups = { caja: 'Caja de texto', cuerpo: 'Cuerpo', 'títulos': 'Títulos', figuras: 'Figuras' };
  const wrap = document.getElementById('edControls');

  Object.entries(groups).forEach(([g, title]) => {
    const sec = document.createElement('div'); sec.className = 'lab-group';
    sec.innerHTML = `<h3 class="lab-group-title">${title}</h3>`;
    CONTROLS.filter(c => c.group === g).forEach(c => {
      const row = document.createElement('label'); row.className = 'lab-control';
      if (c.type === 'select') {
        const opt = o => `<option value="${o}"${state[c.key] === o ? ' selected' : ''}>${o}</option>`;
        const opts = c.options.map(g => g.group
          ? `<optgroup label="${g.group}">${g.items.map(opt).join('')}</optgroup>`
          : opt(g)).join('');
        row.innerHTML = `<span class="lab-control-head"><span>${c.label}</span></span>
          <select id="ctl_${c.key}" class="ed-select">${opts}</select>`;
      } else if (c.type === 'check') {
        row.className = 'lab-control ed-check';
        row.innerHTML = `<input type="checkbox" id="ctl_${c.key}"${state[c.key] ? ' checked' : ''}> <span>${c.label}</span>`;
      } else {
        row.innerHTML = `<span class="lab-control-head"><span>${c.label}</span><output id="out_${c.key}">${state[c.key]}</output></span>
          <input type="range" id="ctl_${c.key}" min="${c.min}" max="${c.max}" step="${c.step}" value="${state[c.key]}">`;
      }
      sec.appendChild(row);
    });
    wrap.appendChild(sec);
  });

  CONTROLS.forEach(c => {
    const input = document.getElementById('ctl_' + c.key);
    input.addEventListener(c.type === 'select' || c.type === 'check' ? 'change' : 'input', () => {
      if (c.type === 'check') state[c.key] = input.checked;
      else if (c.type === 'select') state[c.key] = input.value;
      else {
        state[c.key] = parseFloat(input.value);
        document.getElementById('out_' + c.key).textContent = input.value;
      }
      apply();
    });
  });

  document.getElementById('edReset').addEventListener('click', () => {
    Object.entries(DEFAULTS).forEach(([k, d]) => { state[k] = d.value; });
    state.showBox = true;
    CONTROLS.forEach(c => {
      const input = document.getElementById('ctl_' + c.key);
      if (c.type === 'check') input.checked = state[c.key];
      else if (c.type === 'select') input.value = state[c.key];
      else { input.value = state[c.key]; document.getElementById('out_' + c.key).textContent = state[c.key]; }
    });
    apply();
  });

  document.getElementById('edCopy').addEventListener('click', async () => {
    await navigator.clipboard.writeText(document.getElementById('edRecipe').textContent);
    const b = document.getElementById('edCopy'); const t = b.textContent;
    b.textContent = '¡Copiado!'; setTimeout(() => b.textContent = t, 1400);
  });
}

// ── Mermaid (vendoreado, perezoso) ────────────────────────────────────────────
function loadMermaid() {
  const s = document.createElement('script');
  s.src = './assets/js/vendor/mermaid.min.js';
  s.onload = () => {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    window.mermaid.initialize({ startOnLoad: false, theme: dark ? 'dark' : 'neutral' });
    window.mermaid.run({ nodes: spec.querySelectorAll('.mermaid') });
  };
  document.head.appendChild(s);
}

// ── Modo amplio: la maqueta a pantalla completa (los diales siguen a la vista) ─
const sandbox = document.querySelector('.ed-sandbox');
const expandBtn = document.getElementById('edExpand');
function setFull(on) {
  sandbox.classList.toggle('ed-sandbox--full', on);
  document.body.style.overflow = on ? 'hidden' : '';
  expandBtn.textContent = on ? 'Cerrar (Esc)' : 'Ampliar maqueta';
  checkFit();
}
expandBtn.addEventListener('click', () => setFull(!sandbox.classList.contains('ed-sandbox--full')));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setFull(false); });
document.getElementById('edHint').addEventListener('click', () => setFull(true));
window.addEventListener('resize', checkFit);

// ── Init ──────────────────────────────────────────────────────────────────────
spec.innerHTML = SPECIMEN;
buildControls();
apply();
loadMermaid();
