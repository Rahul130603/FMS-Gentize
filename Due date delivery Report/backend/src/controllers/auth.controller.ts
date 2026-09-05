import { Request, Response } from 'express';
import AuthService from '../services/auth.service';

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  const result = await AuthService.login(email, password);
  if (!result) return res.status(401).json({ error: 'Invalid credentials' });
  res.json(result);
}

export async function me(req: Request, res: Response) {
  res.json({ user: res.locals.user });
}
