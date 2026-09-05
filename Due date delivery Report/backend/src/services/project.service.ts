import { AppDataSource } from '../ormconfig';
import { Project } from '../entities/Project';
import { Milestone } from '../entities/Milestone';
import EventService from './event.service';
import NotificationService from './notification.service';
import { computeHealthScore } from '../utils/healthScore';
import { generateRecommendations } from '../utils/recommendation';
import { delayDays, daysRemaining } from '../utils/dateUtils';
import { AuthUser } from '../middleware/auth.jwt';

export interface ProjectFilters {
  q?: string;
  status?: string;
  priority?: string;
  project_type?: string;
  workflow_stage?: string;
  department?: string;
  assigned_to?: string;
  manager?: string;
  risk?: string;
  health_category?: string;
  due_from?: string;
  due_to?: string;
  min_completion?: string;
  max_completion?: string;
  remaining_days?: string; // 'today' | 'tomorrow' | '3' | '7' | '15' | '30' | 'overdue'
  sort_by?: string;
  sort_dir?: 'ASC' | 'DESC';
}

/** Restricts a query builder to what the given user's role is allowed to see. */
function scopeToUser(qb: any, user?: AuthUser) {
  if (!user) return qb;
  if (user.role === 'Employee') qb.andWhere('p.assigned_to = :uid', { uid: user.id });
  else if (user.role === 'Manager') qb.andWhere('p.manager = :uid', { uid: user.id });
  // Admin & HR see everything
  return qb;
}

export default class ProjectService {
  static repo() {
    return AppDataSource.getRepository(Project);
  }

  static async createProject(data: Partial<Project>, actor?: AuthUser) {
    const repo = this.repo();
    const project = repo.create({ ...data, status: data.status || 'Assigned' } as Project);
    const saved = await repo.save(project);

    await EventService.logEvent({ project_id: saved.id, actor: actor?.id, event: 'Project Created', new_status: saved.status });

    if (data.assigned_to || data.manager) {
      await NotificationService.notify([data.assigned_to, data.manager], saved, 'project_assigned', `New project assigned: ${saved.book_title} (#${saved.project_number})`);
    }
    return saved;
  }

  static async getById(id: number) {
    const repo = this.repo();
    return repo.findOne({ where: { id }, relations: ['milestones', 'assignedEmployee', 'managerUser'] });
  }

  static canAccess(project: Project, user?: AuthUser) {
    if (!user) return false;
    if (user.role === 'Admin' || user.role === 'HR') return true;
    if (user.role === 'Manager') return project.manager === user.id;
    if (user.role === 'Employee') return project.assigned_to === user.id;
    return false;
  }

  static canEdit(user?: AuthUser) {
    return !!user && (user.role === 'Admin' || user.role === 'Manager');
  }

  static async updateProject(id: number, data: Partial<Project>, actor?: AuthUser) {
    const repo = this.repo();
    const project = await repo.findOne({ where: { id } });
    if (!project) return null;

    const oldStatus = project.status;
    const oldStage = project.workflow_stage;
    Object.assign(project, data);
    const saved = await repo.save(project);

    if (data.status && data.status !== oldStatus) {
      await EventService.logEvent({ project_id: saved.id, actor: actor?.id, event: 'Status Changed', old_status: oldStatus, new_status: saved.status });
      if (saved.status === 'Completed') {
        await NotificationService.notify([saved.assigned_to, saved.manager], saved, 'project_completed', `Project completed: ${saved.book_title} (#${saved.project_number})`);
      }
    }
    if (data.workflow_stage && data.workflow_stage !== oldStage) {
      await EventService.logEvent({ project_id: saved.id, actor: actor?.id, event: `${data.workflow_stage} Started`, old_status: oldStage, new_status: saved.workflow_stage });
    }
    return saved;
  }

