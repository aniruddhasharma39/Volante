import mongoose, { Schema, Document } from 'mongoose';

export interface IScheduledJob extends Document {
  reportId: mongoose.Types.ObjectId;
  jobName: string;
  cronExpression: string;
  recipients: string[];
  exportFormat: 'PDF' | 'CSV' | 'XLSX';
  status: 'Active' | 'Paused' | 'Error';
  lastRun?: Date;
  nextRun?: Date;
  createdBy: mongoose.Types.ObjectId;
}

const ScheduledJobSchema: Schema = new Schema(
  {
    reportId: { type: Schema.Types.ObjectId, ref: 'ReportDefinition', required: true },
    jobName: { type: String, required: true },
    cronExpression: { type: String, required: true }, // e.g. '0 0 * * *'
    recipients: [{ type: String }],
    exportFormat: { type: String, enum: ['PDF', 'CSV', 'XLSX'], default: 'PDF' },
    status: { type: String, enum: ['Active', 'Paused', 'Error'], default: 'Active' },
    lastRun: { type: Date },
    nextRun: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const ScheduledJob = mongoose.model<IScheduledJob>('ScheduledJob', ScheduledJobSchema);
