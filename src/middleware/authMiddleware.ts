
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import User from '../models/User.model'; 


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


export const authenticateAndAuthorizeAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Step 1: Authenticate the user
    const token = req.header('Authorization')?.replace('Bearer ', '');
    // console.log('Token:', token); // Debugging: Log the token

    if (!token) {
      res.status(401).json({ message: 'No token, authorization denied' });
      return;
    }

    // Verify the token and decode it
    const decoded = verifyToken(token) as DecodedToken;
    // console.log('Decoded token:', decoded); // Debugging: Log the decoded token

    // Fetch the user from the database
    const user = await User.findById(decoded.userId).select('_id role') as { _id: string; role: string } | null;
    // console.log('User:', user); // Debugging: Log the user

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    // Step 2: Authorize the user (check if they are a super admin)
    if (user.role !== 'super_admin') {
      // console.log('User role:', user.role); // Debugging: Log the user role
      res.status(403).json({ message: 'Unauthorized: Only super admins can perform this action' });
      return;
    }

    // Attach the user's details to the request object
    req.user = {
      userId: user._id.toString(), // Ensure userId is a string
      role: user.role, // Include the user's role
    };
    console.log(req.user)

    // Pass control to the next middleware or route handler
    next();
  } catch (error) {
    // console.error('Authentication and authorization error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};


export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token;
   console.log("hu")
  // 🔍 First, try getting token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log("auth")
  }
  
  console.log()
  // 🍪 If not in header, try from cookies
  if (!token && req.cookies!.authToken) {
    token = req.cookies.authToken;
  }

  if (!token) {
    res.status(401).json({ message: 'No token, authorization denied' });
    return;
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('_id role') as { _id: string; role: string } | null;

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
