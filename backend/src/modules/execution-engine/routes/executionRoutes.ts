import { Router } from 'express';
import { ExecutionController } from '../controllers/executionController';
import { authenticate } from '../../../shared/middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/preview', ExecutionController.preview);
router.post('/:reportId', ExecutionController.execute);

export default router;
