/**
 * panel.js — panel lateral con información completa de la persona seleccionada.
 *
 * Escucha el evento 'selectionChange' del store y renderiza el contenido.
 * Los links de navegación (padres, cónyuge, hijos) llaman a setFocus + setSelected.
 */

import {
  getPersona,
  getMatrimoniosByPersona,
  getHijosByMatrimonio,
  getHijosSinMatrimonio,
} from './data.js';
import { setFocus, setSelected, on } from './store.js';

let _panel = null;
let _body  = null;

export function initPanel() {
  _panel = document.getElementById('treePanel');
  _body  = document.getElementById('treePanelBody');
  const closeBtn = document.getElementById('treePanelClose');

  if (!_panel || !_body) return;

  closeBtn?.addEventListener('click', () => setSelected(null));

  on('selectionChange', id => {
    if (!id) {
      _panel.classList.remove('is-open');
      return;
    }
    _renderContent(id);
    _panel.classList.add('is-open');
  });
}

// ── Renderizado ───────────────────────────────────────────────────────────────

function _renderContent(personaId) {
  const p = getPersona(personaId);
  if (!p || !_body) return;

  const father = p.father_id ? getPersona(p.father_id) : null;
  const mother = p.mother_id ? getPersona(p.mother_id) : null;
  const marriages = getMatrimoniosByPersona(personaId);
  const orphans = getHijosSinMatrimonio(personaId);

  let html = `<h2 class="panel-name">${p.name}</h2>`;

  // Datos vitales
  const birthStr = _datePlace(p.birth_date, p.birth_place);
  const deathStr = _datePlace(p.death_date, p.death_place);

  if (birthStr || deathStr) {
    html += `<section class="panel-section">`;
    if (birthStr) html += `<p class="panel-meta"><span class="panel-label">Nacimiento</span>${birthStr}</p>`;
    if (deathStr) html += `<p class="panel-meta"><span class="panel-label">Fallecimiento</span>${deathStr}</p>`;
    html += `</section>`;
  }

  // Padres
  if (father || mother) {
    html += `<section class="panel-section"><h3 class="panel-section-title">Padres</h3>`;
    if (father) html += `<p class="panel-link" data-focus="${father.id}">↑ ${father.name}</p>`;
    if (mother) html += `<p class="panel-link" data-focus="${mother.id}">↑ ${mother.name}</p>`;
    html += `</section>`;
  }

  // Matrimonios
  if (marriages.length > 0) {
    html += `<section class="panel-section"><h3 class="panel-section-title">Matrimonios</h3>`;
    marriages.forEach(m => {
      const conyugeId = m.spouse1_id === personaId ? m.spouse2_id : m.spouse1_id;
      const conyuge   = getPersona(conyugeId);
      const children  = getHijosByMatrimonio(m.id);
      const mStr      = _datePlace(m.marriage_date, m.marriage_place);

      html += `<div class="panel-marriage">`;
      if (conyuge) {
        html += `<p class="panel-link panel-spouse" data-focus="${conyuge.id}">♦ ${conyuge.name}</p>`;
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

  // Hijos sin matrimonio registrado
  if (orphans.length > 0) {
    html += `<section class="panel-section"><h3 class="panel-section-title">Hijos</h3>`;
    orphans.forEach(c => {
      html += `<p class="panel-link panel-child" data-focus="${c.id}">↓ ${c.name}</p>`;
    });
    html += `</section>`;
  }

  // Notas
  if (p.notes?.trim()) {
    html += `
      <section class="panel-section">
        <h3 class="panel-section-title">Notas</h3>
        <p class="panel-text">${p.notes.trim()}</p>
      </section>`;
  }

  // Fuentes
  if (p.sources?.trim()) {
    html += `
      <section class="panel-section">
        <h3 class="panel-section-title">Fuentes</h3>
        <p class="panel-text">${p.sources.trim()}</p>
      </section>`;
  }

  // Archivos multimedia
  if (p.media?.length > 0) {
    html += `<section class="panel-section"><h3 class="panel-section-title">Archivos</h3><div class="panel-media">`;
    p.media.forEach(item => {
      if (item.type === 'photo') {
        html += `<a href="${item.url}" target="_blank" class="panel-media-photo">
          <img src="${item.url}" alt="${item.caption || ''}">
          ${item.caption ? `<span>${item.caption}</span>` : ''}
        </a>`;
      } else {
        html += `<a href="${item.url}" target="_blank" class="panel-media-doc">
          📄 ${item.caption || item.url}
        </a>`;
      }
    });
    html += `</div></section>`;
  }

  _body.innerHTML = html;

  // Conectar links de navegación
  _body.querySelectorAll('[data-focus]').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.focus;
      setFocus(id);
      setSelected(id);
    });
  });
}

// ── Utilidades ────────────────────────────────────────────────────────────────

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
