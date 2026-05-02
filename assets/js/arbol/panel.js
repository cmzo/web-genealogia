/**
 * panel.js — panel lateral con pestañas: Persona | Investigación | Archivos.
 *
 * Escucha 'selectionChange' del store. Los links de navegación llaman a
 * setFocus + setSelected. El estado de pestaña activa persiste entre cambios
 * de persona (salvo que la nueva persona no tenga contenido en la pestaña).
 */

import {
  getPersona,
  getMatrimoniosByPersona,
  getHijosByMatrimonio,
  getHijosSinMatrimonio,
} from './data.js';
import { setFocus, setSelected, on } from './store.js';
import { recenterOn } from './render.js';
import { getBranchColor } from './config.js';

let _panel    = null;
let _hero     = null;
let _tabs     = null;
let _body     = null;
let _activeTab = 'persona';
let _currentId = null;

export function initPanel() {
  _panel = document.getElementById('treePanel');
  _hero  = document.getElementById('treePanelHero');
  _tabs  = document.getElementById('panelTabs');
  _body  = document.getElementById('treePanelBody');
  const closeBtn = document.getElementById('treePanelClose');

  if (!_panel || !_body) return;

  closeBtn?.addEventListener('click', () => setSelected(null));

  _tabs?.querySelectorAll('.panel-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      _activeTab = btn.dataset.tab;
      _tabs.querySelectorAll('.panel-tab').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      if (_currentId) _renderBody(_currentId);
    });
  });

  on('selectionChange', id => {
    if (!id) {
      _panel.classList.remove('is-open');
      if (_hero) _hero.innerHTML = '';
      _currentId = null;
      setTimeout(() => recenterOn(), 320);
      return;
    }
    const wasOpen = _panel.classList.contains('is-open');
    _currentId = id;
    _renderHero(id);
    _renderBody(id);
    _panel.classList.add('is-open');
    if (wasOpen) {
      requestAnimationFrame(() => recenterOn());
    } else {
      setTimeout(() => recenterOn(), 320);
    }
  });
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function _renderHero(personaId) {
  const p = getPersona(personaId);
  if (!p || !_hero) return;

  const color  = getBranchColor(p.branch);
  const birthY = _year(p.birth_date);
  const deathY = _year(p.death_date);
  let yearsStr = '';
  if (birthY || deathY) {
    const end = deathY || (p.vivo === 'si' ? '' : '?');
    yearsStr  = end ? `${birthY || '?'} – ${end}` : birthY;
  }

  const statusBadge = _statusBadge(p.status);

  _hero.style.background = `linear-gradient(160deg, ${color}dd 0%, ${color}aa 100%)`;
  _hero.innerHTML = `
    <div class="panel-hero-content">
      <div class="panel-hero-top">
        <p class="panel-name">${p.name}</p>
        ${statusBadge}
      </div>
      ${yearsStr ? `<p class="panel-years">${yearsStr}</p>` : ''}
    </div>`;
}

// ── Body dispatcher ───────────────────────────────────────────────────────────

function _renderBody(personaId) {
  if (!_body) return;
  if (_activeTab === 'persona') {
    _tabPersona(personaId);
    _bindNavLinks();
  } else if (_activeTab === 'investigacion') {
    _tabInvestigacion(personaId); // async — manages its own content
  } else if (_activeTab === 'archivos') {
    _tabArchivos(personaId);
  }
}

// ── Tab: Persona ──────────────────────────────────────────────────────────────

function _tabPersona(personaId) {
  const p = getPersona(personaId);
  if (!p) return;

  const father   = p.father_id ? getPersona(p.father_id) : null;
  const mother   = p.mother_id ? getPersona(p.mother_id) : null;
  const marriages = getMatrimoniosByPersona(personaId);
  const orphans   = getHijosSinMatrimonio(personaId);

  let html = '';

  // Vita: nacimiento y fallecimiento en grid de dos columnas
  const birthStr = _datePlace(p.birth_date, p.birth_place);
  const deathStr = _datePlace(p.death_date, p.death_place);

  if (birthStr || deathStr) {
    html += `<section class="panel-section"><h3 class="panel-section-title">Fechas y lugares</h3>
      <div class="panel-vita-grid">`;
    if (birthStr) {
      html += `<div class="panel-vita-item">
        <span class="panel-label">Nacimiento</span>
        <span class="panel-vita-val">${birthStr}</span>
      </div>`;
    }
    if (deathStr) {
      html += `<div class="panel-vita-item">
        <span class="panel-label">Fallecimiento</span>
        <span class="panel-vita-val">${deathStr}</span>
      </div>`;
    }
    html += `</div></section>`;
  }

  // Padres
  if (father || mother) {
    html += `<section class="panel-section"><h3 class="panel-section-title">Padres</h3>`;
    if (father) html += `<p class="panel-link" data-focus="${father.id}">↑ ${father.name}</p>`;
    if (mother) html += `<p class="panel-link" data-focus="${mother.id}">↑ ${mother.name}</p>`;
    html += `</section>`;
  }

  // Matrimonios e hijos
  if (marriages.length > 0) {
    html += `<section class="panel-section"><h3 class="panel-section-title">Matrimonios</h3>`;
    marriages.forEach(m => {
      const conyugeId = m.spouse1_id === personaId ? m.spouse2_id : m.spouse1_id;
      const conyuge   = getPersona(conyugeId);
      const children  = getHijosByMatrimonio(m.id);
      const mStr      = _datePlace(m.marriage_date, m.marriage_place);

      html += `<div class="panel-marriage">`;
      if (conyuge) {
        html += `<p class="panel-link panel-spouse" data-focus="${conyuge.id}">${conyuge.name}</p>`;
      }
      if (mStr) {
        html += `<p class="panel-meta panel-meta--indent">${mStr}</p>`;
      }
      if (children.length > 0) {
        html += `<div class="panel-children">`;
        children.forEach(c => {
          html += `<p class="panel-link panel-child" data-focus="${c.id}">↓ ${c.name}</p>`;
        });
        html += `</div>`;
      }
      html += `</div>`;
    });
    html += `</section>`;
  }

  if (orphans.length > 0) {
    html += `<section class="panel-section"><h3 class="panel-section-title">Hijos</h3>`;
    orphans.forEach(c => {
      html += `<p class="panel-link panel-child" data-focus="${c.id}">↓ ${c.name}</p>`;
    });
    html += `</section>`;
  }

  if (!html) {
    html = `<p class="panel-empty">Sin datos biográficos registrados.</p>`;
  }

  _body.innerHTML = html;
}

