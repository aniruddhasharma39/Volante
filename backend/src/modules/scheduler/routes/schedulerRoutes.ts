import { Router } from 'express';
import { SchedulerController } from '../controllers/schedulerController';
import { authenticate, authorize } from '../../../shared/middleware/authMiddleware';

const router = Router();

router.use(authenticate);

// List all jobs
router.get('/', SchedulerController.getAll);

// Create job
router.post('/', authorize(['scheduler.manage']), SchedulerController.create);

// Toggle job status
router.post('/:id/toggle', authorize(['scheduler.manage']), SchedulerController.toggle);

// Update job
router.put('/:id', authorize(['scheduler.manage']), SchedulerController.update);

export default router;
