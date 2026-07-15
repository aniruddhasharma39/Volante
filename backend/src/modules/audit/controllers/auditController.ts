import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/AuditLog';

export class AuditController {
  static async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = 100, page = 1 } = req.query;
      const parsedLimit = parseInt(limit as string, 10);
      const parsedPage = parseInt(page as string, 10);
      
      const logs = await AuditLog.find()
        .populate('userId', 'email')
        .sort({ createdAt: -1 })
        .skip((parsedPage - 1) * parsedLimit)
        .limit(parsedLimit);
        
      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }
}
