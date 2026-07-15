import { Router } from 'express';
import { ReportCenterController } from '../controllers/reportCenterController';
import { authenticate } from '../../../shared/middleware/authMiddleware';

const router = Router();

router.use(authenticate);

// Preview a report (JSON output)
router.get('/:id/preview', ReportCenterController.preview);

// Export a report (File download)
router.get('/:id/export', ReportCenterController.export);

export default router;
