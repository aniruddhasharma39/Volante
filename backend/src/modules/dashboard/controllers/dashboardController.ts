import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboardService';

export class DashboardController {
  static async getMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await DashboardService.getKpiMetrics();
      res.status(200).json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  }
}
