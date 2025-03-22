import express from 'express';
import { register,registerAdmin,login } from '../controllers/authController';
import { authenticateAndAuthorizeAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Protected route: Only super admins can create super admins and admins
router.post('/register/admin', authenticateAndAuthorizeAdmin, registerAdmin); 

// Open route: Anyone can create students and alumni
router.post('/register', register); 

router.post('/login', login);


export default router;