  static async list(filters: ProjectFilters = {}, page = 1, limit = 20, user?: AuthUser) {
    const repo = this.repo();
    const qb = repo.createQueryBuilder('p');
    scopeToUser(qb, user);

    if (filters.q) {
      // LIKE (not ILIKE) for cross-database portability; SQLite's LIKE is already case-insensitive for ASCII.
      qb.andWhere('(p.book_title LIKE :q OR p.project_number LIKE :q OR p.isbn LIKE :q OR p.client_name LIKE :q OR p.remarks LIKE :q OR p.department LIKE :q)', { q: `%${filters.q}%` });
    }
    if (filters.status) qb.andWhere('p.status = :status', { status: filters.status });
    if (filters.priority) qb.andWhere('p.priority = :priority', { priority: filters.priority });
    if (filters.project_type) qb.andWhere('p.project_type = :project_type', { project_type: filters.project_type });
    if (filters.workflow_stage) qb.andWhere('p.workflow_stage = :workflow_stage', { workflow_stage: filters.workflow_stage });
    if (filters.department) qb.andWhere('p.department = :department', { department: filters.department });
    if (filters.assigned_to) qb.andWhere('p.assigned_to = :assigned', { assigned: filters.assigned_to });
    if (filters.manager) qb.andWhere('p.manager = :manager', { manager: filters.manager });
    if (filters.due_from) qb.andWhere('p.due_date >= :due_from', { due_from: filters.due_from });
    if (filters.due_to) qb.andWhere('p.due_date <= :due_to', { due_to: filters.due_to });
    if (filters.min_completion) qb.andWhere('p.completion_percentage >= :minc', { minc: filters.min_completion });
    if (filters.max_completion) qb.andWhere('p.completion_percentage <= :maxc', { maxc: filters.max_completion });

    if (filters.remaining_days) {
      const today = new Date().toISOString().slice(0, 10);
      const addDays = (n: number) => {
        const d = new Date();
        d.setDate(d.getDate() + n);
        return d.toISOString().slice(0, 10);
      };
      switch (filters.remaining_days) {
        case 'overdue':
          qb.andWhere('p.due_date < :today', { today });
          break;
        case 'today':
          qb.andWhere('p.due_date = :today', { today });
          break;
        case 'tomorrow':
          qb.andWhere('p.due_date = :tmr', { tmr: addDays(1) });
          break;
        default: {
          const n = parseInt(filters.remaining_days, 10);
          if (!isNaN(n)) qb.andWhere('p.due_date BETWEEN :today AND :future', { today, future: addDays(n) });
        }
      }
    }

    const sortable = ['due_date', 'completion_percentage', 'priority', 'created_at', 'updated_at', 'book_title'];
    const sortBy = sortable.includes(filters.sort_by || '') ? filters.sort_by! : 'due_date';
    qb.orderBy(`p.${sortBy}`, filters.sort_dir === 'DESC' ? 'DESC' : 'ASC');
    qb.skip((page - 1) * limit).take(limit);
    qb.leftJoinAndSelect('p.milestones', 'm');
    qb.leftJoinAndSelect('p.assignedEmployee', 'emp');
    qb.leftJoinAndSelect('p.managerUser', 'mgr');

    const [rawItems, total] = await qb.getManyAndCount();

    // health_category / risk are computed, not stored — filter after enrichment if requested
    let items = rawItems.map((p) => this.enrich(p));
    if (filters.health_category) items = items.filter((i) => i.health.category === filters.health_category);
    if (filters.risk) items = items.filter((i) => i.health.risk === filters.risk);

    return { items, total: filters.health_category || filters.risk ? items.length : total, page, limit };
  }

  /** Attach computed health score, risk, delay days, and recommendations to a project row. */
  static enrich(p: Project & { milestones?: Milestone[] }) {
    const health = computeHealthScore(p, p.milestones || []);
    const recommendations = generateRecommendations(p, health);
    return {
      ...p,
      health,
      recommendations,
      delay_days: delayDays(p.due_date, p.actual_delivery),
      remaining_days: daysRemaining(p.due_date),
    };
  }

  static async computeHealth(id: number) {
    const p = await this.getById(id);
    if (!p) return null;
    return computeHealthScore(p, p.milestones || []);
  }

  static async allForAnalytics(user?: AuthUser) {
    const qb = this.repo()
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.milestones', 'm')
      .leftJoinAndSelect('p.assignedEmployee', 'emp')
      .leftJoinAndSelect('p.managerUser', 'mgr');
    scopeToUser(qb, user);
    const rows = await qb.getMany();
    return rows.map((p) => this.enrich(p));
  }
}
