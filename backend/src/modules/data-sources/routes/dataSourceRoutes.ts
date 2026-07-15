import { Router } from 'express';
import { DataSourceController } from '../controllers/dataSourceController';
import { authenticate, authorize } from '../../../shared/middleware/authMiddleware';

const router = Router();

router.use(authenticate);

// List all
router.get('/', DataSourceController.getAll);

// Admin only actions
router.post('/', authorize(['datasource.manage']), DataSourceController.create);
router.post('/:id/test', authorize(['datasource.manage']), DataSourceController.testConnection);

export default router;
