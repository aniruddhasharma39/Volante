import { Router } from 'express';
import { AlertController } from '../controllers/alertController';
import { authenticate } from '../../../shared/middleware/authMiddleware';

const router = Router();

router.use(authenticate);

// Get all alerts
router.get('/', AlertController.getAlerts);

// Resolve alert
router.post('/:id/resolve', AlertController.resolveAlert);

// Trigger mock alert for demo
router.post('/mock', AlertController.triggerMock);

export default router;
