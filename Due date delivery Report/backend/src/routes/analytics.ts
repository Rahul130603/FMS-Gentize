import { Router } from 'express';
import * as AnalyticsCtrl from '../controllers/analytics.controller';
import { requireAuth } from '../middleware/auth.jwt';

const router = Router();
router.use(requireAuth);
router.get('/', AnalyticsCtrl.charts);
export default router;
