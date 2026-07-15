import { Request, Response, NextFunction } from 'express';
import { SchedulerService } from '../services/schedulerService';

export class SchedulerController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const job = await SchedulerService.createJob(req.body, req.user.userId);
      res.status(201).json({ success: true, data: job });
    } catch (error) {
      console.error('CRITICAL SCHEDULER ERROR:', error);
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const jobs = await SchedulerService.getAllJobs();
      res.status(200).json({ success: true, data: jobs });
    } catch (error) {
      next(error);
    }
  }

  static async toggle(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await SchedulerService.toggleJob(req.params.id as string);
      res.status(200).json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await SchedulerService.updateJob(req.params.id as string, req.body);
      res.status(200).json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  }
}
