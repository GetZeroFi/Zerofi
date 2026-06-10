// ── usePersistence — verified cross-session storage ──────────────────────────
// Wraps localStorage with:
//   - Write verification (reads back after write)
//   - Timestamps on every save
//   - A health-check utility
import { useState, useEffect, useCallback } from 'react';
import { save, load } from '../utils/storage';

export function usePersistence(key, defaultValue) {
  const [value, setValue] = useState(() => {
    const stored = load(key);
    return stored !== null ? stored.data ?? stored : defaultValue;
  });
  const [lastSaved, setLastSaved] = useState(() => {
    const stored = load(key);
    return stored?.savedAt || null;
  });

  const set = useCallback((newVal) => {
    const resolved = typeof newVal === 'function' ? newVal(value) : newVal;
    const envelope = { data: resolved, savedAt: new Date().toISOString(), v: 1 };
    const ok = save(key, envelope);
    // Verify write
    const check = load(key);
    if (check?.v === 1) {
      setValue(resolved);
      setLastSaved(envelope.savedAt);
    } else {
      console.error(`Zerofi: persistence verification failed for ${key}`);
    }
    return ok;
  }, [key, value]);

  return [value, set, lastSaved];
}

export function checkStorageHealth() {
  try {
    const testKey = '__zerofi_health__';
    const testVal = { ok: true, ts: Date.now() };
    localStorage.setItem(testKey, JSON.stringify(testVal));
    const back = JSON.parse(localStorage.getItem(testKey));
    localStorage.removeItem(testKey);
    return back?.ok === true;
  } catch {
    return false;
  }
}
