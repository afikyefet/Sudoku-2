import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Connect to MongoDB database
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sudoku_app';
    
    await mongoose.connect(mongoUri);
    
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    console.log('⚠️  The server will continue running but database features will not work.');
    console.log('💡 To fix this:');
    console.log('   1. Install and start MongoDB locally, or');
    console.log('   2. Use MongoDB Atlas and update MONGODB_URI in .env');
    // Don't exit, continue running for demo purposes
  }
};

/**
 * Close database connection
 */
export const closeDatabaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('📴 MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
  }
};