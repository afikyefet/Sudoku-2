import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { IJWTPayload } from '../types';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

interface RoomData {
  id: string;
  name: string;
  puzzleId: string;
  createdBy: string;
  players: Map<string, PlayerData>;
  gameState: {
    grid: number[][];
    completed: boolean;
    startTime: number;
    solvedBy?: string;
    moves: GameMove[];
  };
  isPrivate: boolean;
  maxPlayers: number;
  settings: RoomSettings;
}

interface PlayerData {
  userId: string;
  email: string;
  username: string;
  isReady: boolean;
  solveTime?: number;
  score: number;
  lastActive: number;
}

interface GameMove {
  userId: string;
  row: number;
  col: number;
  value: number;
  timestamp: number;
  isValid: boolean;
}

interface RoomSettings {
  allowSpectators: boolean;
  showOtherPlayersMoves: boolean;
  enableChat: boolean;
  timeLimit?: number;
  difficulty: string;
}

export class SocketManager {
  private io: Server;
  private rooms: Map<string, RoomData> = new Map();
  private userSockets: Map<string, string> = new Map(); // userId -> socketId
  private onlineUsers: Set<string> = new Set();

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    this.startCleanupTasks();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use((socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as IJWTPayload;
        socket.userId = decoded.userId;
        socket.userEmail = decoded.email;
        
        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });

