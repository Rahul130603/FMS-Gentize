import { Router } from 'express';
import * as ProjectCtrl from '../controllers/project.controller';
import { requireAuth } from '../middleware/auth.jwt';

const router = Router();
router.use(requireAuth);

router.get('/', ProjectCtrl.listProjects);
router.post('/', ProjectCtrl.createProject);
router.get('/:id', ProjectCtrl.getProject);
router.patch('/:id', ProjectCtrl.updateProject);
router.get('/:id/timeline', ProjectCtrl.projectTimeline);
router.get('/:id/milestones', ProjectCtrl.listMilestones);
router.post('/:id/milestones', ProjectCtrl.createMilestone);
router.patch('/:id/milestones/:milestoneId/complete', ProjectCtrl.completeMilestone);

export default router;
