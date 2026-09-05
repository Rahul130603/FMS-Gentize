import { Request, Response } from 'express';
import AnalyticsService from '../services/analytics.service';

export const charts = async (req: Request, res: Response) => res.json(await AnalyticsService.charts(res.locals.user));
