"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

// Every phone in stock is a single unit, so the cart is just a list of ids,
// kept in localStorage so it survives a page reload.
const KEY = "cart.v1";

const EMPTY: string[] = [];
const listeners = new Set<() => void>();
let cache: string[] | undefined;

function parse(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string")
      : [];
  } catch {
    return [];
  }
}

// Snapshot must stay referentially stable between reads, so it is cached and
// only replaced when the cart actually changes.
function getSnapshot(): string[] {
  if (cache === undefined) {
    try {
      cache = parse(localStorage.getItem(KEY));
    } catch {
      cache = [];
    }
  }
  return cache;
}

// null tells the component it is still rendering on the server, before the
// browser's cart is known.
function getServerSnapshot(): null {
  return null;
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep other tabs of the shop in step.
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === KEY) {
      cache = undefined;
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function write(next: string[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode or blocked storage: the cart just won't persist.
  }
  emit();
}

export function useCart() {
  const stored = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const ready = stored !== null;
  const ids = stored ?? EMPTY;

  const add = useCallback((id: string) => {
    const current = getSnapshot();
    if (!current.includes(id)) write([...current, id]);
  }, []);

  const remove = useCallback((id: string) => {
    write(getSnapshot().filter((v) => v !== id));
  }, []);

  const clear = useCallback(() => write([]), []);

  return useMemo(
    () => ({
      ids,
      ready,
      has: (id: string) => ids.includes(id),
      add,
      remove,
      clear,
    }),
    [ids, ready, add, remove, clear]
  );
}
