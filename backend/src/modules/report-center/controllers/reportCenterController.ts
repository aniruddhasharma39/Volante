import { Request, Response, NextFunction } from 'express';
import { ExecutionEngine } from '../../execution-engine/services/executionEngine';
import { ExportService } from '../services/exportService';

export class ReportCenterController {
  static async preview(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await ExecutionEngine.executeReport(id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async export(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const format = req.query.format as string; // csv, xlsx, pdf
      
      const result = await ExecutionEngine.executeReport(id);
      const data = result.data;
      const reportName = result.reportName.replace(/\s+/g, '_');

      if (format === 'csv') {
        const csv = ExportService.generateCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${reportName}.csv`);
        res.send(csv);
      } else if (format === 'xlsx') {
        const buffer = ExportService.generateExcel(data);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${reportName}.xlsx`);
        res.send(buffer);
      } else if (format === 'pdf') {
        const buffer = await ExportService.generatePDF(data, result.reportName);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${reportName}.pdf`);
        res.send(buffer);
      } else {
        res.status(400).json({ success: false, error: 'Invalid export format' });
      }
    } catch (error) {
      next(error);
    }
  }
}
