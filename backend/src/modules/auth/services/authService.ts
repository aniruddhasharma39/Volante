import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { Session } from '../models/Session';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';

export class AuthService {
  static generateAccessToken(user: IUser) {
    return jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
  }

  static generateRefreshToken(userId: string) {
    return jwt.sign(
      { userId },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
  }

  static async createSession(userId: string, refreshToken: string, req: any) {
    const session = new Session({
      userId,
      refreshToken,
      ip: req.ip || req.connection.remoteAddress,
      browser: req.headers['user-agent'],
      status: 'Active'
    });
    await session.save();
    return session;
  }
}
