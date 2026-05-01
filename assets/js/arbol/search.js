/**
 * search.js — autocomplete custom de personas por nombre.
 */

import { getAllPersonas } from './data.js';
import { setFocus, setSelected } from './store.js';

const MAX_RESULTS = 8;

export function initSearch() {
  const input       = document.getElementById('searchInput');
  const suggestions = document.getElementById('searchSuggestions');
  if (!input || !suggestions) return;

  const personas = [...getAllPersonas().values()];

  let _activeIdx = -1;

  function _show(items) {
    suggestions.innerHTML = '';
    _activeIdx = -1;
    if (!items.length) { _hide(); return; }

    items.forEach((p, i) => {
      const li = document.createElement('li');
      li.className = 'search-suggestion-item';
      li.textContent = p.name;
      li.dataset.id = p.id;
      li.addEventListener('mousedown', e => {
        e.preventDefault(); // evita que el input pierda foco antes del click
        _navigate(p.id);
      });
      suggestions.appendChild(li);
    });

    suggestions.classList.add('is-open');
  }

  function _hide() {
    suggestions.classList.remove('is-open');
    suggestions.innerHTML = '';
    _activeIdx = -1;
  }

  function _navigate(id) {
    setFocus(id);
    setSelected(id);
    input.value = '';
    _hide();
    input.blur();
  }

  function _setActive(idx) {
    const items = suggestions.querySelectorAll('.search-suggestion-item');
    items.forEach(el => el.classList.remove('is-active'));
    _activeIdx = Math.max(-1, Math.min(idx, items.length - 1));
    if (_activeIdx >= 0) items[_activeIdx].classList.add('is-active');
  }

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { _hide(); return; }
    const matches = personas
      .filter(p => p.name.toLowerCase().includes(q))
      .slice(0, MAX_RESULTS);
    _show(matches);
  });

  input.addEventListener('keydown', e => {
    if (!suggestions.classList.contains('is-open')) return;
    if (e.key === 'ArrowDown')  { e.preventDefault(); _setActive(_activeIdx + 1); }
    if (e.key === 'ArrowUp')    { e.preventDefault(); _setActive(_activeIdx - 1); }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (_activeIdx >= 0) {
        const item = suggestions.querySelectorAll('.search-suggestion-item')[_activeIdx];
        if (item) _navigate(item.dataset.id);
      }
    }
    if (e.key === 'Escape') { _hide(); input.blur(); }
  });

  input.addEventListener('blur', () => setTimeout(_hide, 150));
}
