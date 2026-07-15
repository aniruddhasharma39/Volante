import { Request, Response, NextFunction } from 'express';
import { ReportBuilderService } from '../services/reportBuilderService';

export class ReportBuilderController {
  static async save(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const report = await ReportBuilderService.saveReportDefinition(req.body, req.user.userId);
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await ReportBuilderService.getReportDefinition((req.params.id as string));
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const reports = await ReportBuilderService.getAllReportDefinitions();
      res.status(200).json({ success: true, data: reports });
    } catch (error) {
      next(error);
    }
  }
}
