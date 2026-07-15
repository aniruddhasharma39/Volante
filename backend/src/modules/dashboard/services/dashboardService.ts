import { User } from '../../auth/models/User';
import { DataSource } from '../../data-sources/models/DataSource';
import { ScheduledJob } from '../../scheduler/models/ScheduledJob';
import { ReportDefinition } from '../../report-builder/models/ReportDefinition';

export class DashboardService {
  static async getKpiMetrics() {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'Active' });
    const connectedDataSources = await DataSource.countDocuments();
    const runningJobs = await ScheduledJob.countDocuments({ status: 'Active' });
    const reportsGeneratedToday = await ReportDefinition.countDocuments(); // Fallback metric for MVP

    return {
      totalUsers,
      activeUsers,
      reportsGeneratedToday,
      connectedDataSources,
      runningJobs,
      failedReports: 0, // MVP mock
      systemUptime: process.uptime()
    };
  }
}
