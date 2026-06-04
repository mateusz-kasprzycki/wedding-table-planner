import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { makeId } from '../utils/csv';
import {
  DEFAULT_STATE,
  STORAGE_KEY,
  type Guest,
  type PlannerState,
  type TableEntity,
  type TableShape,
} from '../types';

interface PlannerActions {
  setTitle: (title: string) => void;
  addGuests: (guests: Guest[]) => void;
  updateGuest: (id: string, patch: Partial<Guest>) => void;
  removeGuest: (id: string) => void;
  clearGuests: () => void;

  addTable: (shape?: TableShape) => void;
  updateTable: (id: string, patch: Partial<TableEntity>) => void;
  removeTable: (id: string) => void;

  assignGuest: (guestId: string, tableId: string | null) => void;
  /** Move guest to insertBefore position within the table; compacts all indices. */
  reorderGuest: (guestId: string, tableId: string, insertBefore: number) => void;

  replaceState: (state: PlannerState) => void;
  reset: () => void;
}

interface PlannerContextValue extends PlannerActions {
  state: PlannerState;
  guestsByTable: Map<string, Guest[]>;
  unseatedGuests: Guest[];
}

const PlannerContext = createContext<PlannerContextValue | null>(null);

function compactIndices(guests: Guest[], tableId: string): Guest[] {
  const seated = guests
    .filter((g) => g.tableId === tableId)
    .sort((a, b) => (a.seatIndex ?? 0) - (b.seatIndex ?? 0));
  const idToIndex = new Map(seated.map((g, i) => [g.id, i]));
  return guests.map((g) =>
    idToIndex.has(g.id) ? { ...g, seatIndex: idToIndex.get(g.id)! } : g,
  );
}

let tableCounter = 0;

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useLocalStorage<PlannerState>(STORAGE_KEY, DEFAULT_STATE);

  // Migrate guests saved before seatIndex was introduced
  useEffect(() => {
    if (!state.guests.some((g) => g.seatIndex === undefined)) return;
    const counters = new Map<string, number>();
    setState((s) => ({
      ...s,
      guests: s.guests.map((g) => {
        if (g.seatIndex !== undefined) return g;
        if (!g.tableId) return { ...g, seatIndex: null };
        const idx = counters.get(g.tableId) ?? 0;
        counters.set(g.tableId, idx + 1);
        return { ...g, seatIndex: idx };
      }),
    }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setTitle = useCallback(
    (title: string) => setState((s) => ({ ...s, title })),
    [setState],
  );

  const addGuests = useCallback(
    (guests: Guest[]) =>
      setState((s) => ({
        ...s,
        guests: [
          ...s.guests,
          ...guests.map((g) => ({ ...g, seatIndex: g.seatIndex ?? null })),
        ],
      })),
    [setState],
  );

  const updateGuest = useCallback(
    (id: string, patch: Partial<Guest>) =>
      setState((s) => ({
        ...s,
        guests: s.guests.map((g) => (g.id === id ? { ...g, ...patch } : g)),
      })),
    [setState],
  );

  const removeGuest = useCallback(
    (id: string) =>
      setState((s) => ({ ...s, guests: s.guests.filter((g) => g.id !== id) })),
    [setState],
  );

  const clearGuests = useCallback(
    () => setState((s) => ({ ...s, guests: [] })),
    [setState],
  );

  const addTable = useCallback(
    (shape: TableShape = 'Round') =>
      setState((s) => {
        const n = s.tables.length + 1;
        tableCounter = Math.max(tableCounter, n);
        const table: TableEntity = {
          id: makeId('t'),
          name: `Table ${n}`,
          shape,
          seats: shape === 'Rectangular' ? 8 : 6,
          x: 20 + (s.tables.length % 4) * 540,
          y: 20 + Math.floor(s.tables.length / 4) * 540,
        };
        return { ...s, tables: [...s.tables, table] };
      }),
    [setState],
  );

  const updateTable = useCallback(
    (id: string, patch: Partial<TableEntity>) =>
      setState((s) => ({
        ...s,
        tables: s.tables.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      })),
    [setState],
  );

  const removeTable = useCallback(
    (id: string) =>
      setState((s) => ({
        ...s,
        tables: s.tables.filter((t) => t.id !== id),
        guests: s.guests.map((g) =>
          g.tableId === id ? { ...g, tableId: null, seatIndex: null } : g,
        ),
      })),
    [setState],
  );

  const assignGuest = useCallback(
    (guestId: string, tableId: string | null) =>
      setState((s) => {
        const moving = s.guests.find((g) => g.id === guestId);
        if (!moving) return s;
        const oldTableId = moving.tableId;

        let guests = s.guests.map((g) => {
          if (g.id !== guestId) return g;
          if (tableId === null) return { ...g, tableId: null, seatIndex: null };
          const newOccupants = s.guests.filter(
            (og) => og.tableId === tableId && og.id !== guestId,
          );
          return { ...g, tableId, seatIndex: newOccupants.length };
        });

        if (oldTableId && oldTableId !== tableId) {
          guests = compactIndices(guests, oldTableId);
        }

        return { ...s, guests };
      }),
    [setState],
  );

  const reorderGuest = useCallback(
    (guestId: string, tableId: string, insertBefore: number) =>
      setState((s) => {
        const tableGuests = s.guests
          .filter((g) => g.tableId === tableId)
          .sort((a, b) => (a.seatIndex ?? 0) - (b.seatIndex ?? 0));
        const moving = tableGuests.find((g) => g.id === guestId);
        if (!moving) return s;
        const others = tableGuests.filter((g) => g.id !== guestId);
        const clamped = Math.min(Math.max(0, insertBefore), others.length);
        const reordered = [
          ...others.slice(0, clamped),
          moving,
          ...others.slice(clamped),
        ];
        const idToIndex = new Map(reordered.map((g, i) => [g.id, i]));
        return {
          ...s,
          guests: s.guests.map((g) =>
            idToIndex.has(g.id) ? { ...g, seatIndex: idToIndex.get(g.id)! } : g,
          ),
        };
      }),
    [setState],
  );

  const replaceState = useCallback(
    (next: PlannerState) => setState({ ...DEFAULT_STATE, ...next }),
    [setState],
  );

  const reset = useCallback(() => setState(DEFAULT_STATE), [setState]);

  const guestsByTable = useMemo(() => {
    const map = new Map<string, Guest[]>();
    for (const g of state.guests) {
      if (!g.tableId) continue;
      const arr = map.get(g.tableId) ?? [];
      arr.push(g);
      map.set(g.tableId, arr);
    }
    return map;
  }, [state.guests]);

  const unseatedGuests = useMemo(
    () => state.guests.filter((g) => !g.tableId),
    [state.guests],
  );

  const value = useMemo<PlannerContextValue>(
    () => ({
      state,
      guestsByTable,
      unseatedGuests,
      setTitle,
      addGuests,
      updateGuest,
      removeGuest,
      clearGuests,
      addTable,
      updateTable,
      removeTable,
      assignGuest,
      reorderGuest,
      replaceState,
      reset,
    }),
    [
      state,
      guestsByTable,
      unseatedGuests,
      setTitle,
      addGuests,
      updateGuest,
      removeGuest,
      clearGuests,
      addTable,
      updateTable,
      removeTable,
      assignGuest,
      reorderGuest,
      replaceState,
      reset,
    ],
  );

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlanner(): PlannerContextValue {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error('usePlanner must be used inside <PlannerProvider>');
  return ctx;
}
