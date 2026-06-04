import { useCallback, useEffect, useRef, useState } from 'react';

type Updater<T> = T | ((prev: T) => T);

/**
 * Persist a piece of React state to localStorage.
 *
 * - Lazy-reads the initial value once (no flicker / no repeated parsing).
 * - Fails safe: any read/parse error falls back to `initialValue`.
 * - Syncs across browser tabs via the native `storage` event.
 * - Identical API to useState: `[value, setValue]`.
 *
 * This is the single source of truth for client-side persistence. There is no
 * backend; everything the user does lives here.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: Updater<T>) => void] {
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch (err) {
      console.warn(`useLocalStorage: failed to read key "${key}"`, err);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Keep the latest value in a ref so the functional-updater path never goes stale.
  const valueRef = useRef(storedValue);
  valueRef.current = storedValue;

  const setValue = useCallback(
    (value: Updater<T>) => {
      try {
        const next =
          value instanceof Function ? (value as (prev: T) => T)(valueRef.current) : value;
        valueRef.current = next;
        setStoredValue(next);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(next));
        }
      } catch (err) {
        console.warn(`useLocalStorage: failed to write key "${key}"`, err);
      }
    },
    [key],
  );

  // Cross-tab synchronisation: if another tab updates the same key, mirror it here.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      try {
        const next = e.newValue ? (JSON.parse(e.newValue) as T) : initialValue;
        valueRef.current = next;
        setStoredValue(next);
      } catch {
        /* ignore malformed payloads from other tabs */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, initialValue]);

  return [storedValue, setValue];
}
