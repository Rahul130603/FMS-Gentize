import { Request, Response } from 'express';
import AuthService from '../services/auth.service';

export async function listUsers(req: Request, res: Response) {
  const users = await AuthService.listUsers();
  res.json(users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, department: u.department })));
}
