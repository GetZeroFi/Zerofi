// ── useStorage hook ───────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { save, load } from '../utils/storage';

export function useStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    const stored = load(key);
    return stored !== null ? stored : defaultValue;
  });

  const set = (newVal) => {
    const resolved = typeof newVal === 'function' ? newVal(value) : newVal;
    setValue(resolved);
    save(key, resolved);
  };

  return [value, set];
}
