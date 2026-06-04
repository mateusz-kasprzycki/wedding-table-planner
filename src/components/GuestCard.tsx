import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { usePlanner } from '../context/PlannerContext';
import type { Guest } from '../types';
import { IconTrash } from './icons';

interface GuestCardProps {
  guest: Guest;
  showAssign?: boolean;
}

export default function GuestCard({ guest, showAssign = true }: GuestCardProps) {
  const { state, assignGuest, removeGuest } = usePlanner();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: guest.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 }}
      {...listeners}
      {...attributes}
      className="group flex cursor-grab items-center gap-2 rounded-lg border border-mist bg-cream/90 px-3 py-2 shadow-card transition hover:border-[#d4c9bf] hover:shadow-lift/50 active:cursor-grabbing"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-charcoal">{guest.name}</p>
        {guest.groupId && (
          <span className="text-[11px] text-charcoal/45">·{guest.groupId}</span>
        )}
      </div>

      {showAssign && (
        <select
          value={guest.tableId ?? ''}
          onChange={(e) => assignGuest(guest.id, e.target.value || null)}
          className="max-w-[110px] rounded-md border border-mist bg-parchment px-1.5 py-1 text-xs text-charcoal outline-none focus:border-brass"
          title="Assign to table"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <option value="">Unseated</option>
          {state.tables.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      )}

      <button
        onClick={() => removeGuest(guest.id)}
        onPointerDown={(e) => e.stopPropagation()}
        className="shrink-0 rounded-md p-1 text-charcoal/30 opacity-0 transition hover:bg-ember/10 hover:text-ember group-hover:opacity-100"
        title="Remove guest"
      >
        <IconTrash width={15} height={15} />
      </button>
    </div>
  );
}
