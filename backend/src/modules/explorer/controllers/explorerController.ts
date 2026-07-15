import { Request, Response, NextFunction } from 'express';
import { ExplorerService } from '../services/explorerService';

export class ExplorerController {
  static async browseData(req: Request, res: Response, next: NextFunction) {
    try {
      const { schemaName = 'pacs.008', page = 1, limit = 50, sortBy, sortOrder } = req.query;
      
      const result = await ExplorerService.getMockData(
        schemaName as string,
        parseInt(page as string, 10),
        parseInt(limit as string, 10),
        sortBy as string,
        sortOrder as string
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
