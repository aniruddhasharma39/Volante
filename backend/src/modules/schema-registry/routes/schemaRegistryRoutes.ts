import { Router } from 'express';
import { SchemaRegistryController } from '../controllers/schemaRegistryController';
import { authenticate, authorize } from '../../../shared/middleware/authMiddleware';

const router = Router();

router.use(authenticate);

// List all schemas
router.get('/', SchemaRegistryController.getAll);

// Discover and save schema from JSON
router.post('/discover', authorize(['schema.manage']), SchemaRegistryController.discover);

export default router;
