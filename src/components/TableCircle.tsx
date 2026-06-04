import { useRef, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { usePlanner } from '../context/PlannerContext';
import { SHAPE_OPTIONS, type TableEntity } from '../types';
import GuestToken from './GuestToken';
import { IconTrash } from './icons';

const TABLE_R = 52;
const EMPTY_R = 8;
// Estimated pill height in px — drives the no-overlap orbit formula.
// Matches text-[11px] leading-none py-[2px] in GuestToken (11 + 2 + 2 + ~1 rounding = 16).
const PILL_H = 16;

interface Props {
  table: TableEntity;
  isSelected: boolean;
  onSelect: () => void;
}

export default function TableCircle({ table, isSelected, onSelect }: Props) {
  const { guestsByTable, updateTable, removeTable } = usePlanner();
  const [editingName, setEditingName] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tableDrag = useRef<{
    startX: number;
    startY: number;
    startTX: number;
    startTY: number;
    nx: number;
    ny: number;
    moved: boolean;
  } | null>(null);
  const didDrag = useRef(false);

  // ── Dynamic layout ──────────────────────────────────────────────────────────
  const n = table.seats;
  // Minimum orbit so adjacent horizontal pills don't overlap (formula) while also
  // keeping pills clear of the table surface (floor = TABLE_R + 52).
  const ORBIT_R = Math.max(
    TABLE_R + 52,
    Math.ceil(PILL_H / (1 - Math.cos((2 * Math.PI) / n))),
  );
  // 62 px = generous half-name-width estimate; 10 px = edge breathing room.
  const CONTAINER = 2 * (ORBIT_R + 62 + 10);
  const CENTER = CONTAINER / 2;

  const SHAPE_STYLE: Record<TableEntity['shape'], React.CSSProperties> = {
    Round: {
      width: TABLE_R * 2,
      height: TABLE_R * 2,
      borderRadius: '50%',
      left: CENTER - TABLE_R,
      top: CENTER - TABLE_R,
    },
    Square: {
      width: TABLE_R * 2,
      height: TABLE_R * 2,
      borderRadius: '14px',
      left: CENTER - TABLE_R,
      top: CENTER - TABLE_R,
    },
    Rectangular: {
      width: TABLE_R * 2 + 40,
      height: TABLE_R * 2 - 20,
      borderRadius: '12px',
      left: CENTER - TABLE_R - 20,
      top: CENTER - TABLE_R + 10,
    },
  };
  // ────────────────────────────────────────────────────────────────────────────

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: table.id });

  const occupants = (guestsByTable.get(table.id) ?? []).sort(
    (a, b) => (a.seatIndex ?? 0) - (b.seatIndex ?? 0),
  );
  const over = occupants.length > table.seats;

  function onContainerPointerDown(e: React.PointerEvent) {
    didDrag.current = false;
    tableDrag.current = {
      startX: e.clientX,
      startY: e.clientY,
      startTX: table.x,
      startTY: table.y,
      nx: table.x,
      ny: table.y,
      moved: false,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onContainerPointerMove(e: React.PointerEvent) {
    if (!tableDrag.current || !containerRef.current) return;
    const dx = e.clientX - tableDrag.current.startX;
    const dy = e.clientY - tableDrag.current.startY;
    tableDrag.current.nx = Math.max(0, tableDrag.current.startTX + dx);
    tableDrag.current.ny = Math.max(0, tableDrag.current.startTY + dy);
    if (Math.hypot(dx, dy) > 4) {
      tableDrag.current.moved = true;
      didDrag.current = true;
    }
    containerRef.current.style.left = `${tableDrag.current.nx}px`;
    containerRef.current.style.top = `${tableDrag.current.ny}px`;
  }

  function onContainerPointerUp() {
    if (!tableDrag.current) return;
    if (tableDrag.current.moved) {
      updateTable(table.id, { x: tableDrag.current.nx, y: tableDrag.current.ny });
    }
    tableDrag.current = null;
  }

  function onContainerClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (didDrag.current) {
      didDrag.current = false;
      return;
    }
    onSelect();
  }

  return (
    <div
      ref={containerRef}
      data-table-container={table.id}
      style={{
        position: 'absolute',
        left: table.x,
        top: table.y,
        width: CONTAINER,
        height: CONTAINER,
        touchAction: 'none',
      }}
      onPointerDown={onContainerPointerDown}
      onPointerMove={onContainerPointerMove}
      onPointerUp={onContainerPointerUp}
      onClick={onContainerClick}
    >
      {/* Table surface */}
      <div
        ref={setDropRef}
        data-table-id={table.id}
        style={{ position: 'absolute', ...SHAPE_STYLE[table.shape] }}
        className={`flex cursor-pointer select-none flex-col items-center justify-center border-2 transition ${
          isOver
            ? 'border-brass bg-brass/12 ring-2 ring-brass/40'
            : over
              ? 'border-ember bg-ember/8'
              : isSelected
                ? 'border-brass bg-gold-wash ring-2 ring-brass/25'
                : 'border-mist bg-cream hover:border-[#d4c9bf] hover:shadow-card'
        }`}
      >
        <span className="px-2 text-center font-display text-[11px] font-normal leading-tight text-charcoal/75">
          {table.name}
        </span>
        <span className={`text-[10px] ${over ? 'text-ember' : 'text-muted'}`}>
          {occupants.length}/{table.seats}
        </span>
      </div>

      {/* Empty seat indicators */}
      {Array.from({ length: table.seats }).map((_, i) => {
        if (i < occupants.length) return null;
        const a = -Math.PI / 2 + (i / table.seats) * 2 * Math.PI;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: CENTER + ORBIT_R * Math.cos(a) - EMPTY_R,
              top: CENTER + ORBIT_R * Math.sin(a) - EMPTY_R,
              width: EMPTY_R * 2,
              height: EMPTY_R * 2,
              borderRadius: '50%',
              border: '1.5px dashed',
              pointerEvents: 'none',
            }}
            className="border-brass/30"
          />
        );
      })}

      {/* Guest tokens */}
      {occupants.map((g) => (
        <GuestToken
          key={g.id}
          guest={g}
          table={table}
          sortedGuests={occupants}
          orbitRadius={ORBIT_R}
          containerCenter={CENTER}
        />
      ))}

      {/* Management panel */}
      {isSelected && (
        <div
          style={{ position: 'absolute', left: CONTAINER + 8, top: 0, zIndex: 30 }}
          className="w-44 rounded-xl border border-mist bg-cream/95 p-3 shadow-lift backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {editingName ? (
            <input
              defaultValue={table.name}
              autoFocus
              className="mb-2 w-full rounded-md border border-mist bg-parchment px-2 py-1 text-sm font-semibold text-charcoal outline-none focus:border-brass"
              onBlur={(e) => {
                updateTable(table.id, { name: e.target.value.trim() || table.name });
                setEditingName(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            />
          ) : (
            <p
              className="mb-2 cursor-text truncate font-display text-sm font-normal text-charcoal"
              onClick={() => setEditingName(true)}
              title="Click to rename"
            >
              {table.name}
            </p>
          )}

          <select
            value={table.shape}
            onChange={(e) =>
              updateTable(table.id, { shape: e.target.value as TableEntity['shape'] })
            }
            className="mb-2 w-full rounded-md border border-mist bg-parchment px-1.5 py-1 text-xs text-charcoal outline-none focus:border-brass"
          >
            {SHAPE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <label className="mb-2 flex items-center gap-1.5 text-xs text-charcoal/55">
            Seats
            <input
              type="number"
              min={1}
              max={15}
              value={table.seats}
              onChange={(e) =>
                updateTable(table.id, { seats: Math.max(1, Math.min(15, Number(e.target.value) || 1)) })
              }
              className="w-14 rounded-md border border-mist bg-parchment px-2 py-1 text-center text-xs text-charcoal outline-none focus:border-brass"
            />
          </label>

          <button
            onClick={() => removeTable(table.id)}
            className="flex items-center gap-1 text-xs text-charcoal/40 transition hover:text-ember"
          >
            <IconTrash width={12} height={12} /> Delete table
          </button>
        </div>
      )}
    </div>
  );
}
