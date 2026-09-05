import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: number;
  role: 'Admin' | 'Manager' | 'HR' | 'Employee';
  name: string;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Locals {
      user?: AuthUser;
    }
  }
}

export function jwtMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return next();
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return next();
  const token = parts[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as AuthUser;
    res.locals.user = payload;
  } catch (err) {
    // ignore invalid/expired token; protected endpoints enforce via requireAuth
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!res.locals.user) return res.status(401).json({ error: 'Authentication required' });
  next();
}

export function requireRole(...roles: AuthUser['role'][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!res.locals.user) return res.status(401).json({ error: 'Authentication required' });
    if (!roles.includes(res.locals.user.role)) return res.status(403).json({ error: 'Insufficient permissions' });
    next();
  };
}
