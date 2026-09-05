/**
 * Upgraded Export Utilities supporting comprehensive metrics and scope
 */
import { 
  calculateProductivityScore,
  getEmployeeTwoHourStats
} from './statusCalculations';

export const exportToCSV = (data, filename = `Daily_Allotment_Status_${new Date().toISOString().slice(0, 10)}.csv`) => {
  if (!data || !data.length) {
    alert("No records selected or available to export.");
    return;
  }

  const headers = [
    "Employee Name",
    "Employee ID",
    "Role",
    "Department",
    "Date",
    "Allocated",
    "Daily Target",
    "Downloaded",
    "WIP",
    "Completed",
    "Pending",
    "Rework",
    "QC Errors",
    "Productivity Score",
    "Status"
  ];

  const rows = data.map((item) => {
    const productivity = calculateProductivityScore(item);

    return [
      `"${(item.employeeName || "").replace(/"/g, '""')}"`,
      `"${item.employeeId || ""}"`,
      `"${item.role || ""}"`,
      `"${item.department || ""}"`,
      `"${item.date || ""}"`,
      item.allocated ?? 0,
      item.dailyTarget ?? item.allocated,
      item.downloaded ?? 0,
      item.wip ?? 0,
      item.completed ?? 0,
      item.pending ?? 0,
      item.rework ?? 0,
      item.qcErrors ?? 0,
      item.status === 'No Activity' ? 0 : productivity.score,
      `"${item.status || ""}"`
    ];
  });

  const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\r\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToExcel = (data, filename = `Daily_Allotment_Status_${new Date().toISOString().slice(0, 10)}.xls`) => {
  if (!data || !data.length) {
    alert("No records selected or available to export.");
    return;
  }

  const headers = [
    "Employee Name",
    "Employee ID",
    "Role",
    "Department",
    "Date",
    "Allocated",
    "Daily Target",
    "Downloaded",
    "WIP",
    "Completed",
    "Pending",
    "Rework",
    "QC Errors",
    "Productivity Score",
    "Status"
  ];

  const tableRows = data.map((item) => {
    const productivity = calculateProductivityScore(item);

    return `
      <tr>
        <td>${item.employeeName || ""}</td>
        <td>${item.employeeId || ""}</td>
        <td>${item.role || ""}</td>
        <td>${item.department || ""}</td>
        <td>${item.date || ""}</td>
        <td style="text-align:right;">${item.allocated ?? 0}</td>
        <td style="text-align:right;">${item.dailyTarget ?? item.allocated}</td>
        <td style="text-align:right;">${item.downloaded ?? 0}</td>
        <td style="text-align:right;">${item.wip ?? 0}</td>
        <td style="text-align:right;">${item.completed ?? 0}</td>
        <td style="text-align:right;">${item.pending ?? 0}</td>
        <td style="text-align:right;">${item.rework ?? 0}</td>
        <td style="text-align:right;">${item.qcErrors ?? 0}</td>
        <td style="text-align:right;">${item.status === 'No Activity' ? 0 : productivity.score}</td>
        <td>${item.status || ""}</td>
      </tr>
    `;
  }).join("");

  const excelXml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
        <style>
          th { background-color: #f1f5f9; color: #0f172a; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px 12px; }
          td { border: 1px solid #e2e8f0; padding: 6px 10px; font-family: sans-serif; font-size: 12px; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([excelXml], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export Dedicated 2 Hours Report Tracking to Excel
 * Includes both:
 * 1. 2-Hour Production Shift Windows Summary
 * 2. Individual Employee 4-Slot Breakdown Matrix
 */
export const exportTwoHourReportToExcel = ({
  slotData = [],
  employees = [],
  selectedDate = new Date().toISOString().slice(0, 10),
  activeSlot = null
}) => {
  if (!slotData || !slotData.length) {
    alert("No 2-hour report data available to export.");
    return;
  }

  const isToday = !selectedDate || selectedDate === '2026-09-05';
  const filename = `Daily_Allotment_2Hours_Report_${selectedDate}.xls`;

  // 1. Shift Windows Summary Rows
  const summaryHeaders = [
    "Slot",
    "Time Window",
    "Shift Session",
    "Status",
    "Files Completed",
    "QC Approved",
    "Window Target",
    "Achievement %"
  ];

  const summaryRows = slotData.map(slot => {
    const isSlot4 = slot.slot === 'Slot 4' || slot.timeWindow.includes('3.30 PM');
    const comp = (isToday && isSlot4) ? 0 : (slot.completed || 0);
    const qc = (isToday && isSlot4) ? 0 : (slot.qcPassed || 0);
    const target = slot.target || 0;
    const eff = target > 0 ? Math.round((comp / target) * 100) : 0;
    const status = (isToday && isSlot4) 
      ? 'Upcoming (Empty / Future Time)' 
      : slot.isCurrent 
        ? 'In Progress (Live @ 2:18 PM)' 
        : 'Completed';

    return `
      <tr>
        <td style="font-weight:bold;">${slot.slot}</td>
        <td>${slot.timeWindow}</td>
        <td>${slot.session || ""}</td>
        <td style="font-weight:600; color:${(isToday && isSlot4) ? '#64748b' : slot.isCurrent ? '#2563eb' : '#059669'};">${status}</td>
        <td style="text-align:right; font-weight:bold; color:${comp > 0 ? '#1d4ed8' : '#94a3b8'};">${comp}</td>
        <td style="text-align:right; color:${qc > 0 ? '#059669' : '#94a3b8'};">${qc}</td>
        <td style="text-align:right;">${target}</td>
        <td style="text-align:right; font-weight:bold;">${eff}%</td>
      </tr>
    `;
  }).join("");

  // Total Row for Summary
  const totalComp = slotData.reduce((acc, s) => {
    const isSlot4 = s.slot === 'Slot 4' || s.timeWindow.includes('3.30 PM');
    return acc + ((isToday && isSlot4) ? 0 : (s.completed || 0));
  }, 0);
  const totalQc = slotData.reduce((acc, s) => {
    const isSlot4 = s.slot === 'Slot 4' || s.timeWindow.includes('3.30 PM');
    return acc + ((isToday && isSlot4) ? 0 : (s.qcPassed || 0));
  }, 0);
  const totalTarget = slotData.reduce((acc, s) => acc + (s.target || 0), 0);
  const totalEff = totalTarget > 0 ? Math.round((totalComp / totalTarget) * 100) : 0;

  // 2. Individual Employee 4-Slot Breakdown Matrix Rows
  const employeeMatrixHeaders = [
    "Employee ID",
    "Employee Name",
    "Role",
    "Department",
    "Slot 1 (8.30-10.30 AM)",
    "Slot 2 (10.30 AM-12.45 PM)",
    "Slot 3 (12.45-3.30 PM) [Live]",
    "Slot 4 (3.30-5.30 PM) [Upcoming]",
    "Total Completed Today",
    "Daily Target",
    "Shift Status"
  ];

  const employeeMatrixRows = employees.map(emp => {
    const s1 = getEmployeeTwoHourStats(emp, "8.30 AM to 10.30 AM", isToday);
    const s2 = getEmployeeTwoHourStats(emp, "10.30 AM to 12.45 PM", isToday);
    const s3 = getEmployeeTwoHourStats(emp, "12.45 PM to 3.30 PM", isToday);
    const s4 = getEmployeeTwoHourStats(emp, "3.30 PM to 5.30 PM", isToday);

    const s4Count = (isToday ? 0 : s4.slotCompleted);
    const empTotal = s1.slotCompleted + s2.slotCompleted + s3.slotCompleted + s4Count;

    return `
      <tr>
        <td style="font-family:monospace; font-weight:bold;">${emp.employeeId || ""}</td>
        <td style="font-weight:600;">${emp.employeeName || ""}</td>
        <td>${emp.role || ""}</td>
        <td>${emp.department || ""}</td>
        <td style="text-align:right;">${s1.slotCompleted}</td>
        <td style="text-align:right;">${s2.slotCompleted}</td>
        <td style="text-align:right; font-weight:bold; color:#2563eb;">${s3.slotCompleted}</td>
        <td style="text-align:right; color:#94a3b8;">${isToday ? '0 (Upcoming)' : s4.slotCompleted}</td>
        <td style="text-align:right; font-weight:bold; color:#0f172a;">${empTotal}</td>
        <td style="text-align:right;">${emp.dailyTarget || emp.allocated}</td>
        <td style="text-align:center;">${emp.status || "In Progress"}</td>
      </tr>
    `;
  }).join("");

  const excelXml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
        <style>
          body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11px; }
          .report-header { font-size: 16px; font-weight: bold; color: #1e3a8a; padding: 10px 0 4px 0; }
          .meta-info { font-size: 11px; color: #475569; margin-bottom: 15px; }
          .section-heading { font-size: 13px; font-weight: bold; color: #0f172a; margin-top: 15px; margin-bottom: 6px; }
          th { background-color: #2563eb; color: #ffffff; font-weight: bold; border: 1px solid #cbd5e1; padding: 7px 10px; font-size: 11px; }
          th.sub { background-color: #e2e8f0; color: #0f172a; }
          td { border: 1px solid #e2e8f0; padding: 5px 8px; font-size: 11px; }
          .total-row td { font-weight: bold; background-color: #f1f5f9; border-top: 2px solid #64748b; }
        </style>
      </head>
      <body>
        <div class="report-header">DAILY ALLOTMENT - 2 HOURS REPORT TRACKING</div>
        <div class="meta-info">
          <strong>Report Date:</strong> ${selectedDate} &nbsp;|&nbsp;
          <strong>Generated At:</strong> ${new Date().toLocaleTimeString()} &nbsp;|&nbsp;
          <strong>Real-Time Shift Status:</strong> Current Time ~2:18 PM (Slot 3: 12.45 PM - 3.30 PM is Active, Slot 4: 3.30 PM - 5.30 PM is Future/Empty)
        </div>

        <div class="section-heading">1. TWO-HOUR PRODUCTION SHIFT WINDOWS SUMMARY</div>
        <table>
          <thead>
            <tr>
              ${summaryHeaders.map(h => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${summaryRows}
            <tr class="total-row">
              <td colspan="4" style="text-align:right; font-weight:bold;">SHIFT SUMMARY TOTAL:</td>
              <td style="text-align:right; font-weight:bold; color:#1d4ed8;">${totalComp}</td>
              <td style="text-align:right; font-weight:bold; color:#059669;">${totalQc}</td>
              <td style="text-align:right; font-weight:bold;">${totalTarget}</td>
              <td style="text-align:right; font-weight:bold;">${totalEff}%</td>
            </tr>
          </tbody>
        </table>

        <br/>
        <div class="section-heading">2. INDIVIDUAL EMPLOYEE 2-HOUR BREAKDOWN MATRIX (${employees.length} Employees)</div>
        <table>
          <thead>
            <tr>
              ${employeeMatrixHeaders.map(h => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${employeeMatrixRows}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([excelXml], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
