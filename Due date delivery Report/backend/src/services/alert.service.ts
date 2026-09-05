import { AppDataSource } from '../ormconfig';
import { Project } from '../entities/Project';
import { Notification } from '../entities/Notification';
import { User } from '../entities/User';
import { computeHealthScore } from '../utils/healthScore';
import { daysRemaining } from '../utils/dateUtils';

/**
 * Periodic sweep that raises in-app notifications for due-date and health-risk
 * conditions that change purely with the passage of time (no explicit user action
 * to hook into). Dedupes by (user, project, type, day) so re-running is idempotent.
 */
export default class AlertService {
  static async scan() {
    const projectRepo = AppDataSource.getRepository(Project);
    const notifRepo = AppDataSource.getRepository(Notification);
    const userRepo = AppDataSource.getRepository(User);

    const admins = await userRepo.find({ where: [{ role: 'Admin' }, { role: 'HR' }] });
    const adminIds = admins.map((a) => a.id);

    const projects = await projectRepo.find({ where: [], relations: ['milestones'] });
    const today = new Date().toISOString().slice(0, 10);

    for (const p of projects) {
      if (['Completed', 'Cancelled'].includes(p.status)) continue;
      const remaining = daysRemaining(p.due_date);
      const health = computeHealthScore(p, p.milestones || []);

      const conditions: { type: string; message: string; recipients: (number | undefined)[] }[] = [];
      if (remaining === 0) conditions.push({ type: 'due_today', message: `${p.book_title} (#${p.project_number}) is due today.`, recipients: [p.assigned_to, p.manager] });
      if (remaining === 1) conditions.push({ type: 'due_tomorrow', message: `${p.book_title} (#${p.project_number}) is due tomorrow.`, recipients: [p.assigned_to, p.manager] });
      if (remaining === 3) conditions.push({ type: 'due_in_3_days', message: `${p.book_title} (#${p.project_number}) is due in 3 days.`, recipients: [p.assigned_to, p.manager] });
      if (remaining !== null && remaining < 0) conditions.push({ type: 'overdue', message: `${p.book_title} (#${p.project_number}) is overdue by ${Math.abs(remaining)} day(s).`, recipients: [p.assigned_to, p.manager, ...adminIds] });
      if (health.score < 60) conditions.push({ type: 'low_health', message: `${p.book_title} (#${p.project_number}) health score dropped below 60 (${health.score}).`, recipients: [p.assigned_to, p.manager, ...adminIds] });
      if (health.missedMilestones.count > 0) conditions.push({ type: 'milestone_missed_alert', message: `${p.book_title} (#${p.project_number}) has ${health.missedMilestones.count} missed milestone(s).`, recipients: [p.assigned_to, p.manager] });

      for (const cond of conditions) {
        const targets = Array.from(new Set(cond.recipients.filter((id): id is number => !!id)));
        for (const userId of targets) {
          // Fetch same-project/type/user notifications and compare the date in JS
          // (date-truncation SQL isn't portable across database engines).
          const sameKind = await notifRepo.find({ where: { user_id: userId, project_id: p.id, type: cond.type } });
          const exists = sameKind.some((n) => new Date(n.created_at).toISOString().slice(0, 10) === today);
          if (!exists) {
            await notifRepo.save(notifRepo.create({ user_id: userId, project_id: p.id, type: cond.type, message: cond.message }));
          }
        }
      }
    }
  }
}
