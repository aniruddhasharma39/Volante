import { Router } from 'express';
import { AuditController } from '../controllers/auditController';
import { authenticate, authorize } from '../../../shared/middleware/authMiddleware';

const router = Router();

router.use(authenticate);

// Only platform administrators can view audit logs
router.get('/', authorize(['audit.view']), AuditController.getLogs);

export default router;
