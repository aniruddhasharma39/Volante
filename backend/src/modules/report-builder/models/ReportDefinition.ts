import mongoose, { Schema, Document } from 'mongoose';

export interface IReportColumn {
  fieldId: string;
  displayName: string;
  aggregation?: 'NONE' | 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX';
  format?: string;
  order: number;
  sortDirection?: 'ASC' | 'DESC' | 'NONE';
}

export interface IReportFilter {
  fieldId: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'BETWEEN';
  value: any;
  isRuntimePrompt: boolean;
}

export interface IReportDefinition extends Document {
  reportName: string;
  description: string;
  dataSourceId: mongoose.Types.ObjectId;
  schemaId: mongoose.Types.ObjectId;
  columns: IReportColumn[];
  filters: IReportFilter[];
  status: 'Draft' | 'Published' | 'Archived';
  createdBy: mongoose.Types.ObjectId;
}

const ReportColumnSchema = new Schema({
  fieldId: { type: String, required: true },
  displayName: { type: String, required: true },
  aggregation: { type: String, enum: ['NONE', 'SUM', 'AVG', 'COUNT', 'MIN', 'MAX'], default: 'NONE' },
  format: { type: String },
  order: { type: Number, required: true },
  sortDirection: { type: String, enum: ['ASC', 'DESC', 'NONE'], default: 'NONE' }
}, { _id: false });

const ReportFilterSchema = new Schema({
  fieldId: { type: String, required: true },
  operator: { type: String, enum: ['EQUALS', 'NOT_EQUALS', 'CONTAINS', 'GREATER_THAN', 'LESS_THAN', 'IN', 'BETWEEN'], required: true },
  value: { type: Schema.Types.Mixed },
  isRuntimePrompt: { type: Boolean, default: false }
}, { _id: false });

const ReportDefinitionSchema: Schema = new Schema(
  {
    reportName: { type: String, required: true },
    description: { type: String },
    dataSourceId: { type: Schema.Types.ObjectId, ref: 'DataSource', required: true },
    schemaId: { type: Schema.Types.ObjectId, ref: 'SchemaRegistry', required: true },
    columns: [ReportColumnSchema],
    filters: [ReportFilterSchema],
    status: { type: String, enum: ['Draft', 'Published', 'Archived'], default: 'Draft' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const ReportDefinition = mongoose.model<IReportDefinition>('ReportDefinition', ReportDefinitionSchema);
