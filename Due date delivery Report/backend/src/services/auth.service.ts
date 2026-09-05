import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../ormconfig';
import { User } from '../entities/User';

export default class AuthService {
  static repo() {
    return AppDataSource.getRepository(User);
  }

  static async login(email: string, password: string) {
    const user = await this.repo().findOne({ where: { email } });
    if (!user || !user.active) return null;
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return null;

    const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '12h' });
    return { token, user: payload };
  }

  static async listUsers() {
    return this.repo().find({ where: { active: true }, order: { name: 'ASC' } });
  }
}
