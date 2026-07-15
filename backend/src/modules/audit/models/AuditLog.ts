import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId; // null if unauthenticated / system
  action: string;
  resource: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'Success' | 'Failure';
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    details: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    status: { type: String, enum: ['Success', 'Failure'], default: 'Success' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
