import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate, authorize } from '../../../shared/middleware/authMiddleware';

const router = Router();

// Protect all admin routes
router.use(authenticate);

// RBAC: Only Super Admin and Admin can access
router.use(authorize(['users.manage']));

router.get('/users', AdminController.getUsers);
router.put('/users/:id', AdminController.updateUser);
router.get('/roles', AdminController.getRoles);
router.post('/roles', AdminController.createRole);

export default router;
