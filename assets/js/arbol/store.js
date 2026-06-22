const _state = {
  focusPersonId:    null,
  selectedPersonId: null,
};

const _listeners = {};

function emit(event, data) {
  (_listeners[event] ?? []).forEach(fn => fn(data));
}

export function on(event, fn) {
  if (!_listeners[event]) _listeners[event] = [];
  _listeners[event].push(fn);
}

export const getFocusPersonId    = () => _state.focusPersonId;
export const getSelectedPersonId = () => _state.selectedPersonId;

export function setFocus(id) {
  if (_state.focusPersonId === id) return;
  _state.focusPersonId = id;
  emit('focusChange', id);
}

export function setSelected(id) {
  _state.selectedPersonId = id;
  emit('selectionChange', id);
}
