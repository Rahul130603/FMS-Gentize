/**
 * =============================================================================
 * REWORK ROUND ANALYSIS - BACKEND REST API SERVER
 * =============================================================================
 * Standalone Node.js HTTP Server & REST API Engine
 * Port: 9000
 * Endpoints:
 *   - GET  /api/health            -> Server healthcheck & uptime
 *   - GET  /api/employees         -> List all 24 operator profiles
 *   - GET  /api/dashboard         -> Calculate & return metrics for employee/date/scope
 *   - POST /api/resolve           -> Persist file resolution in data/resolutions.json
 *   - GET  /api/resolutions       -> Retrieve all persistent file resolutions
 *   - POST /api/reset-resolutions -> Reset resolutions back to default
 *   - Static Files                -> Serves index.html and web assets
 * =============================================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 9000;
const PUBLIC_DIR = __dirname;
const DATA_DIR = path.join(__dirname, 'data');
const RESOLUTIONS_FILE = path.join(DATA_DIR, 'resolutions.json');

// Ensure data directory and persistent file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(RESOLUTIONS_FILE)) {
  fs.writeFileSync(RESOLUTIONS_FILE, JSON.stringify({}, null, 2), 'utf8');
}

/**
 * =============================================================================
 * DATA STORAGE HELPERS (PERSISTENT JSON)
 * =============================================================================
 */
