import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../../modules/audit/models/AuditLog';

export const auditLogger = (action: string, resource: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // We want to capture the response status, so we hook into the finish event
    res.on('finish', async () => {
      try {
        const userId = (req as any).user?.userId || null;
        const status = res.statusCode >= 400 ? 'Failure' : 'Success';
        const details = `Method: ${req.method} | URL: ${req.originalUrl} | Status: ${res.statusCode}`;

        const log = new AuditLog({
          userId,
          action,
          resource,
          details,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          status
        });
        
        await log.save();
      } catch (err) {
        console.error('Failed to save audit log:', err);
      }
    });

    next();
  };
};