// ── Tab: Investigación ────────────────────────────────────────────────────────

async function _tabInvestigacion(personaId) {
  const p = getPersona(personaId);
  if (!p) return;

  _body.innerHTML = `<p class="panel-empty">Cargando…</p>`;

  const url = window.getContentPath(`personas/${personaId}.md`);
  try {
    const res = await fetch(url);
    if (_currentId !== personaId) return; // navegó a otra persona mientras cargaba
    if (res.ok) {
      const md = await res.text();
      if (_currentId !== personaId) return;
      _body.innerHTML = `<div class="panel-section"><div class="panel-markdown">${window.marked.parse(md)}</div></div>`;
      return;
    }
  } catch { /* sin archivo — continúa al fallback */ }

  if (_currentId !== personaId) return;

  // Fallback: notas y fuentes del DB
  let html = '';
  if (p.notes?.trim()) {
    html += `<section class="panel-section">
      <h3 class="panel-section-title">Notas</h3>
      <p class="panel-text">${p.notes.trim()}</p>
    </section>`;
  }
  if (p.sources?.trim()) {
    html += `<section class="panel-section">
      <h3 class="panel-section-title">Fuentes</h3>
      <p class="panel-text">${p.sources.trim()}</p>
    </section>`;
  }
  if (!html) {
    html = `<p class="panel-empty">Sin notas de investigación.<br>
      <span class="panel-empty-hint">Crea <code>content/personas/${personaId}.md</code> para agregar contenido.</span>
    </p>`;
  }
  _body.innerHTML = html;
}

// ── Tab: Archivos ─────────────────────────────────────────────────────────────

function _tabArchivos(personaId) {
  const p = getPersona(personaId);
  if (!p) return;

  if (!p.media?.length) {
    _body.innerHTML = `<p class="panel-empty">No hay archivos multimedia para esta persona.</p>`;
    return;
  }

  _body.innerHTML = `<div class="panel-media">${_renderMedia(p.media)}</div>`;
}

// ── Navegación interna ────────────────────────────────────────────────────────

function _bindNavLinks() {
  _body.querySelectorAll('[data-focus]').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.focus;
      setFocus(id);
      setSelected(id);
    });
  });
}

// ── Media ─────────────────────────────────────────────────────────────────────

function _renderMedia(media) {
  const seen  = new Set();
  const units = [];

  for (const m of media) {
    if (!m.group_label) {
      units.push({ type: 'single', item: m });
    } else if (!seen.has(m.group_label)) {
      seen.add(m.group_label);
      units.push({
        type:  'group',
        label: m.group_label,
        items: media.filter(x => x.group_label === m.group_label),
      });
    }
  }

  return units.map(u => {
    if (u.type === 'single') return _mediaItem(u.item);
    return `
      <div class="panel-media-group">
        <p class="panel-media-group-label">${u.label}</p>
        <div class="panel-media-group-photos">
          ${u.items.map(m => _mediaItem(m)).join('')}
        </div>
      </div>`;
  }).join('');
}

function _mediaItem(item) {
  if (item.type !== 'document') {
    return `<a href="${item.url}" target="_blank" class="panel-media-photo">
      <img src="${item.url}" alt="${item.caption || ''}">
      ${item.caption ? `<span>${item.caption}</span>` : ''}
    </a>`;
  }
  return `<a href="${item.url}" target="_blank" class="panel-media-doc">
    📄 ${item.caption || item.url}
  </a>`;
}

// ── Status badge ──────────────────────────────────────────────────────────────

function _statusBadge(status) {
  const labels = {
    verificado:  'Verificado',
    incompleto:  'Incompleto',
    en_proceso:  'En proceso',
    sin_datos:   'Sin datos',
  };
  const label = labels[status] || labels['sin_datos'];
  const cls   = status && labels[status] ? status : 'sin_datos';
  return `<span class="panel-status panel-status--${cls}">${label}</span>`;
}

// ── Utilidades ────────────────────────────────────────────────────────────────

function _year(dateStr) {
  if (!dateStr) return '';
  const m = String(dateStr).match(/^(\d{4})/);
  return m ? m[1] : '';
}

function _formatDate(dateStr) {
  if (!dateStr) return null;
  const m = String(dateStr).match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?/);
  if (!m) return dateStr;
  const [, y, mo, d] = m;
  if (!mo || mo === '00') return y;
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto',
                  'septiembre','octubre','noviembre','diciembre'];
  const month = months[parseInt(mo, 10) - 1];
  if (!d || d === '00') return `${month} de ${y}`;
  return `${parseInt(d, 10)} de ${month} de ${y}`;
}

function _datePlace(date, place) {
  const parts = [_formatDate(date), place].filter(Boolean);
  return parts.join(' · ');
}
