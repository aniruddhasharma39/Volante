import { Router } from 'express';
import { ExplorerController } from '../controllers/explorerController';
import { authenticate } from '../../../shared/middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/browse', ExplorerController.browseData);

export default router;
