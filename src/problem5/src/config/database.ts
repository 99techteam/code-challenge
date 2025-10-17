// src/config/database.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedData } from '../seed';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in .env file');
    }
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');

    // Seed data on initial connection if collection is empty
    await seedData();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

export default connectDB;