import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication token is required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};

export const authorize = (requiredPermissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, error: 'Access denied. No role assigned.' });
    }

    // Role population should have included permissions. For now we assume role object has permissions array
    const userPermissions = req.user.role.permissions || [];
    
    // Super Admin wildcard bypass
    if (userPermissions.includes('*')) {
      return next();
    }

    const hasPermission = requiredPermissions.every(perm => userPermissions.includes(perm));

    if (!hasPermission) {
      return res.status(403).json({ success: false, error: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};
