import { Router } from 'express';
import * as AuthCtrl from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.jwt';

const router = Router();
router.post('/login', AuthCtrl.login);
router.get('/me', requireAuth, AuthCtrl.me);
export default router;
