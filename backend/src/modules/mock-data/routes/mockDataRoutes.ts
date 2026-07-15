import { Router } from 'express';
import { MockDataController } from '../controllers/mockDataController';

const router = Router();

// This route serves as a mock external API for Data Source ingestion testing
router.get('/payments', MockDataController.getPayments);

export default router;
