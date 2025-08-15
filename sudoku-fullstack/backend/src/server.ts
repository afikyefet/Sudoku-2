import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import authRoutes from './routes/authRoutes';
import socialRoutes from './routes/socialRoutes';
import sudokuRoutes from './routes/sudokuRoutes';
import { connectDB } from './utils/database';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Compute allowed CORS origins from env with sensible fallbacks
const devOrigins = ['http://localhost:3000', 'http://localhost:5173'];
const envOrigins = (process.env.CORS_ORIGIN || '').split(',').filter(Boolean);
const allowedOrigins = envOrigins.length > 0
  ? envOrigins
  : (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : devOrigins);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sudoku', sudokuRoutes);
app.use('/api/social', socialRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`👤 User connected: ${socket.id}`);

  // Join user to their personal room for notifications
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined their personal room`);
  });

  // Join puzzle room for real-time interactions
  socket.on('join_puzzle_room', (puzzleId) => {
    socket.join(`puzzle_${puzzleId}`);
    console.log(`🧩 User joined puzzle room: ${puzzleId}`);

    // Notify others in the room
    socket.to(`puzzle_${puzzleId}`).emit('user_joined_puzzle', {
      socketId: socket.id,
      timestamp: new Date()
    });
  });

  // Leave puzzle room
  socket.on('leave_puzzle_room', (puzzleId) => {
    socket.leave(`puzzle_${puzzleId}`);
    console.log(`🧩 User left puzzle room: ${puzzleId}`);

    // Notify others in the room
    socket.to(`puzzle_${puzzleId}`).emit('user_left_puzzle', {
      socketId: socket.id,
      timestamp: new Date()
    });
  });

  // Real-time puzzle solving updates
  socket.on('puzzle_progress', (data) => {
    const { puzzleId, grid, cellPosition, value } = data;

    // Broadcast to others in the same puzzle room
    socket.to(`puzzle_${puzzleId}`).emit('live_puzzle_update', {
      socketId: socket.id,
      grid,
      cellPosition,
      value,
      timestamp: new Date()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`👤 User disconnected: ${socket.id}`);
  });
});

// Make io accessible to controllers
app.set('io', io);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start listening
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⚡ Socket.IO enabled for real-time features`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT. Graceful shutdown...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM. Graceful shutdown...');
  process.exit(0);
});

startServer();