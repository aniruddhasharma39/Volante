import { User } from '../../auth/models/User';
import { Role } from '../../auth/models/Role';

export class AdminService {
  static async getAllUsers() {
    return await User.find().select('-passwordHash').populate('role');
  }

  static async getUserById(userId: string) {
    return await User.findById(userId).select('-passwordHash').populate('role');
  }

  static async updateUser(userId: string, data: any) {
    return await User.findByIdAndUpdate(userId, data, { new: true }).select('-passwordHash');
  }

  static async getAllRoles() {
    return await Role.find();
  }

  static async createRole(roleData: { roleName: string, permissions: string[] }) {
    const role = new Role(roleData);
    await role.save();
    return role;
  }
}
