const FeedbackModel = require('../models/feedbackModel');

class ExportService {
  // Generate CSV formatted string
  static async generateCsv(filters) {
    const rows = await FeedbackModel.getExportData(filters);
    const headers = [
      'Feedback Number',
      'ISBN',
      'Book Title',
      'Feedback Type',
      'Rating',
      'Customer Name',
      'Company',
      'Comment',
      'Appreciation Message',
      'Critic Message',
      'Critic Category',
      'Submitted Date'
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const val = String(str).replace(/"/g, '""');
      return `"${val}"`;
    };

    const csvLines = [headers.join(',')];
    for (const r of rows) {
      csvLines.push([
        escapeCsv(r.feedback_number),
        escapeCsv(r.isbn),
        escapeCsv(r.title),
        escapeCsv(r.feedback_type),
        r.rating,
        escapeCsv(r.customer_name),
        escapeCsv(r.customer_company),
        escapeCsv(r.comment),
        escapeCsv(r.appreciation_message),
        escapeCsv(r.critic_message),
        escapeCsv(r.critic_category),
        escapeCsv(r.submitted_at)
      ].join(','));
    }

    return csvLines.join('\r\n');
  }

  // Generate Excel-compatible XML (SpreadsheetML) formatted content
  static async generateExcelXml(filters) {
    const rows = await FeedbackModel.getExportData(filters);

    const escapeXml = (str) => {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#1E293B" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Positive">
   <Font ss:Color="#065F46" ss:Bold="1"/>
   <Interior ss:Color="#D1FAE5" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Negative">
   <Font ss:Color="#991B1B" ss:Bold="1"/>
   <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Customer Feedback Report">
  <Table>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Feedback #</Data></Cell>
    <Cell><Data ss:Type="String">ISBN</Data></Cell>
    <Cell><Data ss:Type="String">Book Title</Data></Cell>
    <Cell><Data ss:Type="String">Type</Data></Cell>
    <Cell><Data ss:Type="String">Rating</Data></Cell>
    <Cell><Data ss:Type="String">Customer Name</Data></Cell>
    <Cell><Data ss:Type="String">Customer Company</Data></Cell>
    <Cell><Data ss:Type="String">Comment</Data></Cell>
    <Cell><Data ss:Type="String">Appreciation Message</Data></Cell>
    <Cell><Data ss:Type="String">Critic Message</Data></Cell>
    <Cell><Data ss:Type="String">Critic Category</Data></Cell>
    <Cell><Data ss:Type="String">Submitted Date</Data></Cell>
   </Row>`;

    for (const r of rows) {
      const typeStyle = r.feedback_type === 'POSITIVE' ? 'ss:StyleID="Positive"' : 'ss:StyleID="Negative"';
      xml += `
   <Row>
    <Cell><Data ss:Type="String">${escapeXml(r.feedback_number)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(r.isbn)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(r.title)}</Data></Cell>
    <Cell ${typeStyle}><Data ss:Type="String">${escapeXml(r.feedback_type)}</Data></Cell>
    <Cell><Data ss:Type="Number">${r.rating}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(r.customer_name || 'Anonymous')}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(r.customer_company || '-')}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(r.comment)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(r.appreciation_message || '-')}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(r.critic_message || '-')}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(r.critic_category || '-')}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(r.submitted_at)}</Data></Cell>
   </Row>`;
    }

    xml += `
  </Table>
 </Worksheet>
