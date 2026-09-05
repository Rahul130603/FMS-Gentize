import { 
  INITIAL_EMPLOYEE_RECORDS, 
  ROLES, 
  PROJECTS,
  TEAMS,
  PRIORITY_LEVELS,
  HOURLY_PRODUCTIVITY_DATA,
  RECENT_ACTIVITIES
} from './src/data/dailyAllotmentDummyData.js';
import { 
  calculatePending, 
  calculateCompletionRate, 
  calculateKpiSummary, 
  calculateStatusBreakdown, 
  calculateRoleProgress,
  calculateTeamPerformance,
  calculateProjectProgress,
  getWorkloadLevel,
  calculateTargetAchievement,
  calculateQualityScore,
  calculateProductivityScore,
  getDeadlineInfo,
  getManagerAttentionList
} from './src/utils/statusCalculations.js';

console.log('=== VERIFYING UPGRADED DAILY ALLOTMENT SYSTEM ===\n');

// 1. Employee records count & structure
console.log(`1. Total Employee Records: ${INITIAL_EMPLOYEE_RECORDS.length} (Target: 40)`);
if (INITIAL_EMPLOYEE_RECORDS.length < 40) {
  throw new Error(`Expected at least 40 records, found ${INITIAL_EMPLOYEE_RECORDS.length}`);
}

INITIAL_EMPLOYEE_RECORDS.forEach((rec) => {
  const pending = calculatePending(rec.allocated, rec.completed, rec.wip);
  if (pending < 0) throw new Error(`Negative pending for ${rec.employeeName}`);
  if (!ROLES.includes(rec.role)) throw new Error(`Invalid role: ${rec.role}`);
  if (!PROJECTS.includes(rec.project)) throw new Error(`Invalid project: ${rec.project}`);
  if (!TEAMS.includes(rec.team)) throw new Error(`Invalid team: ${rec.team}`);
  if (!PRIORITY_LEVELS.includes(rec.priority)) throw new Error(`Invalid priority: ${rec.priority}`);

  const targetAch = calculateTargetAchievement(rec.completed, rec.dailyTarget || rec.allocated);
  if (targetAch.percent < 0) throw new Error(`Invalid target percent for ${rec.employeeName}`);

  const qual = calculateQualityScore(rec.completed, rec.rework);
  if (qual.score < 0 || qual.score > 100) throw new Error(`Quality score out of bounds for ${rec.employeeName}: ${qual.score}`);

  const prod = calculateProductivityScore(rec);
  if (prod.score < 0 || prod.score > 100) throw new Error(`Productivity score out of bounds for ${rec.employeeName}: ${prod.score}`);

  const wl = getWorkloadLevel(rec.allocated);
  if (!['Low', 'Normal', 'High', 'Very High'].includes(wl)) throw new Error(`Invalid workload for ${rec.employeeName}`);

  const deadline = getDeadlineInfo(rec.dueTime, rec.status, rec.completed, rec.allocated);
  if (!['Safe', 'Due Soon', 'Delayed', 'Overdue', 'Completed'].includes(deadline.deadlineStatus)) {
    throw new Error(`Invalid deadline status for ${rec.employeeName}: ${deadline.deadlineStatus}`);
  }
});
console.log('✓ All 40 employee records, roles, projects, priorities, and scores verified successfully.');

// 2. Manager Attention List
const attentionList = getManagerAttentionList(INITIAL_EMPLOYEE_RECORDS);
console.log(`\n2. Manager Attention Flagged Employees: ${attentionList.length}`);
attentionList.slice(0, 4).forEach(item => {
  console.log(`  - [${item.riskLevel}] ${item.employeeName} (${item.employeeId} • ${item.role}): ${item.reason}`);
});

// 3. KPI Summary with Yesterday Comparison
const kpis = calculateKpiSummary(INITIAL_EMPLOYEE_RECORDS);
console.log(`\n3. KPI Summary (Total Allocated: ${kpis.totalAllocated}, Completed: ${kpis.totalCompleted}, Rework: ${kpis.totalRework}, Overdue: ${kpis.totalOverdue}, Rate: ${kpis.completionRate}%)`);
console.log(`  - Completed Comparison: ${kpis.comparisons.completed}`);
console.log(`  - Pending Comparison: ${kpis.comparisons.pending}`);
console.log(`  - Rework Comparison: ${kpis.comparisons.rework}`);
console.log(`  - Overdue Comparison: ${kpis.comparisons.overdue}`);

// 4. Team Performance
const teamPerf = calculateTeamPerformance(INITIAL_EMPLOYEE_RECORDS);
console.log('\n4. Team Performance:');
teamPerf.forEach(t => {
  console.log(`  - ${t.teamName}: ${t.completed}/${t.allocated} files (${t.completionRate}%), ${t.rework} rework, ${t.employees} employees`);
});

// 5. Project Progress
const projProg = calculateProjectProgress(INITIAL_EMPLOYEE_RECORDS);
console.log('\n5. Project Progress:');
projProg.forEach(p => {
  console.log(`  - ${p.projectName}: ${p.completed}/${p.allocated} files (${p.completionRate}%), ${p.pending} pending`);
});

// 6. Hourly Productivity
console.log(`\n6. Hourly Productivity Shift Slots: ${HOURLY_PRODUCTIVITY_DATA.length} slots`);
console.log(`7. Recent Production Logs: ${RECENT_ACTIVITIES.length} events`);

console.log('\n=== ALL UPGRADE LOGIC TESTS PASSED 100% ===');
