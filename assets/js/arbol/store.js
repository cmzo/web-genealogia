/**
 * Estado global del árbol genealógico.
 * Patrón pub/sub sin framework.
 *
 * Eventos:
 *   'focusChange'     → id de la nueva persona foco
 *   'selectionChange' → id de la persona seleccionada (panel lateral)
 *   'viewChange'      → 'pedigree' | 'full'
 */

const _state = {
  focusPersonId:    null,
  selectedPersonId: null,
  viewMode:         'pedigree',
};

const _listeners = {};

function emit(event, data) {
  (_listeners[event] ?? []).forEach(fn => fn(data));
}

export function on(event, fn) {
  if (!_listeners[event]) _listeners[event] = [];
  _listeners[event].push(fn);
}

export function off(event, fn) {
  if (!_listeners[event]) return;
  _listeners[event] = _listeners[event].filter(f => f !== fn);
}

// ── getters ──────────────────────────────────────────────────────────────────

export const getFocusPersonId    = () => _state.focusPersonId;
export const getSelectedPersonId = () => _state.selectedPersonId;
export const getViewMode         = () => _state.viewMode;

// ── setters ──────────────────────────────────────────────────────────────────

export function setFocus(id) {
  if (_state.focusPersonId === id) return;
  _state.focusPersonId = id;
  emit('focusChange', id);
}

export function setSelected(id) {
  _state.selectedPersonId = id;
  emit('selectionChange', id);
}

export function setView(mode) {
  if (_state.viewMode === mode) return;
  _state.viewMode = mode;
  emit('viewChange', mode);
}
