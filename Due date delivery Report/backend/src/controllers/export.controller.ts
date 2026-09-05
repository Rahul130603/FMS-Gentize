import { Request, Response } from 'express';
import ProjectService from '../services/project.service';
import ReportService from '../services/report.service';
import ExportService from '../services/export.service';

async function resolveRows(req: Request, res: Response) {
  const scope = (req.query.scope as string) || 'filtered';
  const user = res.locals.user;
  switch (scope) {
    case 'overdue':
      return ReportService.overdue(user);
    case 'due_today':
      return ReportService.dueToday(user);
    case 'due_tomorrow':
      return ReportService.dueTomorrow(user);
    case 'upcoming':
      return ReportService.upcoming(parseInt((req.query.days as string) || '7', 10), user);
    case 'all':
      return ProjectService.allForAnalytics(user);
    default: {
      const result = await ProjectService.list(req.query as any, 1, 100000, user);
      return result.items;
    }
  }
}

export async function exportCsv(req: Request, res: Response) {
  const rows = await resolveRows(req, res);
  await ExportService.toCsv(rows, res, 'delivery-report');
}

export async function exportExcel(req: Request, res: Response) {
  const rows = await resolveRows(req, res);
  await ExportService.toExcel(rows, res, 'delivery-report');
}

export async function exportPdf(req: Request, res: Response) {
  const rows = await resolveRows(req, res);
  ExportService.toPdf(rows, res, 'delivery-report', 'Due Date Delivery Report');
}
