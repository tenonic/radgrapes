// Saving the player's best progress on each map, in the browser's storage.
// The browser can refuse storage (private windows, blocked site data), so every
// read and write is wrapped in try/catch: the game still works, it just won't remember.
const KEY = "dash3d.best";

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? {};
  } catch {
    return {};
  }
}

// Best progress on this map, in percent (0 if never played).
export function loadBest(mapName) {
  return loadAll()[mapName] ?? 0;
}

export function saveBest(mapName, percent) {
  try {
    const all = loadAll();
    all[mapName] = percent;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Storage isn't available; the best score just won't be remembered.
  }
}
