import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { PlannerState } from '../types';

/** Trigger a client-side download of arbitrary text as a file. */
export function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Export the entire planner state as a JSON backup. */
export function exportJSON(state: PlannerState): void {
  const stamp = new Date().toISOString().slice(0, 10);
  downloadFile(
    `seating-backup-${stamp}.json`,
    JSON.stringify(state, null, 2),
    'application/json',
  );
}

/**
 * Build a printable seating-chart manifest for the venue using jsPDF.
 * One section per table listing seated guests + dietary flags, plus a summary.
 */
export function exportPDF(state: PlannerState): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;

  doc.setFont('times', 'normal');
  doc.setFontSize(22);
  doc.text(state.title, margin, 64);

  doc.setFontSize(10);
  doc.setTextColor(110);
  const printed = new Date().toLocaleString();
  doc.text(`Seating manifest · generated ${printed}`, margin, 84);
  doc.setTextColor(0);

  const seatedCount = state.guests.filter((g) => g.tableId).length;
  doc.setFontSize(11);
  doc.text(
    `Tables: ${state.tables.length}    Guests: ${state.guests.length}    Seated: ${seatedCount}    Unseated: ${
      state.guests.length - seatedCount
    }`,
    margin,
    106,
  );

  let cursorY = 128;

  for (const table of state.tables) {
    const occupants = state.guests.filter((g) => g.tableId === table.id);
    const rows = occupants.map((g) => [g.name]);
    if (rows.length === 0) rows.push(['(empty)']);

    autoTable(doc, {
      startY: cursorY,
      head: [
        [
          {
            content: `${table.name}  ·  ${table.shape}  ·  ${occupants.length}/${table.seats} seats`,
            colSpan: 1,
            styles: { fillColor: [44, 74, 59], textColor: 251, halign: 'left', fontStyle: 'bold' },
          },
        ],
        ['Guest'],
      ],
      body: rows,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [230, 222, 207], textColor: 42 },
      margin: { left: margin, right: margin },
      tableWidth: pageW - margin * 2,
    });
    // @ts-expect-error lastAutoTable is augmented by the plugin at runtime
    cursorY = (doc.lastAutoTable?.finalY ?? cursorY) + 22;
    if (cursorY > doc.internal.pageSize.getHeight() - 120) {
      doc.addPage();
      cursorY = 64;
    }
  }

  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`seating-manifest-${stamp}.pdf`);
}
