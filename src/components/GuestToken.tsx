import { useRef, useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import type { Guest, TableEntity } from '../types';

interface Props {
  guest: Guest;
  table: TableEntity;
  sortedGuests: Guest[];
  orbitRadius: number;
  containerCenter: number;
}

export default function GuestToken({
  guest,
  table,
  sortedGuests,
  orbitRadius,
  containerCenter,
}: Props) {
  const { assignGuest, reorderGuest } = usePlanner();
  const dragRef = useRef<{ startX: number; startY: number; moved: boolean } | null>(null);
  const [faded, setFaded] = useState(false);

  const angle = -Math.PI / 2 + ((guest.seatIndex ?? 0) / table.seats) * 2 * Math.PI;
  const cx = containerCenter + orbitRadius * Math.cos(angle);
  const cy = containerCenter + orbitRadius * Math.sin(angle);

  function onPointerDown(e: React.PointerEvent) {
    e.stopPropagation();
    dragRef.current = { startX: e.clientX, startY: e.clientY, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const d = Math.hypot(e.clientX - dragRef.current.startX, e.clientY - dragRef.current.startY);
    if (d > 6 && !dragRef.current.moved) {
      dragRef.current.moved = true;
      setFaded(true);
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    const wasMoved = dragRef.current?.moved ?? false;
    dragRef.current = null;
    setFaded(false);
    if (!wasMoved) return;

    const el = document.elementFromPoint(e.clientX, e.clientY);

    const dropTableId = el?.closest('[data-table-id]')?.getAttribute('data-table-id');
    if (dropTableId && dropTableId !== table.id) {
      assignGuest(guest.id, dropTableId);
      return;
    }

    if (el?.closest('[data-unseated-zone]')) {
      assignGuest(guest.id, null);
      return;
    }

    const containerEl = document.querySelector(`[data-table-container="${table.id}"]`);
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const px = e.clientX - rect.left - containerCenter;
    const py = e.clientY - rect.top - containerCenter;
    const pointerAngle = Math.atan2(py, px);

    const others = sortedGuests.filter((g) => g.id !== guest.id);
    let bestK = 0;
    let bestDist = Infinity;
    for (let k = 0; k <= others.length; k++) {
      const a = -Math.PI / 2 + (k / table.seats) * 2 * Math.PI;
      const dist = Math.abs(normalizeAngle(pointerAngle - a));
      if (dist < bestDist) {
        bestDist = dist;
        bestK = k;
      }
    }
    reorderGuest(guest.id, table.id, bestK);
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: cx,
        top: cy,
        transform: 'translate(-50%, -50%)',
        opacity: faded ? 0.35 : 1,
        transition: faded ? 'none' : 'left 180ms ease, top 180ms ease',
        zIndex: faded ? 10 : 2,
        touchAction: 'none',
        whiteSpace: 'nowrap',
      }}
      className="flex cursor-grab items-center gap-1 rounded-full bg-brass px-2.5 py-[2px] text-[11px] leading-none font-semibold text-cream shadow-sm select-none active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      title={guest.name}
    >
      {guest.name}
    </div>
  );
}

function normalizeAngle(a: number): number {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}
