import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/modules/auth/models/User';
import { Role } from '../src/modules/auth/models/Role';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/finsight';
const DATABASE_NAME = process.env.DATABASE_NAME || 'finsight_db';

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: DATABASE_NAME });
    console.log(`Connected to MongoDB (${DATABASE_NAME})`);

    let adminRole = await Role.findOne({ roleName: 'Super Admin' });
    if (!adminRole) {
      adminRole = await Role.create({
        roleName: 'Super Admin',
        permissions: ['*'],
      });
      console.log('Super Admin role created');
    }

    const adminEmail = 'admin@finsight.com';
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'System Admin',
        email: adminEmail,
        passwordHash: 'admin123', // Model hook handles hashing automatically
        role: adminRole._id,
        status: 'Active',
      });
      console.log('Admin user created successfully!');
    } else {
      console.log('Admin user already exists!');
    }

  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seed();
