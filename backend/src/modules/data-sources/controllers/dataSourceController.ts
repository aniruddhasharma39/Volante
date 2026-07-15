import { Request, Response, NextFunction } from 'express';
import { DataSourceService } from '../services/dataSourceService';

export class DataSourceController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore - Assuming req.user is set by authMiddleware
      const ds = await DataSourceService.createDataSource(req.body, req.user.userId);
      res.status(201).json({ success: true, data: ds });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const dataSources = await DataSourceService.getAllDataSources();
      res.status(200).json({ success: true, data: dataSources });
    } catch (error) {
      next(error);
    }
  }

  static async testConnection(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await DataSourceService.testConnection((req.params.id as string));
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
