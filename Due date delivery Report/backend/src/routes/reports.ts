import { Router } from 'express';
import * as ReportCtrl from '../controllers/report.controller';
import { requireAuth } from '../middleware/auth.jwt';

const router = Router();
router.use(requireAuth);

router.get('/dashboard', ReportCtrl.dashboard);
router.get('/alerts', ReportCtrl.alerts);
router.get('/calendar', ReportCtrl.calendar);
router.get('/due-today', ReportCtrl.dueToday);
router.get('/due-tomorrow', ReportCtrl.dueTomorrow);
router.get('/upcoming', ReportCtrl.upcoming);
router.get('/overdue', ReportCtrl.overdue);
router.get('/delivery-status', ReportCtrl.deliveryStatus);
router.get('/completion', ReportCtrl.completion);
router.get('/employee-performance', ReportCtrl.employeePerformance);
router.get('/manager-performance', ReportCtrl.managerPerformance);
router.get('/department-performance', ReportCtrl.departmentPerformance);

export default router;
