import { Router } from 'express';
import * as UserCtrl from '../controllers/user.controller';
import { requireAuth, requireRole } from '../middleware/auth.jwt';

const router = Router();
router.use(requireAuth);
router.get('/', requireRole('Admin', 'Manager'), UserCtrl.listUsers);
export default router;
