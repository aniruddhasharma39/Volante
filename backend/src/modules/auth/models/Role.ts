import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  roleName: string;
  permissions: string[];
}

const RoleSchema: Schema = new Schema(
  {
    roleName: { type: String, required: true, unique: true },
    permissions: [{ type: String }],
  },
  { timestamps: true }
);

export const Role = mongoose.model<IRole>('Role', RoleSchema);
