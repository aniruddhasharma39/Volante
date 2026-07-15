import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/finsight';
const DATABASE_NAME = process.env.DATABASE_NAME || 'finsight_db';

// Database Connection
const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, { dbName: DATABASE_NAME });
        console.log(`MongoDB connection established to database: ${DATABASE_NAME}`);
    } catch (error) {
        console.error('MongoDB connection failed', error);
        process.exit(1);
    }
};

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`FinSight Backend running on port ${PORT}`);
    });
};

startServer();
