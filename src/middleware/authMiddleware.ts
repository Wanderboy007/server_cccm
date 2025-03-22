
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import User from '../models/User'; 


declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

interface DecodedToken {
  userId: string;
  iat?: number;
  exp?: number;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Token:', token); // Debugging: Log the token
    if (!token) {
      res.status(401).json({ message: 'No token, authorization denied' });
      return;
    }

    // Verify the token and decode it
    const decoded = verifyToken(token) as DecodedToken;
    console.log('Decoded token:', decoded); 

    // Fetch the user from the database
    const user = await User.findById(decoded.userId) as { _id: string; role: string } | null;
    console.log('User:', user); 
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

   
    req.user = {
      userId: user._id.toString(), // Ensure userId is a string
      role: user.role, // Include the user's role
    };

    console.log('Authenticated user:', req.user);
    next(); // Pass control to the next middleware or route handler
    return;
  } catch (error) {
    console.error('Authentication error:', error);
     res.status(401).json({ message: 'Invalid token' });
  }
};

export const isSuperAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check if the user is a super admin
    if (req.user?.role !== 'super_admin') {
      console.log('User role:', req.user?.role);
      res.status(403).json({ message: 'Unauthorized: Only super admins can perform this action' });
      return; // Ensure the function exits here
    }
    next();
    return; // Explicitly return after calling next()
  } catch (error) {
    console.error('Super admin check error:', error);
    res.status(500).json({ message: 'Server error', error });
    return; // Explicitly return after handling the error
  }
};