    // Rate limiting
    this.io.use((socket, next) => {
      const clientId = socket.handshake.address;
      // Implement basic rate limiting logic here
      next();
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`🔗 User ${socket.userId} connected`);
      
      // Track online users
      if (socket.userId) {
        this.onlineUsers.add(socket.userId);
        this.userSockets.set(socket.userId, socket.id);
        this.broadcastOnlineStatus();
      }

      // Room management events
      socket.on('create_room', (data) => this.handleCreateRoom(socket, data));
      socket.on('join_room', (data) => this.handleJoinRoom(socket, data));
      socket.on('leave_room', (data) => this.handleLeaveRoom(socket, data));
      socket.on('get_rooms', () => this.handleGetRooms(socket));

      // Game events
      socket.on('player_ready', (data) => this.handlePlayerReady(socket, data));
      socket.on('make_move', (data) => this.handleMakeMove(socket, data));
      socket.on('request_hint', (data) => this.handleRequestHint(socket, data));
      socket.on('puzzle_completed', (data) => this.handlePuzzleCompleted(socket, data));

      // Chat events
      socket.on('send_message', (data) => this.handleSendMessage(socket, data));
      socket.on('typing_start', (data) => this.handleTypingStart(socket, data));
      socket.on('typing_stop', (data) => this.handleTypingStop(socket, data));

      // Spectator events
      socket.on('spectate_room', (data) => this.handleSpectateRoom(socket, data));

      // Challenge events
      socket.on('send_challenge', (data) => this.handleSendChallenge(socket, data));
      socket.on('challenge_response', (data) => this.handleChallengeResponse(socket, data));

      // Disconnect handler
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  private handleCreateRoom(socket: AuthenticatedSocket, data: any) {
    const roomId = this.generateRoomId();
    const room: RoomData = {
      id: roomId,
      name: data.name || `${socket.userEmail}'s Room`,
      puzzleId: data.puzzleId,
      createdBy: socket.userId!,
      players: new Map(),
      gameState: {
        grid: data.initialGrid || Array(9).fill(null).map(() => Array(9).fill(0)),
        completed: false,
        startTime: Date.now(),
        moves: []
      },
      isPrivate: data.isPrivate || false,
      maxPlayers: data.maxPlayers || 4,
      settings: {
        allowSpectators: data.allowSpectators ?? true,
        showOtherPlayersMoves: data.showOtherPlayersMoves ?? true,
        enableChat: data.enableChat ?? true,
        timeLimit: data.timeLimit,
        difficulty: data.difficulty || 'medium'
      }
    };

    this.rooms.set(roomId, room);
    socket.join(roomId);

    // Add creator as player
    this.addPlayerToRoom(socket, roomId);

    socket.emit('room_created', {
      success: true,
      room: this.serializeRoom(room),
      roomId
    });

    this.broadcastRoomUpdate(roomId);
    
    console.log(`🏠 Room ${roomId} created by ${socket.userId}`);
  }

  private handleJoinRoom(socket: AuthenticatedSocket, data: { roomId: string }) {
    const room = this.rooms.get(data.roomId);
    
    if (!room) {
      socket.emit('room_error', { message: 'Room not found' });
      return;
    }

    if (room.players.size >= room.maxPlayers) {
      socket.emit('room_error', { message: 'Room is full' });
      return;
    }

    if (room.players.has(socket.userId!)) {
      socket.emit('room_error', { message: 'Already in room' });
      return;
    }

    socket.join(data.roomId);
    this.addPlayerToRoom(socket, data.roomId);

    socket.emit('room_joined', {
      success: true,
      room: this.serializeRoom(room)
    });

    // Notify other players
    socket.to(data.roomId).emit('player_joined', {
      player: this.serializePlayer(room.players.get(socket.userId!)!)
    });

    this.broadcastRoomUpdate(data.roomId);
    
    console.log(`👥 User ${socket.userId} joined room ${data.roomId}`);
  }

  private handleLeaveRoom(socket: AuthenticatedSocket, data: { roomId: string }) {
    const room = this.rooms.get(data.roomId);
    if (!room) return;

    socket.leave(data.roomId);
    room.players.delete(socket.userId!);

    // Notify other players
    socket.to(data.roomId).emit('player_left', {
      userId: socket.userId
    });

    // If room is empty or creator left, delete room
    if (room.players.size === 0 || room.createdBy === socket.userId) {
      this.rooms.delete(data.roomId);
      this.io.to(data.roomId).emit('room_closed');
    }

    this.broadcastRoomUpdate(data.roomId);
  }

  private handleMakeMove(socket: AuthenticatedSocket, data: {
    roomId: string;
    row: number;
    col: number;
    value: number;
  }) {
    const room = this.rooms.get(data.roomId);
    if (!room || !room.players.has(socket.userId!)) return;

    // Validate move
    const isValid = this.validateMove(room.gameState.grid, data.row, data.col, data.value);
    
    const move: GameMove = {
      userId: socket.userId!,
      row: data.row,
      col: data.col,
      value: data.value,
      timestamp: Date.now(),
      isValid
    };

    if (isValid) {
      room.gameState.grid[data.row][data.col] = data.value;
      room.gameState.moves.push(move);

      // Check if puzzle is completed
      if (this.isPuzzleCompleted(room.gameState.grid)) {
        room.gameState.completed = true;
        room.gameState.solvedBy = socket.userId!;
        this.handlePuzzleCompletedByRoom(room, socket.userId!);
      }
    }

    // Broadcast move to all players in room
    if (room.settings.showOtherPlayersMoves) {
      this.io.to(data.roomId).emit('move_made', {
        move,
        gameState: room.gameState
      });
    } else {
      socket.emit('move_result', { move, isValid });
    }
  }

  private handleSendMessage(socket: AuthenticatedSocket, data: {
    roomId: string;
    message: string;
  }) {
    const room = this.rooms.get(data.roomId);
    if (!room || !room.settings.enableChat) return;

    const message = {
      id: Date.now().toString(),
      userId: socket.userId!,
      userEmail: socket.userEmail!,
      message: data.message.trim().slice(0, 500), // Limit message length
      timestamp: Date.now()
    };

    // Broadcast message to all players in room
    this.io.to(data.roomId).emit('message_received', message);
  }

  private handleSendChallenge(socket: AuthenticatedSocket, data: {
    targetUserId: string;
    puzzleId: string;
    message?: string;
  }) {
    const targetSocketId = this.userSockets.get(data.targetUserId);
    if (!targetSocketId) {
      socket.emit('challenge_error', { message: 'User is offline' });
      return;
    }

    const challenge = {
      id: Date.now().toString(),
      fromUserId: socket.userId!,
      fromUserEmail: socket.userEmail!,
      puzzleId: data.puzzleId,
      message: data.message,
      timestamp: Date.now()
    };

    this.io.to(targetSocketId).emit('challenge_received', challenge);
    socket.emit('challenge_sent', { success: true });
  }

  private handleDisconnect(socket: AuthenticatedSocket) {
    console.log(`🔌 User ${socket.userId} disconnected`);
    
    if (socket.userId) {
      this.onlineUsers.delete(socket.userId);
      this.userSockets.delete(socket.userId);
      
      // Remove from all rooms
      this.rooms.forEach((room, roomId) => {
        if (room.players.has(socket.userId!)) {
          room.players.delete(socket.userId!);
          socket.to(roomId).emit('player_left', { userId: socket.userId });
          
          if (room.players.size === 0) {
            this.rooms.delete(roomId);
          }
        }
      });

      this.broadcastOnlineStatus();
    }
  }

  private addPlayerToRoom(socket: AuthenticatedSocket, roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const player: PlayerData = {
      userId: socket.userId!,
      email: socket.userEmail!,
      username: socket.userEmail!.split('@')[0],
      isReady: false,
      score: 0,
      lastActive: Date.now()
    };

    room.players.set(socket.userId!, player);
  }

  private validateMove(grid: number[][], row: number, col: number, value: number): boolean {
    if (value === 0) return true; // Allow clearing cells

    // Check row
    for (let c = 0; c < 9; c++) {
      if (c !== col && grid[row][c] === value) return false;
    }

    // Check column
    for (let r = 0; r < 9; r++) {
      if (r !== row && grid[r][col] === value) return false;
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if ((r !== row || c !== col) && grid[r][c] === value) return false;
      }
    }

    return true;
  }

