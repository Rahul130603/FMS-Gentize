import { Request, Response } from 'express';
import ReportService from '../services/report.service';

export const dashboard = async (req: Request, res: Response) => res.json(await ReportService.dashboard(res.locals.user));
export const alerts = async (req: Request, res: Response) => res.json(await ReportService.alerts(res.locals.user));
export const calendar = async (req: Request, res: Response) => res.json(await ReportService.calendar(res.locals.user));
export const dueToday = async (req: Request, res: Response) => res.json(await ReportService.dueToday(res.locals.user));
export const dueTomorrow = async (req: Request, res: Response) => res.json(await ReportService.dueTomorrow(res.locals.user));
export const upcoming = async (req: Request, res: Response) => res.json(await ReportService.upcoming(parseInt((req.query.days as string) || '7', 10), res.locals.user));
export const overdue = async (req: Request, res: Response) => res.json(await ReportService.overdue(res.locals.user));
export const deliveryStatus = async (req: Request, res: Response) => res.json(await ReportService.deliveryStatus(res.locals.user));
export const completion = async (req: Request, res: Response) => res.json(await ReportService.completion(res.locals.user));
export const employeePerformance = async (req: Request, res: Response) => res.json(await ReportService.employeePerformance(res.locals.user));
export const managerPerformance = async (req: Request, res: Response) => res.json(await ReportService.managerPerformance(res.locals.user));
export const departmentPerformance = async (req: Request, res: Response) => res.json(await ReportService.departmentPerformance(res.locals.user));
