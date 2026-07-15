import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: mongoose.Types.ObjectId;
  status: 'Active' | 'Locked' | 'Disabled' | 'Archived';
  lastLogin: Date;
  passwordChangedAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    status: {
      type: String,
      enum: ['Active', 'Locked', 'Disabled', 'Archived'],
      default: 'Active',
    },
    lastLogin: { type: Date },
    passwordChangedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Password hash middleware
UserSchema.pre<IUser>('save', async function () {
  if (!this.isModified('passwordHash')) {
    return;
  }
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  
});

// Compare password method
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', UserSchema);
