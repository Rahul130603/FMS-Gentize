import { AppDataSource } from '../ormconfig';
import { Milestone } from '../entities/Milestone';
import { Project } from '../entities/Project';
import EventService from './event.service';
import NotificationService from './notification.service';
import { AuthUser } from '../middleware/auth.jwt';

export default class MilestoneService {
  static repo() {
    return AppDataSource.getRepository(Milestone);
  }

  static async listForProject(project_id: number) {
    return this.repo().find({ where: { project_id }, order: { expected_date: 'ASC' } });
  }

  static async create(data: Partial<Milestone>) {
    const repo = this.repo();
    const m = repo.create(data as Milestone);
    return repo.save(m);
  }

  static async complete(id: number, actual_completed_date: string, reason: string | undefined, actor?: AuthUser) {
    const repo = this.repo();
    const m = await repo.findOne({ where: { id }, relations: ['project'] });
    if (!m) return null;
    m.actual_completed_date = actual_completed_date;
    if (reason) m.reason = reason;
    const saved = await repo.save(m);

    const projectRepo = AppDataSource.getRepository(Project);
    const project = await projectRepo.findOne({ where: { id: m.project_id } });
    await EventService.logEvent({ project_id: m.project_id, actor: actor?.id, event: `${m.stage} Completed` });

    if (m.expected_date && new Date(actual_completed_date) > new Date(m.expected_date) && project) {
      await NotificationService.notify([project.assigned_to, project.manager], project, 'milestone_missed', `Milestone "${m.stage}" for ${project.book_title} missed its expected date.`);
    }
    return saved;
  }
}
