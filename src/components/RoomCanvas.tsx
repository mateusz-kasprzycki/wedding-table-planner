import { useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { SHAPE_OPTIONS } from '../types';
import TableCircle from './TableCircle';
import { IconPlus } from './icons';

const CANVAS_W = 2400;
const CANVAS_H = 1400;

export default function RoomCanvas() {
  const { state, addTable } = usePlanner();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <div>
          <h2 className="font-display text-xl font-normal text-pine">Room layout</h2>
          <p className="text-[11px] text-charcoal/45">
            Drag tables to arrange the room. Drop guests from the sidebar onto a
            table, then drag their tokens to set seat order.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {SHAPE_OPTIONS.map((shape) => (
            <button key={shape} className="btn-ghost" onClick={() => addTable(shape)}>
              <IconPlus width={15} height={15} /> {shape}
            </button>
          ))}
        </div>
      </div>

      <div className="scroll-thin min-h-0 flex-1 overflow-auto rounded-2xl border border-mist bg-cream/30 shadow-card">
        {state.tables.length === 0 ? (
          <div className="grid h-full min-h-64 place-items-center">
            <div className="max-w-sm px-6 text-center">
              <div className="ornament-line mx-auto mb-4 w-24 text-gold-light">
                <span className="text-[10px] text-brass/60">✦</span>
              </div>
              <p className="font-display text-xl font-normal text-charcoal/60">No tables yet</p>
              <p className="mt-2 text-sm text-charcoal/40">
                Add your first table using the buttons above, then drag guests
                from the sidebar onto the table.
              </p>
              <button className="btn-primary mt-5" onClick={() => addTable('Round')}>
                <IconPlus /> Add a round table
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{ position: 'relative', width: CANVAS_W, height: CANVAS_H }}
            onClick={() => setSelectedTableId(null)}
          >
            {state.tables.map((t) => (
              <TableCircle
                key={t.id}
                table={t}
                isSelected={selectedTableId === t.id}
                onSelect={() => setSelectedTableId((id) => (id === t.id ? null : t.id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