  private isPuzzleCompleted(grid: number[][]): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) return false;
      }
    }
    return true;
  }

  private handlePuzzleCompletedByRoom(room: RoomData, userId: string) {
    const solveTime = Date.now() - room.gameState.startTime;
    const player = room.players.get(userId);
    
    if (player) {
      player.solveTime = solveTime;
      player.score += 1000; // Base score
    }

    this.io.to(room.id).emit('puzzle_completed', {
      solvedBy: userId,
      solveTime,
      finalGrid: room.gameState.grid
    });
  }

  private broadcastRoomUpdate(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    this.io.emit('room_updated', {
      roomId,
      room: this.serializeRoom(room)
    });
  }

  private broadcastOnlineStatus() {
    this.io.emit('online_users_updated', {
      count: this.onlineUsers.size,
      users: Array.from(this.onlineUsers)
    });
  }

  private serializeRoom(room: RoomData) {
    return {
      id: room.id,
      name: room.name,
      puzzleId: room.puzzleId,
      createdBy: room.createdBy,
      players: Array.from(room.players.values()).map(p => this.serializePlayer(p)),
      gameState: {
        ...room.gameState,
        grid: room.settings.showOtherPlayersMoves ? room.gameState.grid : undefined
      },
      isPrivate: room.isPrivate,
      maxPlayers: room.maxPlayers,
      settings: room.settings
    };
  }

  private serializePlayer(player: PlayerData) {
    return {
      userId: player.userId,
      username: player.username,
      isReady: player.isReady,
      score: player.score,
      solveTime: player.solveTime
    };
  }

  private generateRoomId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private startCleanupTasks() {
    // Clean up inactive rooms every 5 minutes
    setInterval(() => {
      const now = Date.now();
      this.rooms.forEach((room, roomId) => {
        const allPlayersInactive = Array.from(room.players.values())
          .every(player => now - player.lastActive > 30 * 60 * 1000); // 30 minutes

        if (allPlayersInactive) {
          this.rooms.delete(roomId);
          this.io.to(roomId).emit('room_closed', { reason: 'inactivity' });
        }
      });
    }, 5 * 60 * 1000);
  }

  // Additional handlers would be implemented here...
  private handlePlayerReady(socket: AuthenticatedSocket, data: any) { /* Implementation */ }
  private handleRequestHint(socket: AuthenticatedSocket, data: any) { /* Implementation */ }
  private handlePuzzleCompleted(socket: AuthenticatedSocket, data: any) { /* Implementation */ }
  private handleGetRooms(socket: AuthenticatedSocket) { /* Implementation */ }
  private handleTypingStart(socket: AuthenticatedSocket, data: any) { /* Implementation */ }
  private handleTypingStop(socket: AuthenticatedSocket, data: any) { /* Implementation */ }
  private handleSpectateRoom(socket: AuthenticatedSocket, data: any) { /* Implementation */ }
  private handleChallengeResponse(socket: AuthenticatedSocket, data: any) { /* Implementation */ }

  // Public methods for external use
  public getOnlineUsersCount(): number {
    return this.onlineUsers.size;
  }

  public getRoomsCount(): number {
    return this.rooms.size;
  }

  public sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
    }
  }

  public broadcastSystemMessage(message: string) {
    this.io.emit('system_message', { message, timestamp: Date.now() });
  }
}