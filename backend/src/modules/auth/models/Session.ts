import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  refreshToken: string;
  browser: string;
  ip: string;
  device: string;
  status: 'Active' | 'Revoked' | 'Expired';
  createdAt: Date;
  lastActivity: Date;
}

const SessionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    refreshToken: { type: String, required: true },
    browser: { type: String },
    ip: { type: String },
    device: { type: String },
    status: {
      type: String,
      enum: ['Active', 'Revoked', 'Expired'],
      default: 'Active',
    },
    lastActivity: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Session = mongoose.model<ISession>('Session', SessionSchema);
