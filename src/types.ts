export type TableShape = 'Round' | 'Rectangular' | 'Square';

export interface Guest {
  id: string;
  name: string;
  /** id of the table the guest is seated at, or null if unseated. */
  tableId: string | null;
  /** Clockwise seat position at the table (0 = first seat). null = unseated. */
  seatIndex: number | null;
}

export interface TableEntity {
  id: string;
  name: string;
  shape: TableShape;
  /** Maximum number of seats. */
  seats: number;
  /** Free position on the canvas (px). */
  x: number;
  y: number;
}

export interface PlannerState {
  /** Schema version, bumped on breaking changes so we can migrate persisted data. */
  version: number;
  title: string;
  guests: Guest[];
  tables: TableEntity[];
}

export const SHAPE_OPTIONS: TableShape[] = ['Round', 'Rectangular', 'Square'];

export const STORAGE_KEY = 'wedding-seating-planner/v1';

export const DEFAULT_STATE: PlannerState = {
  version: 1,
  title: 'Our Wedding — Seating Planner',
  guests: [],
  tables: [],
};
