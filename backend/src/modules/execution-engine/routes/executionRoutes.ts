import { Router } from 'express';
import { ExecutionController } from '../controllers/executionController';
import { authenticate } from '../../../shared/middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/execute/:reportId', ExecutionController.execute);

export default router;
