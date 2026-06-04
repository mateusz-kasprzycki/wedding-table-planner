import type { Guest } from '../types';

/** Stable-ish id generator that works without any backend. */
export function makeId(prefix = 'g'): string {
  const rnd =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rnd}`;
}

/**
 * Tokenise a single CSV row, honouring double-quoted fields and "" escapes.
 * Handles commas inside quotes correctly.
 */
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      out.push(field);
      field = '';
    } else {
      field += ch;
    }
  }
  out.push(field);
  return out.map((f) => f.trim());
}

const HEADER_ALIASES: Record<string, keyof Guest> = {
  name: 'name',
  guest: 'name',
  'full name': 'name',
  group: 'groupId',
  'group id': 'groupId',
  family: 'groupId',
  'family id': 'groupId',
  table: 'groupId',
};

export interface ParseResult {
  guests: Guest[];
  skipped: number;
  detectedColumns: string[];
}

/**
 * Parse pasted/CSV text into Guest records.
 *
 * Two modes, auto-detected:
 *  1. Structured: first row contains a recognised header (name/group/...).
 *     Columns are mapped by alias regardless of order.
 *  2. Loose: no header recognised -> every non-empty line becomes a guest name,
 *     with an optional second column treated as group.
 */
export function parseGuestText(raw: string): ParseResult {
  const text = raw.replace(/\r\n?/g, '\n').trim();
  if (!text) return { guests: [], skipped: 0, detectedColumns: [] };

  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  const firstCells = parseCsvLine(lines[0]).map((c) => c.toLowerCase());
  const hasHeader = firstCells.some((c) => c in HEADER_ALIASES);

  const guests: Guest[] = [];
  let skipped = 0;
  let detectedColumns: string[] = [];

  if (hasHeader) {
    const colMap = firstCells.map((c) => HEADER_ALIASES[c] ?? null);
    detectedColumns = firstCells
      .map((c, i) => (colMap[i] ? `${lines[0].split(',')[i]?.trim() || c} → ${colMap[i]}` : ''))
      .filter(Boolean);

    for (let r = 1; r < lines.length; r++) {
      const cells = parseCsvLine(lines[r]);
      const draft: Partial<Guest> = {};
      colMap.forEach((target, i) => {
        if (!target) return;
        (draft as Record<string, string>)[target] = cells[i] ?? '';
      });
      if (!draft.name) {
        skipped++;
        continue;
      }
      guests.push(finaliseGuest(draft));
    }
  } else {
    detectedColumns = ['name (loose mode)'];
    for (const line of lines) {
      const cells = parseCsvLine(line);
      const name = cells[0];
      if (!name) {
        skipped++;
        continue;
      }
      const draft: Partial<Guest> = { name };
      if (cells[1]) draft.groupId = cells[1];
      guests.push(finaliseGuest(draft));
    }
  }

  return { guests, skipped, detectedColumns };
}

function finaliseGuest(draft: Partial<Guest>): Guest {
  return {
    id: makeId(),
    name: (draft.name ?? '').trim(),
    groupId: (draft.groupId ?? '').trim(),
    tableId: null,
    seatIndex: null,
  };
}

/** Read a File (from the File API) as UTF-8 text — fully client-side. */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