function readResolutions() {
  try {
    const raw = fs.readFileSync(RESOLUTIONS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading resolutions file:', err.message);
    return {};
  }
}

function writeResolutions(data) {
  try {
    fs.writeFileSync(RESOLUTIONS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing resolutions file:', err.message);
    return false;
  }
}

/**
 * =============================================================================
 * EMPLOYEE DIRECTORY
 * =============================================================================
 */
const employeeProfiles = [
  { name: "SUDHIN", role: "BOOK SCAN", dept: "Book Scanning", color: "bg-blue-100 text-blue-700", border: "border-blue-200" },
  { name: "RAHUL", role: "QC", dept: "QC", color: "bg-purple-100 text-purple-700", border: "border-purple-200" },
  { name: "ARUN", role: "QAG", dept: "QAG", color: "bg-emerald-100 text-emerald-700", border: "border-emerald-200" },
  { name: "PRIYA", role: "QC", dept: "QC", color: "bg-amber-100 text-amber-700", border: "border-amber-200" },
  { name: "MANOJ", role: "QAG", dept: "QAG", color: "bg-rose-100 text-rose-700", border: "border-rose-200" },
  { name: "RAGU", role: "COVER SCAN", dept: "Cover Scanning", color: "bg-indigo-100 text-indigo-700", border: "border-indigo-200" },
  { name: "DHARSHANA", role: "QC", dept: "QC", color: "bg-pink-100 text-pink-700", border: "border-pink-200" },
  { name: "SANTHOSH VIKRAM", role: "BOOK SCAN", dept: "Book Scanning", color: "bg-teal-100 text-teal-700", border: "border-teal-200" },
  { name: "PRAVEENTHAN", role: "QC", dept: "QC", color: "bg-cyan-100 text-cyan-700", border: "border-cyan-200" },
  { name: "MOHANAPRIYA", role: "QAG", dept: "QAG", color: "bg-orange-100 text-orange-700", border: "border-orange-200" },
  { name: "UDHAI", role: "COVER SCAN", dept: "Cover Scanning", color: "bg-blue-100 text-blue-700", border: "border-blue-200" },
  { name: "LAKSHMI", role: "QC", dept: "QC", color: "bg-purple-100 text-purple-700", border: "border-purple-200" },
  { name: "PRAKASH", role: "BOOK SCAN", dept: "Book Scanning", color: "bg-emerald-100 text-emerald-700", border: "border-emerald-200" },
  { name: "SHEEBA", role: "QC", dept: "QC", color: "bg-amber-100 text-amber-700", border: "border-amber-200" },
  { name: "SANTHOSH M", role: "COVER SCAN", dept: "Cover Scanning", color: "bg-rose-100 text-rose-700", border: "border-rose-200" },
  { name: "KALPANA", role: "QAG", dept: "QAG", color: "bg-indigo-100 text-indigo-700", border: "border-indigo-200" },
  { name: "SARANYA", role: "QC", dept: "QC", color: "bg-pink-100 text-pink-700", border: "border-pink-200" },
  { name: "PRADHAP", role: "BOOK SCAN", dept: "Book Scanning", color: "bg-teal-100 text-teal-700", border: "border-teal-200" },
  { name: "ABDUL", role: "QC", dept: "QC", color: "bg-cyan-100 text-cyan-700", border: "border-cyan-200" },
  { name: "BHAVANI", role: "QAG", dept: "QAG", color: "bg-orange-100 text-orange-700", border: "border-orange-200" },
  { name: "SWETHA", role: "QC", dept: "QC", color: "bg-blue-100 text-blue-700", border: "border-blue-200" },
  { name: "DEENA", role: "COVER SCAN", dept: "Cover Scanning", color: "bg-purple-100 text-purple-700", border: "border-purple-200" },
  { name: "DEVI", role: "QC", dept: "QC", color: "bg-emerald-100 text-emerald-700", border: "border-emerald-200" },
  { name: "JAYASURIYA", role: "BOOK SCAN", dept: "Book Scanning", color: "bg-amber-100 text-amber-700", border: "border-amber-200" }
];

function getEmployeeInfo(name) {
  const found = employeeProfiles.find(e => e.name.toUpperCase() === (name || '').toUpperCase());
  if (found) return found;
  return {
    name: name || "UNKNOWN",
    role: "BOOK SCAN",
    dept: "Scanning",
    color: "bg-slate-100 text-slate-700",
    border: "border-slate-200"
  };
}

function parseDate(dateStr) {
  if (!dateStr) return new Date();
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts[0].length === 4) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }
  }
  return new Date(dateStr);
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getPeriodDisplayInfo(dateStr, period) {
  const dt = parseDate(dateStr);
  const d = dt.getDate();
  const m = dt.getMonth();
  const y = dt.getFullYear();
  const monthName = MONTH_NAMES[m];
  const monthShort = MONTH_SHORT[m];

  if (period === 'month') {
    return {
      pillText: `${monthName} ${y}`,
      longLabel: `Monthly Report - ${monthName} ${y}`,
      filterLabel: 'Month',
      trendTitle: `Weekly Trend (${monthShort} ${y})`,
      comparisonTitle: `Employee Comparison (${monthShort} ${y})`,
      scopeNotice: `Monthly scope for ${monthName} ${y}`
    };
  } else if (period === 'week') {
    const dayOfWeek = dt.getDay();
    const diffToMon = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    const mon = new Date(dt);
    mon.setDate(dt.getDate() + diffToMon);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);

    const monStr = `${String(mon.getDate()).padStart(2, '0')} ${MONTH_SHORT[mon.getMonth()]}`;
    const sunStr = `${String(sun.getDate()).padStart(2, '0')} ${MONTH_SHORT[sun.getMonth()]}`;
    const weekRange = `${monStr} - ${sunStr} ${sun.getFullYear()}`;

    return {
      pillText: `Week (${monStr} - ${sunStr})`,
      longLabel: `Weekly Report (${weekRange})`,
      filterLabel: 'Week',
      trendTitle: `Daily Trend (Week: ${monStr} - ${sunStr})`,
      comparisonTitle: `Employee Comparison (Weekly: ${monStr} - ${sunStr})`,
      scopeNotice: `Weekly scope (${weekRange})`
    };
  } else {
    const dStr = `${String(d).padStart(2, '0')} ${monthShort} ${y}`;
    return {
      pillText: dateStr || dStr,
      longLabel: `Daily Report (${dStr})`,
      filterLabel: 'Date',
      trendTitle: `Daily Trend (Last 7 Days)`,
      comparisonTitle: `Employee Comparison (Today: ${dStr})`,
      scopeNotice: `Daily scope (${dStr})`
    };
  }
}

/**
 * =============================================================================
 * SERVER-SIDE DYNAMIC METRICS CALCULATION ENGINE
 * =============================================================================
 */
