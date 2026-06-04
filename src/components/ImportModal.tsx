import { useMemo, useRef, useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { parseGuestText, readFileAsText, type ParseResult } from '../utils/csv';
import { IconClose, IconUpload } from './icons';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
}

const SAMPLE = `Name,Group
Alice Smith,Bride
James Smith,Groom
Emma Johnson,Bride Family
Oliver Johnson,Bride Family
Sophie Brown,University
Harry Brown,University`;

export default function ImportModal({ open, onClose }: ImportModalProps) {
  const { addGuests } = usePlanner();
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  const preview: ParseResult = useMemo(() => parseGuestText(text), [text]);

  if (!open) return null;

  const handleFile = async (file?: File) => {
    if (!file) return;
    setFileName(file.name);
    const content = await readFileAsText(file);
    setText(content);
  };

  const commit = () => {
    if (preview.guests.length === 0) return;
    addGuests(preview.guests);
    setText('');
    setFileName('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-2xl animate-scale-in flex-col overflow-hidden rounded-2xl border border-mist bg-cream/98 shadow-lift backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-mist px-6 py-4">
          <div>
            <h2 className="font-display text-xl font-normal text-charcoal">Import guests</h2>
            <p className="text-xs text-charcoal/45">
              Parsed in your browser — nothing is uploaded anywhere.
            </p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-charcoal/35 hover:bg-parchment hover:text-charcoal/70">
            <IconClose />
          </button>
        </div>

        <div className="scroll-thin flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInput}
              type="file"
              accept=".csv,.txt,text/csv,text/plain"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <button className="btn-primary" onClick={() => fileInput.current?.click()}>
              <IconUpload /> Choose CSV file
            </button>
            {fileName && <span className="text-sm text-charcoal/60">{fileName}</span>}
            <button
              className="btn-ghost ml-auto"
              onClick={() => setText(SAMPLE)}
              type="button"
            >
              Load sample
            </button>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-charcoal/55">
              …or paste rows
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={7}
              placeholder={'Name,Group\nAlice Smith,Bride\n…or just one name per line'}
              className="field scroll-thin resize-y font-mono text-xs leading-relaxed"
            />
            <p className="mt-1 text-[11px] text-charcoal/45">
              Recognised columns: <b>Name</b>, Group / Family. Order doesn't matter. No header? Each line is treated as a guest name.
            </p>
          </div>

          {text.trim() && (
            <div className="rounded-lg border border-mist bg-parchment/50 p-3">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-pine">
                  Preview · {preview.guests.length} guest
                  {preview.guests.length === 1 ? '' : 's'}
                  {preview.skipped > 0 && (
                    <span className="text-ember"> · {preview.skipped} skipped</span>
                  )}
                </span>
                <span className="text-charcoal/45">{preview.detectedColumns.join('  ·  ')}</span>
              </div>
              <div className="scroll-thin max-h-40 space-y-1 overflow-y-auto">
                {preview.guests.slice(0, 50).map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center gap-2 rounded bg-cream px-2 py-1 text-xs"
                  >
                    <span className="flex-1 font-semibold text-charcoal">{g.name}</span>
                    {g.groupId && <span className="text-charcoal/40">·{g.groupId}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-mist px-6 py-4">
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={commit} disabled={preview.guests.length === 0}>
            Import {preview.guests.length || ''} guest{preview.guests.length === 1 ? '' : 's'}
          </button>
        </div>
      </div>
    </div>
  );
}
