// middlewares/role.middleware.ts
import { Request, Response, NextFunction , RequestHandler } from 'express';
import { IUser } from '../models/User.model';

export const requireRoles = (...allowedRoles: string[]):RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void  => {
    const user = req.user && typeof req.user === 'object' ? (req.user as unknown as IUser) : undefined; 

    console.log(user);
    
    if (!user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
    }

    if (allowedRoles.includes(user.role)) {
      next();
      return;
    }

    res.status(403).json({ 
      message: `Not authorized. Required roles: ${allowedRoles.join(', ')}`
    });
  };
};