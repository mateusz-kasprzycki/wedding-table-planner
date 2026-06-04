import { useMemo, useState } from 'react';
import type { Guest } from '../types';
import GuestCard from './GuestCard';
import { IconSearch } from './icons';

interface GuestListProps {
  guests: Guest[];
  emptyHint?: string;
}

export default function GuestList({ guests, emptyHint }: GuestListProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return guests;
    return guests.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.groupId.toLowerCase().includes(q),
    );
  }, [guests, query]);

  return (
    <div className="flex h-full flex-col">
      <div className="pb-3">
        <div className="relative">
          <IconSearch
            width={15}
            height={15}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-charcoal/35"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or group…"
            className="field pl-8"
          />
        </div>
      </div>

      <div className="scroll-thin flex-1 space-y-2 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-charcoal/45">
            {guests.length === 0 ? emptyHint ?? 'No guests yet.' : 'No matches.'}
          </p>
        ) : (
          filtered.map((g) => <GuestCard key={g.id} guest={g} />)
        )}
      </div>
    </div>
  );
}
