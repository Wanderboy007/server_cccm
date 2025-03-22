import express from 'express';
import { register,login } from '../controllers/authController';
import { authenticate, isSuperAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Protected route: Only super admins can create super admins and admins
router.post('/register/admin', authenticate, isSuperAdmin, register); 

// Open route: Anyone can create students and alumni
router.post('/register', register); 

router.post('/login', login);


export default router;