import ProjectService from './project.service';
import { AuthUser } from '../middleware/auth.jwt';

type Enriched = Awaited<ReturnType<typeof ProjectService.allForAnalytics>>[number];

const avg = (nums: number[]) => (nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10 : 0);
const isActive = (p: Enriched) => !['Completed', 'Cancelled'].includes(p.status);
const isDeliveredLate = (p: Enriched) => !!p.actual_delivery && !!p.due_date && p.actual_delivery > p.due_date;
const isDeliveredOnTime = (p: Enriched) => !!p.actual_delivery && !!p.due_date && p.actual_delivery <= p.due_date;

export default class ReportService {
  static async dashboard(user?: AuthUser) {
    const rows = await ProjectService.allForAnalytics(user);
    const total = rows.length;
    const completed = rows.filter((p) => p.status === 'Completed').length;
    const inProgress = rows.filter((p) => p.status === 'In Progress').length;
    const dueToday = rows.filter((p) => p.remaining_days === 0 && isActive(p)).length;
    const dueTomorrow = rows.filter((p) => p.remaining_days === 1 && isActive(p)).length;
    const dueThisWeek = rows.filter((p) => p.remaining_days !== null && p.remaining_days! >= 0 && p.remaining_days! <= 7 && isActive(p)).length;
    const dueThisMonth = rows.filter((p) => p.remaining_days !== null && p.remaining_days! >= 0 && p.remaining_days! <= 30 && isActive(p)).length;
    const overdue = rows.filter((p) => p.remaining_days !== null && p.remaining_days! < 0 && isActive(p)).length;
    const critical = rows.filter((p) => p.priority === 'Critical').length;
    const avgCompletion = avg(rows.map((p) => p.completion_percentage));
    const avgDelay = avg(rows.filter((p) => p.delay_days > 0).map((p) => p.delay_days));
    const avgHealth = avg(rows.map((p) => p.health.score));
    const healthy = rows.filter((p) => ['Excellent', 'Healthy'].includes(p.health.category)).length;
    const atRisk = rows.filter((p) => p.health.category === 'At Risk').length;
    const criticalHealth = rows.filter((p) => p.health.category === 'Critical').length;
    const missedMilestoneProjects = rows.filter((p) => p.health.missedMilestones.count > 0).length;

    return {
      totalProjects: total,
      completedProjects: completed,
      inProgress,
      dueToday,
      dueTomorrow,
      dueThisWeek,
      dueThisMonth,
      overdueProjects: overdue,
      criticalProjects: critical,
      avgCompletionPercentage: avgCompletion,
      avgDelayDays: avgDelay,
      avgHealthScore: avgHealth,
      healthyProjects: healthy,
      atRiskProjects: atRisk,
      criticalHealthProjects: criticalHealth,
      missedMilestoneProjects,
    };
  }

  static async alerts(user?: AuthUser) {
    const rows = await ProjectService.allForAnalytics(user);
    const active = rows.filter(isActive);
    return {
      dueToday: active.filter((p) => p.remaining_days === 0),
      dueTomorrow: active.filter((p) => p.remaining_days === 1),
      due3Days: active.filter((p) => p.remaining_days !== null && p.remaining_days! >= 0 && p.remaining_days! <= 3),
      due7Days: active.filter((p) => p.remaining_days !== null && p.remaining_days! >= 0 && p.remaining_days! <= 7),
      dueThisWeek: active.filter((p) => p.remaining_days !== null && p.remaining_days! >= 0 && p.remaining_days! <= 7),
      dueThisMonth: active.filter((p) => p.remaining_days !== null && p.remaining_days! >= 0 && p.remaining_days! <= 30),
      overdue: active.filter((p) => p.remaining_days !== null && p.remaining_days! < 0),
      criticalPriority: active.filter((p) => p.priority === 'Critical'),
      missedMilestones: active.filter((p) => p.health.missedMilestones.count > 0),
      lowHealth: active.filter((p) => p.health.score < 60),
    };
  }

