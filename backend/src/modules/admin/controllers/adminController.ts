import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/adminService';

export class AdminController {
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await AdminService.getAllUsers();
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const updatedUser = await AdminService.updateUser(req.params.id as string, req.body);
      res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
      next(error);
    }
  }

  static async getRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await AdminService.getAllRoles();
      res.status(200).json({ success: true, data: roles });
    } catch (error) {
      next(error);
    }
  }

  static async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await AdminService.createRole(req.body);
      res.status(201).json({ success: true, data: role });
    } catch (error) {
      next(error);
    }
  }
}