function calculateDashboardMetrics(employeeName, dateStr, period = 'day', filters = {}, persistentResolutions = {}) {
  const empName = employeeName || 'SUDHIN';
  const info = getEmployeeInfo(empName);

  // Parse date and extract calendar components
  const dt = parseDate(dateStr);
  const d = dt.getDate();
  const m = dt.getMonth(); // 0 to 11
  const y = dt.getFullYear();
  const dayOfWeek = dt.getDay();

  // Baseline status: original reference is 05-09-2026 (Saturday)
  const isBaseDay = (d === 5 && m === 8 && y === 2026);
  const dayId = Math.floor(dt.getTime() / (24 * 3600 * 1000));

  // Monday of the week for week-level grouping
  const diffToMon = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
  const mon = new Date(dt);
  mon.setDate(dt.getDate() + diffToMon);
  mon.setHours(0, 0, 0, 0);
  const weekId = Math.floor(mon.getTime() / (7 * 24 * 3600 * 1000));
  const isBaseWeek = (mon.getFullYear() === 2026 && mon.getMonth() === 7 && mon.getDate() === 31);

  // Month-level grouping
  const monthId = y * 12 + m;
  const isBaseMonth = (y === 2026 && m === 8);

  // Deterministic seed based on employee name and date
  let seed = 0;
  for (let i = 0; i < empName.length; i++) seed = (seed * 31 + empName.charCodeAt(i)) % 10007;
  for (let i = 0; i < (dateStr || '').length; i++) seed = (seed * 17 + dateStr.charCodeAt(i)) % 10007;

  // Base volume of defects assigned to this employee
  let assignedRework = 0;
  let totalReject = 0;
  let baseRatePct = 0.80;

  if (empName.toUpperCase() === 'SUDHIN') {
    if (period === 'month') {
      if (isBaseMonth) {
        assignedRework = 780; // Baseline month volume (September 2026)
        totalReject = 196;
        baseRatePct = 0.80;
      } else {
        const monthHash = Math.abs((monthId * 2654435761) ^ (monthId >> 16));
        const monthDelta = ((monthHash % 151) - 75);
        assignedRework = Math.max(550, 780 + monthDelta);
        const rejRatio = 0.22 + ((monthHash % 6) * 0.01);
        totalReject = Math.max(120, Math.round(assignedRework * rejRatio));
        const rateDelta = (((monthHash >> 3) % 9) - 4) * 0.01;
        baseRatePct = Math.min(0.90, Math.max(0.72, 0.80 + rateDelta));
      }
    } else if (period === 'week') {
      if (isBaseWeek) {
        assignedRework = 185; // Baseline week volume (Week of 05-09-2026)
        totalReject = 48;
        baseRatePct = 0.80;
      } else {
        const weekHash = Math.abs((weekId * 2654435761) ^ (weekId >> 16));
        const weekDelta = ((weekHash % 49) - 24);
        assignedRework = Math.max(110, 185 + weekDelta);
        const rejRatio = 0.22 + ((weekHash % 7) * 0.01);
        totalReject = Math.max(20, Math.round(assignedRework * rejRatio));
        const rateDelta = (((weekHash >> 3) % 11) - 5) * 0.01;
        baseRatePct = Math.min(0.92, Math.max(0.70, 0.80 + rateDelta));
      }
    } else {
      if (isBaseDay) {
        assignedRework = 30; // 30 rework files baseline on 05-09-2026
        totalReject = 8;
        baseRatePct = 0.80;
      } else {
        const dayHash = Math.abs((dayId * 2654435761) ^ (dayId >> 16));
        const dayDelta = ((dayHash % 25) - 11);
        assignedRework = Math.max(12, 30 + dayDelta);
        const rejRatio = 0.20 + ((dayHash % 7) * 0.012);
        totalReject = Math.max(2, Math.round(assignedRework * rejRatio));
        const rateDelta = (((dayHash >> 3) % 15) - 6) * 0.01;
        baseRatePct = Math.min(0.95, Math.max(0.68, 0.80 + rateDelta));
      }
    }
  } else {
    const empBase = 18 + (seed % 15);
    const empRej = 4 + (seed % 6);
    let eMult = 1;
    if (period === 'month') {
      const mHash = Math.abs((monthId * 2654435761) ^ (monthId >> 16));
      eMult = 26.0 + (((mHash % 9) - 4) * 0.5);
    } else if (period === 'week') {
      const wHash = Math.abs((weekId * 2654435761) ^ (weekId >> 16));
      eMult = 6.16 + (((wHash % 7) - 3) * 0.2);
    } else {
      const dHash = Math.abs((dayId * 2654435761) ^ (dayId >> 16));
      eMult = 1.0 + (((dHash % 7) - 3) * 0.08);
    }
    assignedRework = Math.max(5, Math.round(empBase * eMult));
    totalReject = Math.max(2, Math.round(empRej * eMult));
    baseRatePct = Math.min(0.95, Math.max(0.65, 0.78 + (((seed + dayId) % 15) - 7) * 0.01));
  }

  // Count persisted user corrections for this employee
  const userFixedCount = Object.keys(persistentResolutions).filter(k => k.startsWith(empName + '_')).length;
  
  const baseCorrected = Math.round(assignedRework * baseRatePct);
  let correctedCount = Math.min(assignedRework, baseCorrected + userFixedCount);
  let pendingCount = Math.max(0, assignedRework - correctedCount);
  let recoveryRate = assignedRework > 0 ? ((correctedCount / assignedRework) * 100).toFixed(2) : "100.00";
  let totalDefectLoad = assignedRework + totalReject;

  // Origin stage breakdown of defect issues (Scan / QC / QAG)
  let scanIssues = 0, qcIssues = 0, qagIssues = 0;
  if (info.dept === 'Scanning') {
    scanIssues = Math.max(1, Math.round((assignedRework + totalReject) * 0.65));
    qcIssues = Math.max(1, Math.round((assignedRework + totalReject) * 0.25));
    qagIssues = Math.max(1, (assignedRework + totalReject) - scanIssues - qcIssues);
  } else if (info.dept === 'QC') {
    scanIssues = Math.max(1, Math.round((assignedRework + totalReject) * 0.25));
    qcIssues = Math.max(1, Math.round((assignedRework + totalReject) * 0.60));
    qagIssues = Math.max(1, (assignedRework + totalReject) - scanIssues - qcIssues);
  } else {
    scanIssues = Math.max(1, Math.round((assignedRework + totalReject) * 0.20));
    qcIssues = Math.max(1, Math.round((assignedRework + totalReject) * 0.30));
    qagIssues = Math.max(1, (assignedRework + totalReject) - scanIssues - qcIssues);
  }

  // Total output completed for rate context
  const totalComp = Math.round((assignedRework * 3.8) + (seed % 20));
  const rewPct = totalComp > 0 ? ((assignedRework / totalComp) * 100).toFixed(2) : "7.80";
  const rejPct = totalComp > 0 ? ((totalReject / totalComp) * 100).toFixed(2) : "2.10";

  // Candidate file records pool
  const bookTitles = [
    "Tamil Classical Poetry Vol 1",
    "Modern Indian History (1857-1947)",
    "Advanced Physics & Mechanics",
    "Higher Secondary Mathematics XII",
    "World Geography & Cartography",
    "Organic Chemistry Digest",
    "Botanical Survey & Plant Atlas",
    "Zoological Classification Pt 2",
    "Archaeological Treasures of South India",
    "English Linguistics & Phonetics",
    "Sanskrit Epics Compilation",
    "Economics & Trade Statistics",
    "Environmental Science Digest",
    "Microbiology Laboratory Manual",
    "Indian Constitutional Law",
    "Ancient Tamil Inscriptions",
    "Digital Image Processing Fundamentals",
    "Archival Documentation Standards"
  ];

  const allFiles = [];
  const reviewers = ['RAHUL', 'ARUN', 'PRIYA', 'MANOJ', 'BHAVANI', 'RAGU', 'DHARSHANA'];
  const reworkReasonPool = ['Image Quality', 'Cropping Issue', 'Alignment Issue', 'Missing Content', 'Skewed Pages'];
  const rejectReasonPool = ['Missing Page', 'Wrong Scan', 'Poor Quality', 'Incorrect File'];

  // File ID base & book offset dynamically derived from date & period
  let fileIdBase = 101;
  let bookOffset = 0;
  let timeOffset = 0;

  if (period === 'month') {
    fileIdBase = isBaseMonth ? 101 : 100 + ((monthId * 37) % 750);
    bookOffset = isBaseMonth ? 0 : (monthId % bookTitles.length);
    timeOffset = monthId;
  } else if (period === 'week') {
    fileIdBase = isBaseWeek ? 101 : 100 + ((weekId * 23) % 750);
    bookOffset = isBaseWeek ? 0 : (weekId % bookTitles.length);
    timeOffset = weekId;
  } else {
    fileIdBase = isBaseDay ? 101 : 100 + ((dayId * 19) % 750);
    bookOffset = isBaseDay ? 0 : (dayId % bookTitles.length);
    timeOffset = dayId;
  }

  // Proportional distribution for the 15 candidate files
  const numReject = Math.min(3, Math.max(1, Math.round(15 * (totalReject / (assignedRework + totalReject || 1)))));
  const numCleared = 2;
  const numRework = 15 - numReject - numCleared;
  const numReworkCorrected = Math.min(numRework, Math.max(2, Math.round(numRework * baseRatePct)));

  // Generate 15 candidate files for workbench
  for (let i = 0; i < 15; i++) {
    const fileId = `BK-${String(fileIdBase + i)}`;
    const bookName = bookTitles[(i + bookOffset) % bookTitles.length];
    
    let stg = info.role || 'BOOK SCAN';
    if (i % 4 === 1 && (info.role === 'BOOK SCAN' || info.role === 'All')) stg = 'COVER SCAN';
    else if (i % 5 === 2) stg = 'QC';
    else if (i % 6 === 3) stg = 'QAG';

    let stat = 'REWORK';
    let reason = reworkReasonPool[(i + seed + timeOffset) % reworkReasonPool.length];
    let corrState = 'PENDING';
    let corrPct = 0;

    if (i >= (15 - numReject)) {
      stat = 'REJECT';
      reason = rejectReasonPool[(i + seed + timeOffset) % rejectReasonPool.length];
      corrState = 'REJECTED';
      corrPct = 0;
    } else if (i >= (15 - numReject - numCleared)) {
      stat = 'COMPLETED';
      reason = '-';
      corrState = 'CLEARED';
      corrPct = 100;
    } else {
      stat = 'REWORK';
      if (i < numReworkCorrected) {
        corrState = 'CORRECTED';
        corrPct = 100;
      } else {
        corrState = 'PENDING';
        corrPct = 0;
      }
    }

    // Server persistent override if user marked file as resolved
    if (persistentResolutions && persistentResolutions[`${empName}_${fileId}`]) {
      corrState = 'CORRECTED';
      corrPct = 100;
    }

    const rev = reviewers[(i + seed + timeOffset) % reviewers.length];
    const revStg = stg === 'BOOK SCAN' || stg === 'COVER SCAN' ? 'QC' : (stg === 'QC' ? 'QAG' : 'Admin');
    const hour = 9 + ((i + (timeOffset % 5)) % 8);
    const min = ((i * 19) + ((timeOffset * 7) % 59)) % 60;
    const ampm = (hour < 12) ? 'AM' : 'PM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    const timeStr = `${String(displayHour).padStart(2, '0')}:${String(min).padStart(2, '0')} ${ampm}`;

    allFiles.push({
      file_id: fileId,
      book_name: bookName,
      work_stage: stg,
      completed_time: timeStr,
      checked_by: stat === 'COMPLETED' ? (i % 2 === 0 ? rev : '-') : rev,
      checked_stage: stat === 'COMPLETED' ? (i % 2 === 0 ? revStg : '-') : revStg,
      status: stat,
      reason: reason,
      correction_status: corrState,
      correction_pct: corrPct
    });
  }

  // Filter settings
  const roleFilter = filters.role || 'All';
  const statusFilter = filters.status || 'All';

  // Filter candidate files list
  const filteredFiles = allFiles.filter(f => {
    if (roleFilter !== 'All') {
      if (f.work_stage !== roleFilter) return false;
    }
    if (statusFilter !== 'All') {
      if (statusFilter === 'Completed' && (f.status !== 'COMPLETED' && f.correction_status !== 'CORRECTED')) return false;
      if (statusFilter === 'Rework' && f.status !== 'REWORK') return false;
      if (statusFilter === 'Rejected' && f.status !== 'REJECT') return false;
    }
    return true;
  });

  // Filter impact on KPIs if filtered
  let activeRework = assignedRework;
  let activeReject = totalReject;
  let activeCorrected = correctedCount;
  let activePending = pendingCount;

  if (statusFilter === 'Rework') {
    activeReject = 0;
  } else if (statusFilter === 'Rejected') {
    activeRework = 0;
    activeCorrected = 0;
    activePending = 0;
  } else if (statusFilter === 'Completed') {
    activePending = 0;
    activeReject = 0;
  }

  // Rework reasons breakdown
  let reworkReasons = [];
  if (statusFilter !== 'Rejected' && activeRework > 0) {
    reworkReasons = [
      { reason: 'Image Quality', count: Math.max(1, Math.round(activeRework * 0.38)), percentage: 38.0 },
      { reason: 'Cropping Issue', count: Math.max(1, Math.round(activeRework * 0.26)), percentage: 26.0 },
      { reason: 'Alignment Issue', count: Math.max(1, Math.round(activeRework * 0.18)), percentage: 18.0 },
      { reason: 'Missing Content', count: Math.max(1, Math.round(activeRework * 0.12)), percentage: 12.0 },
      { reason: 'Skewed Pages', count: Math.max(1, Math.round(activeRework * 0.06)), percentage: 6.0 }
    ];
  }

  // Reject reasons breakdown
  let rejectReasons = [];
  if (statusFilter !== 'Rework' && activeReject > 0) {
    rejectReasons = [
      { reason: 'Missing Page', count: Math.max(1, Math.round(activeReject * 0.44)), percentage: 44.0 },
      { reason: 'Wrong Scan', count: Math.max(1, Math.round(activeReject * 0.25)), percentage: 25.0 },
      { reason: 'Poor Quality', count: Math.max(1, Math.round(activeReject * 0.19)), percentage: 19.0 },
      { reason: 'Incorrect File', count: Math.max(1, Math.round(activeReject * 0.12)), percentage: 12.0 }
    ];
  }

  // Reviewers breakdown
  const potentialReviewers = [
    { name: 'RAHUL', stage: 'QC', shareRew: 0.32, shareRej: 0.32 },
    { name: 'ARUN', stage: 'QAG', shareRew: 0.22, shareRej: 0.24 },
    { name: 'PRIYA', stage: 'QC', shareRew: 0.16, shareRej: 0.16 },
    { name: 'MANOJ', stage: 'QAG', shareRew: 0.12, shareRej: 0.12 },
    { name: 'BHAVANI', stage: 'QC', shareRew: 0.08, shareRej: 0.07 },
    { name: 'RAGU', stage: 'QAG', shareRew: 0.06, shareRej: 0.05 },
    { name: 'DHARSHANA', stage: 'QC', shareRew: 0.04, shareRej: 0.04 }
  ];

  const reviewerList = potentialReviewers.map(r => {
    const empInf = getEmployeeInfo(r.name);
    return {
      reviewer: r.name,
      stage: r.stage,
      role: empInf.role,
      rework: Math.max(0, Math.round(activeRework * r.shareRew)),
      reject: Math.max(0, Math.round(activeReject * r.shareRej))
    };
  });

  // Dynamic Trend data based on period and selected date
  let trendDays = [];
  if (period === 'month') {
    const mShort = MONTH_SHORT[m];
    trendDays = [
      { date: `${mShort} W1`, rework: Math.round(activeRework * 0.23), reject: Math.round(activeReject * 0.22), completed: Math.round(activeCorrected * 0.22), rework_rate: (parseFloat(rewPct) * 1.05).toFixed(2) },
      { date: `${mShort} W2`, rework: Math.round(activeRework * 0.26), reject: Math.round(activeReject * 0.25), completed: Math.round(activeCorrected * 0.25), rework_rate: (parseFloat(rewPct) * 1.02).toFixed(2) },
      { date: `${mShort} W3`, rework: Math.round(activeRework * 0.24), reject: Math.round(activeReject * 0.26), completed: Math.round(activeCorrected * 0.26), rework_rate: (parseFloat(rewPct) * 0.95).toFixed(2) },
      { date: `${mShort} W4`, rework: Math.round(activeRework * 0.27), reject: Math.round(activeReject * 0.27), completed: Math.round(activeCorrected * 0.27), rework_rate: (parseFloat(rewPct) * 0.98).toFixed(2) }
    ];
  } else if (period === 'week') {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    trendDays = dayNames.map((dName, idx) => {
      const wDay = new Date(mon);
      wDay.setDate(mon.getDate() + idx);
      const dNum = String(wDay.getDate()).padStart(2, '0');
      const mNum = String(wDay.getMonth() + 1).padStart(2, '0');
      return {
        date: `${dName} (${dNum}/${mNum})`,
        rework: Math.max(0, Math.round((activeRework / 7) + (((idx + weekId) % 5) - 2))),
        reject: Math.max(0, Math.round((activeReject / 7) + (((idx + weekId) % 3) - 1))),
        completed: Math.max(1, Math.round((activeCorrected / 7) + (((idx + weekId) % 4) - 1.5))),
        rework_rate: (parseFloat(rewPct) + (((idx + weekId) % 3 - 1) * 0.4)).toFixed(2)
      };
    });
  } else {
    trendDays = [];
    for (let offset = -6; offset <= 0; offset++) {
      const pDay = new Date(dt);
      pDay.setDate(dt.getDate() + offset);
      const pDayNum = String(pDay.getDate()).padStart(2, '0');
      const pMonStr = MONTH_SHORT[pDay.getMonth()];
      const idx = offset + 6;
      trendDays.push({
        date: `${pDayNum} ${pMonStr}`,
        rework: Math.max(0, Math.round(activeRework * (0.65 + (idx * 0.06) + (((dayId + idx) % 5) * 0.02)))),
        reject: Math.max(0, Math.round(activeReject * (0.55 + (idx * 0.08) + (((dayId + idx) % 3) * 0.03)))),
        completed: Math.max(1, Math.round(activeCorrected * (0.70 + (idx * 0.05) + (((dayId + idx) % 4) * 0.02)))),
        rework_rate: (parseFloat(rewPct) + (((idx + dayId) % 2 === 0 ? -0.3 : 0.4))).toFixed(2)
      });
    }
  }

  // Dynamic Comparison table with employee rework load & clearance
  let compEmployees = ['SUDHIN', 'RAHUL', 'ARUN', 'PRIYA', 'MANOJ', 'BHAVANI', 'RAGU', 'DHARSHANA'];
  if (roleFilter !== 'All') {
    const matchingEmps = employeeProfiles.filter(e => e.role === roleFilter).map(e => e.name);
    if (matchingEmps.length > 0) {
      compEmployees = matchingEmps.slice(0, 8);
      if (info.role === roleFilter && !compEmployees.includes(empName.toUpperCase())) {
        compEmployees.unshift(empName.toUpperCase());
      }
    }
  }
  const periodSeed = period === 'month' ? monthId : (period === 'week' ? weekId : dayId);
  const compList = compEmployees.map((name, idx) => {
    const empInfo = getEmployeeInfo(name);
    const isCurrent = name.toUpperCase() === empName.toUpperCase();
    if (isCurrent) {
      return {
        employee: name,
        role: empInfo.role,
        rework: activeRework,
        corrected: activeCorrected,
        pending: activePending,
        clearance_rate: `${recoveryRate}%`,
        reject: activeReject
      };
    }
    const empSeed = (seed + idx * 77 + periodSeed) % 50;
    const eRew = Math.round(activeRework * (0.8 + (empSeed * 0.008)));
    const eCorr = Math.round(eRew * (0.75 + (idx * 0.03)));
    const ePend = Math.max(0, eRew - eCorr);
    const eRej = Math.round(activeReject * (0.7 + (idx * 0.1)));
    return {
      employee: name,
      role: empInfo.role,
      rework: eRew,
      corrected: eCorr,
      pending: ePend,
      clearance_rate: `${((eCorr / eRew) * 100).toFixed(1)}%`,
      reject: eRej
    };
  });

  // Filter summary description
  let filterDesc = [];
  if (roleFilter !== 'All') filterDesc.push(`Role: ${roleFilter}`);
  if (statusFilter !== 'All') filterDesc.push(`Status: ${statusFilter}`);
  const filterSuffix = filterDesc.length > 0 ? ` [${filterDesc.join(' • ')}]` : '';

  const displayInfo = getPeriodDisplayInfo(dateStr, period);

  return {
    period: period,
    displayInfo: displayInfo,
    periodLabel: displayInfo.longLabel + filterSuffix,
    employee: empName,
    date: dateStr,
    filters: filters,
    kpis: {
      total_completed: totalComp,
      rework: activeRework,
      reject: activeReject,
      total_defects: activeRework + activeReject,
      corrected_count: activeCorrected,
      pending_count: activePending,
      recovery_rate: recoveryRate,
      scan_issues: scanIssues,
      qc_issues: qcIssues,
      qag_issues: qagIssues,
      rework_rate: `${rewPct}%`,
      reject_rate: `${rejPct}%`,
      rework_events: Math.round(activeRework * 1.2),
      reject_events: Math.round(activeReject * 1.1)
    },
    distribution: {
      total: activeRework + activeReject,
      corrected: activeCorrected,
      pending: activePending,
      reject: activeReject,
      recovery_rate: recoveryRate,
      pending_pct: activeRework > 0 ? ((activePending / activeRework) * 100).toFixed(1) : "0.0"
    },
    stage_wise: {
      scan: { rework: scanIssues, corrected: Math.round(scanIssues * 0.82), reject: Math.round(activeReject * 0.45) },
      qc: { rework: qcIssues, corrected: Math.round(qcIssues * 0.78), reject: Math.round(activeReject * 0.35) },
      qag: { rework: qagIssues, corrected: Math.round(qagIssues * 0.74), reject: Math.round(activeReject * 0.20) }
    },
    daily_trend: trendDays,
    files: filteredFiles,
    rework_reasons: reworkReasons,
    reject_reasons: rejectReasons,
    reviewers: reviewerList,
    comparison: compList
  };
}

