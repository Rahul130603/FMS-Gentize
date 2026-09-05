import { Router } from 'express';
import * as NotificationCtrl from '../controllers/notification.controller';
import { requireAuth } from '../middleware/auth.jwt';

const router = Router();
router.use(requireAuth);
router.get('/', NotificationCtrl.list);
router.patch('/:id/acknowledge', NotificationCtrl.acknowledge);
export default router;
