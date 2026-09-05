const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { Readable } = require('stream');

/**
 * Builds an .xlsx buffer from column definitions + row objects.
 * columns: [{ header, key, width }]
 */
async function buildExcelBuffer({ title, columns, rows }) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'FMS Technical Query Module';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(title.slice(0, 31) || 'Report');
  sheet.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width || 22 }));
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  rows.forEach((row) => sheet.addRow(row));
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };

  return workbook.xlsx.writeBuffer();
}

/** Builds a CSV string (RFC4180-safe escaping) from column defs + rows. */
function buildCsv({ columns, rows }) {
  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  };
  const header = columns.map((c) => escape(c.header)).join(',');
  const lines = rows.map((row) => columns.map((c) => escape(row[c.key])).join(','));
  return [header, ...lines].join('\n');
}

/** Builds a simple, professional tabular PDF report as a Buffer. */
function buildPdfBuffer({ title, subtitle, columns, rows }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 36, size: 'A4', layout: columns.length > 6 ? 'landscape' : 'portrait' });
      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(16).fillColor('#1E3A8A').text(title, { align: 'left' });
      if (subtitle) doc.fontSize(9).fillColor('#555').text(subtitle);
      doc.moveDown(0.5);
      doc.strokeColor('#1E3A8A').lineWidth(1).moveTo(doc.x, doc.y).lineTo(doc.page.width - 36, doc.y).stroke();
      doc.moveDown(0.5);

      const usableWidth = doc.page.width - 72;
      const colWidth = usableWidth / columns.length;
      const rowHeight = 18;

      const drawHeader = () => {
        doc.fontSize(8).fillColor('#fff');
        const y = doc.y;
        doc.rect(36, y, usableWidth, rowHeight).fill('#1E3A8A');
        doc.fillColor('#fff');
        columns.forEach((col, i) => {
          doc.text(col.header, 36 + i * colWidth + 4, y + 5, { width: colWidth - 8, ellipsis: true });
        });
        doc.moveDown(1.4);
        doc.fillColor('#000');
      };

      drawHeader();

      rows.forEach((row, idx) => {
        if (doc.y + rowHeight > doc.page.height - 40) {
          doc.addPage();
          drawHeader();
        }
        const y = doc.y;
        if (idx % 2 === 0) doc.rect(36, y, usableWidth, rowHeight).fill('#F3F4F6').fillColor('#000');
        doc.fontSize(8).fillColor('#111');
        columns.forEach((col, i) => {
          const val = row[col.key] === null || row[col.key] === undefined ? '' : String(row[col.key]);
          doc.text(val, 36 + i * colWidth + 4, y + 5, { width: colWidth - 8, ellipsis: true });
        });
        doc.moveDown(1.2);
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function bufferToStream(buffer) {
  return Readable.from(buffer);
}

module.exports = { buildExcelBuffer, buildCsv, buildPdfBuffer, bufferToStream };
