import { useRef, useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import type { PlannerState } from '../types';
import { IconClose, IconRestore } from './icons';

interface RestoreModalProps {
  open: boolean;
  onClose: () => void;
}

function isValidBackup(parsed: unknown): parsed is PlannerState {
  if (!parsed || typeof parsed !== 'object') return false;
  const s = parsed as Record<string, unknown>;
  return (
    typeof s.title === 'string' &&
    Array.isArray(s.guests) &&
    Array.isArray(s.tables)
  );
}

export default function RestoreModal({ open, onClose }: RestoreModalProps) {
  const { replaceState } = usePlanner();
  const [pending, setPending] = useState<PlannerState | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleClose = () => {
    setPending(null);
    setFileName('');
    setError('');
    onClose();
  };

  const handleFile = async (file?: File) => {
    if (!file) return;
    setFileName(file.name);
    setError('');
    setPending(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      if (!isValidBackup(parsed)) {
        setError("This doesn't look like a valid seating backup file.");
        return;
      }
      setPending(parsed);
    } catch {
      setError('Could not read the file — make sure it is a JSON backup from this app.');
    }
  };

  const commit = () => {
    if (!pending) return;
    replaceState(pending);
    handleClose();
  };

  const seatedCount = pending?.guests.filter((g) => g.tableId).length ?? 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md animate-scale-in overflow-hidden rounded-2xl border border-mist bg-cream/98 shadow-lift backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-mist px-6 py-4">
          <div>
            <h2 className="font-display text-xl font-normal text-charcoal">Restore backup</h2>
            <p className="text-xs text-charcoal/45">
              Loads a previously saved <code className="font-mono">.json</code> backup — replaces all current data.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-md p-1.5 text-charcoal/35 hover:bg-parchment hover:text-charcoal/70"
          >
            <IconClose />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          <input
            ref={fileInput}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <div className="flex items-center gap-3">
            <button className="btn-primary" onClick={() => fileInput.current?.click()}>
              <IconRestore /> Choose backup file
            </button>
            {fileName && <span className="truncate text-sm text-charcoal/60">{fileName}</span>}
          </div>

          {error && (
            <p className="rounded-lg border border-ember/25 bg-ember/8 px-3 py-2.5 text-sm text-ember">
              {error}
            </p>
          )}

          {pending && (
            <div className="rounded-lg border border-mist bg-parchment/50 p-4">
              <p className="font-display text-base font-normal text-charcoal">{pending.title}</p>
              <p className="mt-1 text-xs text-charcoal/55">
                {pending.guests.length} guest{pending.guests.length === 1 ? '' : 's'}
                {seatedCount > 0 && ` · ${seatedCount} seated`}
                {' · '}
                {pending.tables.length} table{pending.tables.length === 1 ? '' : 's'}
              </p>
              <p className="mt-3 rounded-md bg-ember/8 px-2.5 py-1.5 text-[11px] text-ember">
                All current guests and tables will be replaced.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-mist px-6 py-4">
          <button className="btn-ghost" onClick={handleClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={commit} disabled={!pending}>
            Restore
          </button>
        </div>
      </div>
    </div>
  );
}
