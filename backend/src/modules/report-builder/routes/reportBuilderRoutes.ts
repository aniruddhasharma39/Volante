import { Router } from 'express';
import { ReportBuilderController } from '../controllers/reportBuilderController';
import { authenticate, authorize } from '../../../shared/middleware/authMiddleware';

const router = Router();

router.use(authenticate);

// List all templates
router.get('/', ReportBuilderController.getAll);

// Get specific template
router.get('/:id', ReportBuilderController.getOne);

// Create or update template
router.post('/', authorize(['report.manage']), ReportBuilderController.save);

// Update runtime filters
router.put('/:id/filters', authorize(['report.manage']), ReportBuilderController.updateFilters);

export default router;
