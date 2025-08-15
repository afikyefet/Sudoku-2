import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { connectDatabase } from './utils/database';
import { SocketManager } from './socket/socketManager';

// Import routes
import authRoutes from './routes/auth';
import sudokuRoutes from './routes/sudoku';

const app = express();
const httpServer = createServer(app);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // More lenient in development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin: any, callback: any) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// Initialize WebSocket manager
const socketManager = new SocketManager(httpServer);

// Add socket manager to app for use in routes
app.set('socketManager', socketManager);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sudoku', sudokuRoutes);

// Real-time stats endpoint
app.get('/api/stats/realtime', (req, res) => {
  res.json({
    success: true,
    data: {
      onlineUsers: socketManager.getOnlineUsersCount(),
      activeRooms: socketManager.getRoomsCount(),
      serverUptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

// System notification endpoint (admin only)
app.post('/api/admin/broadcast', (req, res) => {
  const { message, adminKey } = req.body;
  
  if (adminKey !== process.env.ADMIN_SECRET) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  socketManager.broadcastSystemMessage(message);
  
  return res.json({
    success: true,
    message: 'System message broadcasted successfully',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Global error handler:', error);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(isDevelopment && { stack: error.stack, details: error }),
  });
});

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Graceful shutdown...`);
  
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    
    // Close database connections
    console.log('🔌 Closing database connections...');
    
    // Give time for cleanup
    setTimeout(() => {
      console.log('👋 Process terminated gracefully');
      process.exit(0);
    }, 1000);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.log('⚠️  Forcing shutdown...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  
  if (process.env.NODE_ENV === 'production') {
    gracefulShutdown('UNHANDLED_REJECTION');
  }
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  
  if (process.env.NODE_ENV === 'production') {
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  }
});

// Start server
const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start HTTP server with WebSocket support
    httpServer.listen(PORT, () => {
      console.log('🚀 ===================================');
      console.log(`🎮 SudokuMaster Server Running!`);
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 HTTP: http://localhost:${PORT}`);
      console.log(`⚡ WebSocket: ws://localhost:${PORT}`);
      console.log(`📊 Health: http://localhost:${PORT}/api/health`);
      console.log(`👥 Online Users: ${socketManager.getOnlineUsersCount()}`);
      console.log(`🏠 Active Rooms: ${socketManager.getRoomsCount()}`);
      console.log('🚀 ===================================');
    });

    // Periodic stats logging in development
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        const stats = {
          onlineUsers: socketManager.getOnlineUsersCount(),
          activeRooms: socketManager.getRoomsCount(),
          memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          uptime: Math.round(process.uptime()),
        };
        
        if (stats.onlineUsers > 0 || stats.activeRooms > 0) {
          console.log(`📊 Stats: ${stats.onlineUsers} users, ${stats.activeRooms} rooms, ${stats.memoryUsage}MB RAM, ${stats.uptime}s uptime`);
        }
      }, 30000); // Every 30 seconds
    }

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.log('⚠️  The server will continue running but some features may not work.');
    console.log('💡 To fix this:');
    console.log('   1. Install and start MongoDB locally, or');
    console.log('   2. Use MongoDB Atlas and update MONGODB_URI in .env');
    console.log('   3. Check your environment variables');
    
    // Start server anyway for demo purposes
    httpServer.listen(PORT, () => {
      console.log(`🎮 SudokuMaster Server (Demo Mode) - Port: ${PORT}`);
    });
  }
}

startServer();