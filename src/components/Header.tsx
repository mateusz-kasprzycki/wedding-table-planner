import { useRef, useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { exportJSON, exportPDF } from '../utils/export';
import { IconUpload, IconDownload, IconFile, IconRestore, IconTrash } from './icons';

interface HeaderProps {
  onImportClick: () => void;
  onRestoreClick: () => void;
}

export default function Header({ onImportClick, onRestoreClick }: HeaderProps) {
  const { state, setTitle, reset } = usePlanner();
  const [editing, setEditing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  return (
    <header className="relative overflow-hidden border-b border-white/8 bg-pine text-cream">
      {/* Warm atmospheric tint */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brass/8 via-transparent to-transparent" />
      {/* Gold ornamental line at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brass/50 to-transparent" />

      <div className="relative mx-auto flex max-w-[1400px] flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          {/* Ornamental subtitle row */}
          <div className="mb-2 flex items-center gap-3">
            <div className="h-px w-5 bg-gradient-to-r from-transparent to-brass/55" />
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-brass/80">
              Marta &amp; Mateusz · Wedding Seating
            </p>
            <div className="h-px w-12 bg-gradient-to-r from-brass/55 to-transparent" />
          </div>

          {editing ? (
            <input
              ref={inputRef}
              defaultValue={state.title}
              autoFocus
              onBlur={(e) => {
                setTitle(e.target.value.trim() || state.title);
                setEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                if (e.key === 'Escape') setEditing(false);
              }}
              className="w-full max-w-2xl rounded-md border border-cream/20 bg-black/20 px-2 py-1 font-display text-2xl font-normal text-cream outline-none focus:border-brass/60"
            />
          ) : (
            <h1
              className="cursor-text font-display text-2xl font-normal leading-tight tracking-tight text-cream sm:text-3xl"
              onClick={() => setEditing(true)}
              title="Click to rename"
            >
              {state.title}
            </h1>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="btn border border-cream/20 bg-white/5 text-cream/85 hover:border-cream/35 hover:bg-white/10 hover:text-cream"
            onClick={onImportClick}
          >
            <IconUpload /> Import guests
          </button>
          <button
            className="btn border border-cream/20 bg-white/5 text-cream/85 hover:border-cream/35 hover:bg-white/10 hover:text-cream"
            onClick={() => exportJSON(state)}
          >
            <IconDownload /> Save backup
          </button>
          <button
            className="btn border border-cream/20 bg-white/5 text-cream/85 hover:border-cream/35 hover:bg-white/10 hover:text-cream"
            onClick={onRestoreClick}
          >
            <IconRestore /> Restore backup
          </button>
          <button
            className="btn border border-cream/20 bg-white/5 text-cream/85 hover:border-cream/35 hover:bg-white/10 hover:text-cream"
            onClick={() => exportPDF(state)}
          >
            <IconFile /> PDF
          </button>
          <button
            className={`btn border transition-all ${
              confirmClear
                ? 'border-ember/60 bg-ember/15 text-cream hover:bg-ember/25'
                : 'border-cream/20 bg-white/5 text-cream/50 hover:border-ember/40 hover:bg-ember/10 hover:text-cream/80'
            }`}
            onClick={() => {
              if (confirmClear) {
                if (clearTimer.current) clearTimeout(clearTimer.current);
                reset();
                setConfirmClear(false);
              } else {
                setConfirmClear(true);
                clearTimer.current = setTimeout(() => setConfirmClear(false), 3000);
              }
            }}
          >
            <IconTrash width={15} height={15} />
            {confirmClear ? 'Are you sure?' : 'Clear all'}
          </button>
        </div>
      </div>
    </header>
  );
}
