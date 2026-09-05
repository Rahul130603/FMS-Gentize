import { Request, Response } from 'express';
import ProjectService from '../services/project.service';
import MilestoneService from '../services/milestone.service';
import EventService from '../services/event.service';

export async function listProjects(req: Request, res: Response) {
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = parseInt((req.query.limit as string) || '20', 10);
  const filters = req.query as any;
  const result = await ProjectService.list(filters, page, limit, res.locals.user);
  res.json(result);
}

export async function createProject(req: Request, res: Response) {
  if (!ProjectService.canEdit(res.locals.user)) return res.status(403).json({ error: 'Insufficient permissions' });
  try {
    const project = await ProjectService.createProject(req.body, res.locals.user);
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

export async function getProject(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const project = await ProjectService.getById(id);
  if (!project) return res.status(404).json({ error: 'Not found' });
  if (!ProjectService.canAccess(project, res.locals.user)) return res.status(403).json({ error: 'Insufficient permissions' });

  const enriched = ProjectService.enrich(project as any);
  const timeline = await EventService.timeline(id);
  res.json({ project: enriched, health: enriched.health, recommendations: enriched.recommendations, timeline });
}

export async function updateProject(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const existing = await ProjectService.getById(id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const user = res.locals.user;
  const isOwnerEmployee = user?.role === 'Employee' && existing.assigned_to === user.id;
  if (!ProjectService.canEdit(user) && !isOwnerEmployee) return res.status(403).json({ error: 'Insufficient permissions' });

  // Employees may only update their own progress fields, not reassign/reprioritize.
  const payload = isOwnerEmployee
    ? { completion_percentage: req.body.completion_percentage, remarks: req.body.remarks, workflow_stage: req.body.workflow_stage, status: req.body.status }
    : req.body;

  const project = await ProjectService.updateProject(id, payload, user);
  res.json(project);
}

export async function listMilestones(req: Request, res: Response) {
  const project_id = parseInt(req.params.id, 10);
  res.json(await MilestoneService.listForProject(project_id));
}

export async function createMilestone(req: Request, res: Response) {
  if (!ProjectService.canEdit(res.locals.user)) return res.status(403).json({ error: 'Insufficient permissions' });
  const project_id = parseInt(req.params.id, 10);
  const milestone = await MilestoneService.create({ ...req.body, project_id });
  res.status(201).json(milestone);
}

export async function completeMilestone(req: Request, res: Response) {
  const { id, milestoneId } = req.params;
  const project = await ProjectService.getById(parseInt(id, 10));
  if (!project) return res.status(404).json({ error: 'Not found' });
  if (!ProjectService.canAccess(project, res.locals.user)) return res.status(403).json({ error: 'Insufficient permissions' });

  const { actual_completed_date, reason } = req.body;
  const m = await MilestoneService.complete(parseInt(milestoneId, 10), actual_completed_date || new Date().toISOString().slice(0, 10), reason, res.locals.user);
  if (!m) return res.status(404).json({ error: 'Milestone not found' });
  res.json(m);
}

export async function projectTimeline(req: Request, res: Response) {
  const project_id = parseInt(req.params.id, 10);
  res.json(await EventService.timeline(project_id));
}
