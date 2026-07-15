import mongoose, { Schema, Document } from 'mongoose';

export interface IAlert extends Document {
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Acknowledged' | 'Resolved';
  source: 'System' | 'Data Quality' | 'Security';
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
}

const AlertSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    severity: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], required: true },
    status: { type: String, enum: ['Open', 'Acknowledged', 'Resolved'], default: 'Open' },
    source: { type: String, enum: ['System', 'Data Quality', 'Security'], required: true },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export const Alert = mongoose.model<IAlert>('Alert', AlertSchema);