  static async calendar(user?: AuthUser) {
    const rows = await ProjectService.allForAnalytics(user);
    const active = rows.filter(isActive);
    const byDay: Record<string, Enriched[]> = {};
    for (const p of active) {
      if (!p.due_date) continue;
      (byDay[p.due_date] ||= []).push(p);
    }
    return {
      today: active.filter((p) => p.remaining_days === 0),
      tomorrow: active.filter((p) => p.remaining_days === 1),
      next3Days: active.filter((p) => p.remaining_days !== null && p.remaining_days! >= 0 && p.remaining_days! <= 3),
      next7Days: active.filter((p) => p.remaining_days !== null && p.remaining_days! >= 0 && p.remaining_days! <= 7),
      next15Days: active.filter((p) => p.remaining_days !== null && p.remaining_days! >= 0 && p.remaining_days! <= 15),
      next30Days: active.filter((p) => p.remaining_days !== null && p.remaining_days! >= 0 && p.remaining_days! <= 30),
      byDay,
    };
  }

  static async dueToday(user?: AuthUser) {
    const rows = await ProjectService.allForAnalytics(user);
    return rows.filter((p) => p.remaining_days === 0);
  }

  static async dueTomorrow(user?: AuthUser) {
    const rows = await ProjectService.allForAnalytics(user);
    return rows.filter((p) => p.remaining_days === 1);
  }

  static async upcoming(days: number, user?: AuthUser) {
    const rows = await ProjectService.allForAnalytics(user);
    return rows.filter((p) => isActive(p) && p.remaining_days !== null && p.remaining_days! >= 0 && p.remaining_days! <= days);
  }

  /** Splits every project into delivered vs. not-yet-delivered, by ISBN, for a quick "what's shipped" view. */
  static async deliveryStatus(user?: AuthUser) {
    const rows = await ProjectService.allForAnalytics(user);
    const delivered = rows
      .filter((p) => p.status === 'Completed' || p.workflow_stage === 'Delivered' || !!p.actual_delivery)
      .map((p) => ({
        id: p.id,
        isbn: p.isbn,
        book_title: p.book_title,
        project_number: p.project_number,
        due_date: p.due_date,
        actual_delivery: p.actual_delivery,
        onTime: isDeliveredOnTime(p),
      }))
      .sort((a, b) => (b.actual_delivery || '').localeCompare(a.actual_delivery || ''));

    const notDelivered = rows
      .filter((p) => p.status !== 'Completed' && p.workflow_stage !== 'Delivered' && !p.actual_delivery)
      .map((p) => ({
        id: p.id,
        isbn: p.isbn,
        book_title: p.book_title,
        project_number: p.project_number,
        due_date: p.due_date,
        remaining_days: p.remaining_days,
        due_label: p.health.daysRemaining.label,
        due_color: p.health.daysRemaining.color,
      }))
      .sort((a, b) => (a.due_date || '9999-99-99').localeCompare(b.due_date || '9999-99-99'));

    return { delivered, notDelivered };
  }

  static async overdue(user?: AuthUser) {
    const rows = await ProjectService.allForAnalytics(user);
    return rows
      .filter((p) => isActive(p) && p.remaining_days !== null && p.remaining_days! < 0)
      .sort((a, b) => b.delay_days - a.delay_days);
  }

  static async completion(user?: AuthUser) {
    const rows = await ProjectService.allForAnalytics(user);
    const delivered = rows.filter((p) => p.status === 'Completed' || p.actual_delivery);
    const early = delivered.filter((p) => !!p.actual_delivery && !!p.due_date && p.actual_delivery! < p.due_date!);
    const onTime = delivered.filter(isDeliveredOnTime);
    const late = delivered.filter(isDeliveredLate);
    const deliveryDays = delivered
      .filter((p) => p.start_date && p.actual_delivery)
      .map((p) => Math.round((new Date(p.actual_delivery!).getTime() - new Date(p.start_date!).getTime()) / 86400000));
    return {
      completedProjects: delivered.length,
      deliveredBeforeDueDate: early.length,
      deliveredOnTime: onTime.length,
      deliveredLate: late.length,
      averageDeliveryDays: avg(deliveryDays),
      averageDelayDays: avg(delivered.map((p) => p.delay_days)),
      averageCompletionPercentage: avg(rows.map((p) => p.completion_percentage)),
      items: delivered,
    };
  }

