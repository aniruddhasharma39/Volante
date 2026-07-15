import { Request, Response, NextFunction } from 'express';
import { ExecutionEngine } from '../services/executionEngine';

export class ExecutionController {
  static async execute(req: Request, res: Response, next: NextFunction) {
    try {
      const reportId = req.params.reportId as string;
      const { runtimeFilters } = req.body;
      
      const result = await ExecutionEngine.executeReport(reportId, runtimeFilters);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async preview(req: Request, res: Response, next: NextFunction) {
    try {
      const config = req.body;
      const result = await ExecutionEngine.executePreview(config);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
