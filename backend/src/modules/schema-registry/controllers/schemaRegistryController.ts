import { Request, Response, NextFunction } from 'express';
import { SchemaDiscoveryEngine } from '../services/schemaDiscoveryEngine';

export class SchemaRegistryController {
  static async discover(req: Request, res: Response, next: NextFunction) {
    try {
      const { dataSourceId, schemaName, endpoint, jsonSample } = req.body;
      const schema = await SchemaDiscoveryEngine.saveSchema(dataSourceId, schemaName, endpoint, jsonSample);
      res.status(200).json({ success: true, data: schema });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const schemas = await SchemaDiscoveryEngine.getAllSchemas();
      res.status(200).json({ success: true, data: schemas });
    } catch (error) {
      next(error);
    }
  }
}
