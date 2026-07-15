import { ReportDefinition, IReportDefinition } from '../../report-builder/models/ReportDefinition';
import { ExplorerService } from '../../explorer/services/explorerService';

export class ExecutionEngine {
  /**
   * Executes a report definition and returns the formatted dataset
   */
  static async executeReport(reportId: string, runtimeFilters?: any) {
    const report = await ReportDefinition.findById(reportId).populate('schemaId');
    if (!report) throw new Error('Report Definition not found');

    const rawDataResult = await ExplorerService.getMockData('pacs.008', 1, 1000);
    let dataset = rawDataResult.data;

    let combinedFilters = [...(report.filters || [])];
    if (runtimeFilters && runtimeFilters.length > 0) {
      combinedFilters = [...combinedFilters, ...runtimeFilters];
    }

    const transformedData = this.transformData(dataset, report.columns, combinedFilters, report);

    return {
      reportName: report.reportName,
      executedAt: new Date(),
      data: transformedData,
      columns: report.columns,
      filters: combinedFilters
    };
  }

  static async executePreview(previewConfig: any) {
    const rawDataResult = await ExplorerService.getMockData('pacs.008', 1, 100);
    let dataset = rawDataResult.data;

    const transformedData = this.transformData(dataset, previewConfig.columns, previewConfig.filters, null);

    return {
      reportName: 'Live Preview',
      executedAt: new Date(),
      data: transformedData
    };
  }

  private static transformData(dataset: any[], columns: any[], filters: any[], report?: any) {
    // Helper to resolve Mongo ObjectID to JSON path
    const resolvePath = (idOrPath: string) => {
      let p = idOrPath.toString().replace('$.', '');
      if (p.match(/^[0-9a-fA-F]{24}$/) && report?.schemaId?.fields) {
        const schemaField = report.schemaId.fields.find((f: any) => f._id.toString() === p);
        if (schemaField) p = schemaField.path;
      }
      return p;
    };

    // Apply Filtering
    let filteredData = dataset;
    if (filters && filters.length > 0) {
      filteredData = dataset.filter(row => {
        return filters.every(f => {
          const pathStr = resolvePath(f.fieldId);
          const val = row[pathStr] || this.getNestedValue(row, pathStr);
          if (val === undefined || val === null) return false;
          
          switch (f.operator) {
            case 'EQUALS': return val == f.value;
            case 'NOT_EQUALS': return val != f.value;
            case 'CONTAINS': return String(val).toLowerCase().includes(String(f.value).toLowerCase());
            case 'GREATER_THAN': return Number(val) > Number(f.value);
            case 'LESS_THAN': return Number(val) < Number(f.value);
            case 'BETWEEN': return Number(val) >= Number(f.value.min) && Number(val) <= Number(f.value.max);
            default: return true;
          }
        });
      });
    }

    // Transform Columns
    const transformedData = filteredData.map((row: any) => {
      const newRow: any = {};
      columns.forEach(col => {
        const pathStr = resolvePath(col.fieldId);
        
        let val = this.getNestedValue(row, pathStr);
        if (val === null || val === undefined) {
           val = row[col.displayName] || row[pathStr] || `No Data`;
        }
        newRow[col.displayName] = val;
      });
      return newRow;
    });

    // Apply Sorting
    const sortCol = columns.find(c => c.sortDirection && c.sortDirection !== 'NONE');
    if (sortCol) {
      transformedData.sort((a, b) => {
        const valA = a[sortCol.displayName];
        const valB = b[sortCol.displayName];
        if (valA < valB) return sortCol.sortDirection === 'ASC' ? -1 : 1;
        if (valA > valB) return sortCol.sortDirection === 'ASC' ? 1 : -1;
        return 0;
      });
    }

    return transformedData;
  }

  private static getNestedValue(obj: any, path: string) {
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : null, obj);
  }
}
