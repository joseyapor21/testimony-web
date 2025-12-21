import { Router } from 'express';
import { login, register, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/login/v4 - Login (matches Flutter app endpoint)
router.post('/login/v4', login);

// POST /api/register - Register new user
router.post('/register', register);

// GET /api/me - Get current user
router.get('/me', authenticate, getMe);

export default router;
