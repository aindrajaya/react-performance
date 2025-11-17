// Simple store implementation for selective re-rendering demo
let state = {
  cart: { items: [] },
  user: { name: '' }
};

let listeners = new Set();

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getState() {
  return state;
}

function setState(updater) {
  state = typeof updater === 'function' ? updater(state) : updater;
  listeners.forEach(listener => listener());
}

// Shallow equal for simple comparison
function shallowEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (let key of keysA) {
    if (a[key] !== b[key]) return false;
  }

  return true;
}

export { getState, setState, subscribe, shallowEqual };