import { Request, Response, NextFunction } from 'express';
import { AlertService } from '../services/alertService';

export class AlertController {
  static async getAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const alerts = await AlertService.getAlerts();
      res.status(200).json({ success: true, data: alerts });
    } catch (error) {
      next(error);
    }
  }

  static async resolveAlert(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const alert = await AlertService.resolveAlert(req.params.id, req.user.userId);
      res.status(200).json({ success: true, data: alert });
    } catch (error) {
      next(error);
    }
  }

  static async triggerMock(req: Request, res: Response, next: NextFunction) {
    try {
      const alert = await AlertService.triggerMockAlert();
      res.status(201).json({ success: true, data: alert });
    } catch (error) {
      next(error);
    }
  }
}
