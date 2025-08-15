import mongoose from 'mongoose';

export const connectDB = async (): Promise<boolean> => {
	try {
		const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sudoku_app';
		await mongoose.connect(mongoURI);
		console.log('✅ MongoDB connected successfully');
		return true;
	} catch (error) {
		console.error('❌ MongoDB connection error:', error);
		console.warn('⚠️ Continuing without MongoDB. The server will run in demo mode.');
		return false;
	}
};

export const disconnectDB = async (): Promise<void> => {
	try {
		await mongoose.disconnect();
		console.log('📡 MongoDB disconnected');
	} catch (error) {
		console.error('❌ MongoDB disconnection error:', error);
	}
};