import { Router } from 'express';
import auth from './auth';
import projects from './projects';
import reports from './reports';
import analytics from './analytics';
import exportRoutes from './export';
import notifications from './notifications';
import users from './users';

const router = Router();
router.use('/auth', auth);
router.use('/projects', projects);
router.use('/reports', reports);
router.use('/analytics', analytics);
router.use('/export', exportRoutes);
router.use('/notifications', notifications);
router.use('/users', users);

export default router;
