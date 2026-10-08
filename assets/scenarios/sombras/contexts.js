const storageKey = 'sombras-ultimo-contexto';
let memoryLast = null;
const valid = value => [1, 2, 3, 4].includes(Number(value)) && value !== null;

export function createContextPicker(params, { getStorage = () => window.localStorage, random = Math.random } = {}) {
  const raw = params.get('contexto');
  const fixed = /^[1-4]$/.test(raw || '') ? Number(raw) : null;
  let last = memoryLast;
  let storage;
  try { storage = getStorage(); const saved = storage?.getItem(storageKey); if (valid(saved)) last = Number(saved); } catch { /* Continua com a memória da aba. */ }
  return {
    fixed,
    next() {
      const available = [1, 2, 3, 4].filter(context => context !== last);
      const selected = fixed || available[Math.min(available.length - 1, Math.max(0, Math.floor(random() * available.length)))];
      last = selected; memoryLast = selected;
      try { storage?.setItem(storageKey, String(selected)); } catch { /* A seleção continua mesmo sem armazenamento. */ }
      return selected;
    }
  };
}
