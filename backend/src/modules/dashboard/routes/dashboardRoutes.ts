import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { authenticate } from '../../../shared/middleware/authMiddleware';

const router = Router();

// Protect dashboard routes
router.use(authenticate);

router.get('/metrics', DashboardController.getMetrics);

export default router;
