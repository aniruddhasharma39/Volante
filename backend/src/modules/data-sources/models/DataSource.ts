import mongoose, { Schema, Document } from 'mongoose';
import { encrypt, decrypt } from '../../../shared/utils/encryption';

export interface IDataSource extends Document {
  name: string;
  type: 'REST_API' | 'GRAPHQL' | 'DATABASE';
  baseUrl: string;
  authentication: {
    type: 'NONE' | 'BEARER_TOKEN' | 'BASIC_AUTH' | 'API_KEY';
    credentials?: string; // Stored encrypted
  };
  status: 'Active' | 'Inactive' | 'Error';
  lastSync: Date;
  createdBy: mongoose.Types.ObjectId;
}

const DataSourceSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    type: { type: String, enum: ['REST_API', 'GRAPHQL', 'DATABASE'], required: true },
    baseUrl: { type: String, required: true },
    authentication: {
      type: { type: String, enum: ['NONE', 'BEARER_TOKEN', 'BASIC_AUTH', 'API_KEY'], default: 'NONE' },
      credentials: { type: String } // Encypted payload
    },
    status: { type: String, enum: ['Active', 'Inactive', 'Error'], default: 'Active' },
    lastSync: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Pre-save hook to encrypt credentials
DataSourceSchema.pre<IDataSource>('save', function (next) {
  if (this.isModified('authentication.credentials') && this.authentication.credentials) {
    this.authentication.credentials = encrypt(this.authentication.credentials);
  }
  
});

export const DataSource = mongoose.model<IDataSource>('DataSource', DataSourceSchema);
