import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Generic "table of rows" PDF export used by Reports, Vehicle Registry,
// Driver Management, and Trip Management pages.
//
// columns: [{ header: 'Reg No', key: 'registrationNumber' }, ...]
// rows: array of plain objects
export const exportTableToPDF = ({ title, columns, rows, filename }) => {
  const doc = new jsPDF({ orientation: columns.length > 6 ? 'landscape' : 'portrait' });

  doc.setFontSize(14);
  doc.setTextColor(20, 24, 25);
  doc.text(title, 14, 16);

  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated ${new Date().toLocaleString()} · AssetFlow`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [columns.map((c) => c.header)],
    body: rows.map((row) => columns.map((c) => (c.format ? c.format(row) : row[c.key] ?? '—'))),
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [62, 207, 142], textColor: [10, 20, 15] },
    alternateRowStyles: { fillColor: [245, 247, 246] },
  });

  doc.save(filename || `assetflow-export-${new Date().toISOString().slice(0, 10)}.pdf`);
};
