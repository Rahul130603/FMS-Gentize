import { AppDataSource } from '../ormconfig';
import { Notification } from '../entities/Notification';
import { Project } from '../entities/Project';

export default class NotificationService {
  static repo() {
    return AppDataSource.getRepository(Notification);
  }

  static async notify(userIds: (number | undefined)[], project: Project | null, type: string, message: string) {
    const repo = this.repo();
    const targets = Array.from(new Set(userIds.filter((id): id is number => !!id)));
    if (targets.length === 0) return [];
    const rows = targets.map((user_id) => repo.create({ user_id, project_id: project?.id, type, message }));
    return repo.save(rows);
  }

  static async listForUser(userId: number, onlyUnacknowledged = false) {
    const repo = this.repo();
    const qb = repo.createQueryBuilder('n').where('n.user_id = :userId', { userId });
    if (onlyUnacknowledged) qb.andWhere('n.acknowledged = false');
    qb.orderBy('n.created_at', 'DESC').take(100);
    return qb.getMany();
  }

  static async acknowledge(id: number, userId: number) {
    const repo = this.repo();
    const n = await repo.findOne({ where: { id } });
    if (!n || n.user_id !== userId) return null;
    n.acknowledged = true;
    return repo.save(n);
  }
}
