import { ReportDefinition, IReportDefinition } from '../models/ReportDefinition';

export class ReportBuilderService {
  static async saveReportDefinition(data: any, userId: string) {
    if (data._id) {
      // Update existing
      return await ReportDefinition.findByIdAndUpdate(
        data._id,
        { ...data },
        { new: true }
      );
    } else {
      // Create new
      const report = new ReportDefinition({ ...data, createdBy: userId });
      await report.save();
      return report;
    }
  }

  static async getReportDefinition(id: string) {
    return await ReportDefinition.findById(id).populate('schemaId');
  }

  static async getAllReportDefinitions() {
    return await ReportDefinition.find().populate('dataSourceId schemaId');
  }

  static async updateFilters(reportId: string, filters: any[]) {
    const report = await ReportDefinition.findById(reportId);
    if (!report) throw new Error('Report not found');
    
    // We overwrite or append runtime filters. For now, let's overwrite existing report filters
    report.filters = filters;
    await report.save();
    return report;
  }
}