</Workbook>`;

    return xml;
  }

  // Generate printable/downloadable executive PDF HTML document
  static async generatePdfHtml(filters) {
    const rows = await FeedbackModel.getExportData(filters);
    const summary = await FeedbackModel.getSummary();

    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let tableRows = rows.map(r => `
      <tr class="${r.feedback_type === 'POSITIVE' ? 'positive-row' : 'negative-row'}">
        <td><strong>${r.feedback_number}</strong></td>
        <td><code>${r.isbn}</code></td>
        <td><strong>${r.title}</strong></td>
        <td><span class="badge ${r.feedback_type.toLowerCase()}">${r.feedback_type}</span></td>
        <td class="rating">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)} (${r.rating})</td>
        <td>${r.customer_name || 'Anonymous'}<br/><small class="text-muted">${r.customer_company || ''}</small></td>
        <td>
          <p class="comment-text">${r.comment}</p>
          ${r.appreciation_message ? `<p class="appreciation-text"><strong>Appreciation:</strong> ${r.appreciation_message}</p>` : ''}
          ${r.critic_message ? `<p class="critic-text"><strong>Critic (${r.critic_category || 'General'}):</strong> ${r.critic_message}</p>` : ''}
        </td>
        <td class="nowrap">${r.submitted_at}</td>
      </tr>
    `).join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>FMS Customer Feedback & Critic Official Report</title>
  <style>
    @media print {
      body { margin: 0; padding: 15mm; }
      .no-print { display: none; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; page-break-after: auto; }
      thead { display: table-header-group; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.5;
      margin: 0;
      padding: 30px;
      background: #f8fafc;
    }
    .report-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 30px;
      max-width: 1200px;
      margin: 0 auto;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }
    .header {
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 20px;
      margin-bottom: 25px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      color: #0f172a;
    }
    .header p {
      margin: 5px 0 0 0;
      color: #64748b;
      font-size: 14px;
    }
    .stats-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 25px;
    }
    .stat-box {
      background: #f1f5f9;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #3b82f6;
    }
    .stat-box .val {
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
    }
    .stat-box .lbl {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      margin-top: 15px;
    }
    th {
      background: #0f172a;
      color: #ffffff;
      text-align: left;
      padding: 10px 12px;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge.positive {
      background: #dcfce7;
      color: #15803d;
    }
    .badge.negative {
      background: #fee2e2;
      color: #b91c1c;
    }
    .rating {
      color: #eab308;
      font-weight: bold;
      white-space: nowrap;
    }
    .comment-text {
      margin: 0 0 4px 0;
      font-size: 13px;
    }
    .appreciation-text {
      margin: 0;
      color: #15803d;
      font-size: 12px;
    }
    .critic-text {
      margin: 0;
      color: #b91c1c;
      font-size: 12px;
    }
    .text-muted {
      color: #64748b;
    }
    .nowrap {
      white-space: nowrap;
    }
    .action-btn {
      background: #2563eb;
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="report-card">
    <div class="header">
      <div>
        <h1>File Allocation Management System (FMS)</h1>
        <p>Customer Feedback &amp; Critic Official Quality Intelligence Report</p>
      </div>
      <div style="text-align: right;">
        <p>Generated: <strong>${dateStr}</strong></p>
        <button class="action-btn no-print" onclick="window.print()">Print / Save as PDF</button>
      </div>
    </div>

    <div class="stats-bar">
      <div class="stat-box" style="border-left-color: #3b82f6;">
        <div class="val">${summary.totalFeedback}</div>
        <div class="lbl">Total Feedback Count</div>
      </div>
      <div class="stat-box" style="border-left-color: #10b981;">
        <div class="val">${summary.positiveFeedback}</div>
        <div class="lbl">Positive Feedback</div>
      </div>
      <div class="stat-box" style="border-left-color: #ef4444;">
        <div class="val">${summary.negativeFeedback}</div>
        <div class="lbl">Critic / Negative Feedback</div>
      </div>
      <div class="stat-box" style="border-left-color: #f59e0b;">
        <div class="val">${summary.averageRating} / 5.0</div>
        <div class="lbl">Overall Average Rating</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Feedback #</th>
          <th>ISBN</th>
          <th>Book Title</th>
          <th>Type</th>
          <th>Rating</th>
          <th>Customer</th>
          <th>Feedback &amp; Critic Details</th>
          <th>Submitted Date</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  </div>
</body>
</html>`;
  }
}

module.exports = ExportService;

