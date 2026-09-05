import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

const COLUMNS = [
  { key: 'project_number', header: 'Project Number' },
  { key: 'isbn', header: 'ISBN' },
  { key: 'book_title', header: 'Book Title' },
  { key: 'client_name', header: 'Client' },
  { key: 'project_type', header: 'Project Type' },
  { key: 'department', header: 'Department' },
  { key: 'priority', header: 'Priority' },
  { key: 'status', header: 'Status' },
  { key: 'workflow_stage', header: 'Workflow Stage' },
  { key: 'completion_percentage', header: 'Completion %' },
  { key: 'healthScore', header: 'Health Score' },
  { key: 'riskLevel', header: 'Risk Level' },
  { key: 'remainingDays', header: 'Remaining Days' },
  { key: 'start_date', header: 'Start Date' },
  { key: 'due_date', header: 'Due Date' },
  { key: 'actual_delivery', header: 'Actual Delivery' },
  { key: 'delayDays', header: 'Delay Days' },
];

function flatten(rows: any[]) {
  return rows.map((p) => ({
    ...p,
    healthScore: p.health?.score,
    riskLevel: p.health?.risk,
    remainingDays: p.remaining_days,
    delayDays: p.delay_days,
  }));
}

export default class ExportService {
  static async toCsv(rows: any[], res: Response, filename: string) {
    const flat = flatten(rows);
    const header = COLUMNS.map((c) => c.header).join(',');
    const escape = (v: any) => {
      const s = v === null || v === undefined ? '' : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = flat.map((r) => COLUMNS.map((c) => escape((r as any)[c.key])).join(','));
    const csv = [header, ...lines].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    res.send(csv);
  }

  static async toExcel(rows: any[], res: Response, filename: string) {
    const flat = flatten(rows);
    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet('Delivery Report');
    sheet.columns = COLUMNS.map((c) => ({ header: c.header, key: c.key, width: 18 }));
    sheet.getRow(1).font = { bold: true };
    flat.forEach((r) => sheet.addRow(r));
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
    await wb.xlsx.write(res);
    res.end();
  }

  static toPdf(rows: any[], res: Response, filename: string, title: string) {
    const flat = flatten(rows);
    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    doc.pipe(res);

    doc.fontSize(16).text(title, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(8);

    const cols = ['project_number', 'book_title', 'client_name', 'priority', 'status', 'workflow_stage', 'completion_percentage', 'healthScore', 'riskLevel', 'due_date', 'delayDays'];
    const headers = ['Project #', 'Title', 'Client', 'Priority', 'Status', 'Stage', 'Compl %', 'Health', 'Risk', 'Due Date', 'Delay'];
    const colWidth = 700 / cols.length;

    const drawRow = (values: string[], y: number, bold = false) => {
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica');
      values.forEach((v, i) => doc.text(String(v ?? ''), 30 + i * colWidth, y, { width: colWidth, ellipsis: true }));
    };

    let y = doc.y + 10;
    drawRow(headers, y, true);
    y += 16;
    for (const r of flat) {
      if (y > 550) {
        doc.addPage();
        y = 40;
        drawRow(headers, y, true);
        y += 16;
      }
      drawRow(cols.map((c) => (r as any)[c]), y);
      y += 14;
    }
    doc.end();
  }
}
