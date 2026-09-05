import { Router } from 'express';
import * as ExportCtrl from '../controllers/export.controller';
import { requireAuth } from '../middleware/auth.jwt';

const router = Router();
router.use(requireAuth);
router.get('/csv', ExportCtrl.exportCsv);
router.get('/excel', ExportCtrl.exportExcel);
router.get('/pdf', ExportCtrl.exportPdf);
export default router;
