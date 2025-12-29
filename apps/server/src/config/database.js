import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from './logger.js';

// Load environment variables (works both when running server.js and this file directly)
dotenv.config({ path: './src/.env' });

const MONGO_URI = process.env.MONGO_URI ; 

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {});

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};