/**
 * =============================================================================
 * HTTP REQUEST HANDLER & ROUTER
 * =============================================================================
 */
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        resolve(parsed);
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // API Route: Healthcheck
  if (pathname === '/api/health') {
    sendJSON(res, 200, {
      status: 'ok',
      service: 'Rework Round Analysis Backend API',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
    return;
  }

  // API Route: Get Employee List
  if (pathname === '/api/employees') {
    sendJSON(res, 200, employeeProfiles);
    return;
  }

  // API Route: Get Dashboard Data
  if (pathname === '/api/dashboard') {
    const q = parsedUrl.query;
    const employee = q.employee || 'SUDHIN';
    const date = q.date || '05-09-2026';
    const period = q.period || 'day';
    const filters = {
      role: q.role || 'All',
      status: q.status || 'All'
    };

    const persistentResolutions = readResolutions();
    const metrics = calculateDashboardMetrics(employee, date, period, filters, persistentResolutions);
    sendJSON(res, 200, metrics);
    return;
  }

  // API Route: Save File Resolution
  if (pathname === '/api/resolve' && method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { employee, fileId } = body;
      if (!employee || !fileId) {
        sendJSON(res, 400, { error: 'Missing employee or fileId' });
        return;
      }

      const key = `${employee}_${fileId}`;
      const resolutions = readResolutions();
      resolutions[key] = {
        employee,
        fileId,
        resolvedAt: new Date().toISOString(),
        status: 'CORRECTED',
        correction_pct: 100
      };

      writeResolutions(resolutions);
      sendJSON(res, 200, {
        success: true,
        message: `File ${fileId} marked as Corrected for ${employee}`,
        key: key,
        totalResolved: Object.keys(resolutions).length
      });
    } catch (err) {
      sendJSON(res, 400, { error: 'Invalid JSON body: ' + err.message });
    }
    return;
  }

  // API Route: Get All Resolutions
  if (pathname === '/api/resolutions' && method === 'GET') {
    const resolutions = readResolutions();
    sendJSON(res, 200, resolutions);
    return;
  }

  // API Route: Reset Resolutions
  if (pathname === '/api/reset-resolutions' && method === 'POST') {
    writeResolutions({});
    sendJSON(res, 200, { success: true, message: 'All file resolutions reset to baseline default' });
    return;
  }

  // Static File Serving (Default to index.html)
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  
  // Security check: prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for single-page app behavior
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File Not Found');
      } else {
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        });
        res.end(content, 'utf-8');
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`=============================================================`);
  console.log(` REWORK ROUND ANALYSIS - BACKEND API SERVER RUNNING`);
  console.log(` Local URL : http://localhost:${PORT}/`);
  console.log(` API Route : http://localhost:${PORT}/api/dashboard`);
  console.log(` Storage   : ${RESOLUTIONS_FILE}`);
  console.log(`=============================================================`);
});
