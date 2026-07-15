import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const router = Router();

router.post('/login', AuthController.login);

// TODO: implement /refresh-token, /logout, /forgot-password

export default router;
