import ProjectService from './project.service';
import ReportService from './report.service';
import { AuthUser } from '../middleware/auth.jwt';

const countBy = <T>(items: T[], key: (t: T) => string) => {
  const map: Record<string, number> = {};
  for (const i of items) {
    const k = key(i) || 'Unknown';
    map[k] = (map[k] || 0) + 1;
  }
  return Object.entries(map).map(([name, value]) => ({ name, value }));
};

export default class AnalyticsService {
  static async charts(user?: AuthUser) {
    const rows = await ProjectService.allForAnalytics(user);

    const monthKey = (d: string) => d.slice(0, 7); // YYYY-MM
    const weekKey = (d: string) => {
      const date = new Date(d);
      const first = new Date(date.getFullYear(), 0, 1);
      const week = Math.ceil(((date.getTime() - first.getTime()) / 86400000 + first.getDay() + 1) / 7);
      return `${date.getFullYear()}-W${week}`;
    };

    const delivered = rows.filter((p) => p.actual_delivery);
    const monthlyDeliveries = countBy(delivered, (p) => monthKey(p.actual_delivery!)).sort((a, b) => a.name.localeCompare(b.name));
    const weeklyDeliveries = countBy(delivered, (p) => weekKey(p.actual_delivery!)).sort((a, b) => a.name.localeCompare(b.name));

    const completionTrend = countBy(rows, (p) => monthKey(p.created_at.toString())).sort((a, b) => a.name.localeCompare(b.name));

    const overdue = rows.filter((p) => p.remaining_days !== null && p.remaining_days! < 0 && !['Completed', 'Cancelled'].includes(p.status));
    const overdueTrend = countBy(overdue, (p) => monthKey(p.due_date || '')).sort((a, b) => a.name.localeCompare(b.name));

    const avgDelayByMonth: Record<string, number[]> = {};
    for (const p of rows) {
      if (!p.due_date) continue;
      const k = monthKey(p.due_date);
      (avgDelayByMonth[k] ||= []).push(p.delay_days);
    }
    const averageDelayTrend = Object.entries(avgDelayByMonth)
      .map(([name, vals]) => ({ name, value: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      projectTypeDistribution: countBy(rows, (p) => p.project_type),
      departmentPerformance: await ReportService.departmentPerformance(user),
      monthlyDeliveries,
      weeklyDeliveries,
      completionTrend,
      healthDistribution: countBy(rows, (p) => p.health.category),
      riskLevelDistribution: countBy(rows, (p) => p.health.risk),
      workflowProgress: countBy(rows, (p) => p.workflow_stage),
      priorityDistribution: countBy(rows, (p) => p.priority),
      overdueTrend,
      missedMilestonesCount: rows.reduce((sum, p) => sum + p.health.missedMilestones.count, 0),
      averageDelayTrend,
      employeePerformance: await ReportService.employeePerformance(user),
      managerPerformance: await ReportService.managerPerformance(user),
    };
  }
}
