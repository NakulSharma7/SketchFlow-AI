import { Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export class AuthController {
  static async register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters' });
        return;
      }

      const result = await AuthService.register({ email, password, name });
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const result = await AuthService.login({ email, password });
      res.status(200).json(result);
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  }

  static async getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await AuthService.getUserById(req.userId);
      res.status(200).json({ user });
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }
}