  static async employeePerformance(user?: AuthUser) {
    const rows = await ProjectService.allForAnalytics(user);
    const byEmployee = new Map<number, { id: number; name: string; rows: Enriched[] }>();
    for (const p of rows) {
      if (!p.assigned_to) continue;
      const key = p.assigned_to;
      if (!byEmployee.has(key)) byEmployee.set(key, { id: key, name: (p as any).assignedEmployee?.name || `#${key}`, rows: [] });
      byEmployee.get(key)!.rows.push(p);
    }
    return Array.from(byEmployee.values()).map(({ id, name, rows: r }) => {
      const completed = r.filter((p) => p.status === 'Completed').length;
      const pending = r.filter((p) => isActive(p)).length;
      const overdueCount = r.filter((p) => p.remaining_days !== null && p.remaining_days! < 0 && isActive(p)).length;
      return {
        employeeId: id,
        employeeName: name,
        assignedProjects: r.length,
        completedProjects: completed,
        pendingProjects: pending,
        overdueProjects: overdueCount,
        averageCompletionTime: avg(r.filter((p) => p.start_date && p.actual_delivery).map((p) => Math.round((new Date(p.actual_delivery!).getTime() - new Date(p.start_date!).getTime()) / 86400000))),
        averageDelay: avg(r.map((p) => p.delay_days)),
        completionRate: r.length ? Math.round((completed / r.length) * 100) : 0,
        avgHealthScore: avg(r.map((p) => p.health.score)),
      };
    });
  }

  static async managerPerformance(user?: AuthUser) {
    const rows = await ProjectService.allForAnalytics(user);
    const byManager = new Map<number, { id: number; name: string; rows: Enriched[] }>();
    for (const p of rows) {
      if (!p.manager) continue;
      const key = p.manager;
      if (!byManager.has(key)) byManager.set(key, { id: key, name: (p as any).managerUser?.name || `#${key}`, rows: [] });
      byManager.get(key)!.rows.push(p);
    }
    return Array.from(byManager.values()).map(({ id, name, rows: r }) => {
      const completed = r.filter((p) => p.status === 'Completed').length;
      const delayed = r.filter((p) => p.status === 'Delayed').length;
      const overdueCount = r.filter((p) => p.remaining_days !== null && p.remaining_days! < 0 && isActive(p)).length;
      return {
        managerId: id,
        managerName: name,
        projectsManaged: r.length,
        completed,
        pending: r.filter(isActive).length,
        delayed,
        overdue: overdueCount,
        averageTeamPerformance: avg(r.map((p) => p.completion_percentage)),
        averageDeliveryDays: avg(r.filter((p) => p.start_date && p.actual_delivery).map((p) => Math.round((new Date(p.actual_delivery!).getTime() - new Date(p.start_date!).getTime()) / 86400000))),
        averageHealthScore: avg(r.map((p) => p.health.score)),
      };
    });
  }

  static async departmentPerformance(user?: AuthUser) {
    const rows = await ProjectService.allForAnalytics(user);
    const byDept = new Map<string, Enriched[]>();
    for (const p of rows) {
      const key = p.department || 'Unassigned';
      (byDept.get(key) || byDept.set(key, []).get(key)!).push(p);
    }
    return Array.from(byDept.entries()).map(([department, r]) => ({
      department,
      totalProjects: r.length,
      completed: r.filter((p) => p.status === 'Completed').length,
      pending: r.filter(isActive).length,
      overdue: r.filter((p) => p.remaining_days !== null && p.remaining_days! < 0 && isActive(p)).length,
      averageCompletion: avg(r.map((p) => p.completion_percentage)),
      averageDelay: avg(r.map((p) => p.delay_days)),
      averageHealthScore: avg(r.map((p) => p.health.score)),
    }));
  }
}
