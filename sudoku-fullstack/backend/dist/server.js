"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const socialRoutes_1 = __importDefault(require("./routes/socialRoutes"));
const sudokuRoutes_1 = __importDefault(require("./routes/sudokuRoutes"));
const database_1 = require("./utils/database");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// Compute allowed CORS origins from env with sensible fallbacks
const devOrigins = ['http://localhost:3000', 'http://localhost:5173'];
const envOrigins = (process.env.CORS_ORIGIN || '').split(',').filter(Boolean);
const allowedOrigins = envOrigins.length > 0
    ? envOrigins
    : (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : devOrigins);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true
    }
});
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/sudoku', sudokuRoutes_1.default);
app.use('/api/social', socialRoutes_1.default);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
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
        const connected = await (0, database_1.connectDB)();
        if (!connected) {
            console.warn('⚠️ Server starting without MongoDB. Some features may be limited.');
        }
        // Start listening
        httpServer.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`⚡ Socket.IO enabled for real-time features`);
        });
    }
    catch (error) {
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
//# sourceMappingURL=server.js.map