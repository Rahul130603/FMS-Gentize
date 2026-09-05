import { Request, Response } from 'express';
import NotificationService from '../services/notification.service';

export async function list(req: Request, res: Response) {
  const onlyUnacknowledged = req.query.unacknowledged === 'true';
  res.json(await NotificationService.listForUser(res.locals.user!.id, onlyUnacknowledged));
}

export async function acknowledge(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const n = await NotificationService.acknowledge(id, res.locals.user!.id);
  if (!n) return res.status(404).json({ error: 'Not found' });
  res.json(n);
}
