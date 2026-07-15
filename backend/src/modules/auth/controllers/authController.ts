import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AuthService } from '../services/authService';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required' });
      }

      const user = await User.findOne({ email }).populate('role');
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      if (user.status !== 'Active') {
        return res.status(403).json({ success: false, error: 'Account is disabled or locked' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const accessToken = AuthService.generateAccessToken(user);
      const refreshToken = AuthService.generateRefreshToken((user._id as any).toString());

      await AuthService.createSession((user._id as any).toString(), refreshToken, req);

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      res.status(200).json({
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
