import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { message, notification } from 'antd';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: number;
  activeRooms: number;
  
  // Room management
  createRoom: (roomData: CreateRoomData) => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => void;
  
  // Game actions
  makeMove: (roomId: string, row: number, col: number, value: number) => void;
  sendMessage: (roomId: string, message: string) => void;
  sendChallenge: (targetUserId: string, puzzleId: string, message?: string) => void;
  
  // Event listeners
  onRoomJoined: (callback: (data: any) => void) => () => void;
  onPlayerJoined: (callback: (data: any) => void) => () => void;
  onPlayerLeft: (callback: (data: any) => void) => () => void;
  onMoveMade: (callback: (data: any) => void) => () => void;
  onMessageReceived: (callback: (data: any) => void) => () => void;
  onChallengeReceived: (callback: (data: any) => void) => () => void;
  onPuzzleCompleted: (callback: (data: any) => void) => () => void;
  onRoomClosed: (callback: () => void) => () => void;
}

interface CreateRoomData {
  name?: string;
  puzzleId: string;
  isPrivate?: boolean;
  maxPlayers?: number;
  allowSpectators?: boolean;
  showOtherPlayersMoves?: boolean;
  enableChat?: boolean;
  timeLimit?: number;
  difficulty?: string;
  initialGrid?: number[][];
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [activeRooms, setActiveRooms] = useState(0);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const { user, token } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (!token || !user) {
      // Disconnect if no auth
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5001', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('🔗 WebSocket connected');
      setIsConnected(true);
      setReconnectAttempts(0);
      message.success('Connected to real-time server');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        newSocket.connect();
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      setReconnectAttempts(prev => prev + 1);
      
      if (reconnectAttempts < 3) {
        message.warning('Connection issues, retrying...');
      } else {
        message.error('Unable to connect to real-time server');
      }
    });

    // Global event handlers
    newSocket.on('online_users_updated', (data) => {
      setOnlineUsers(data.count);
    });

    newSocket.on('room_updated', (data) => {
      // Handle room updates if needed
    });

    newSocket.on('system_message', (data) => {
      notification.info({
        message: 'System Notification',
        description: data.message,
        duration: 5,
      });
    });

    newSocket.on('notification', (data) => {
      notification.open({
        ...data,
        duration: data.duration || 4.5,
      });
    });

    newSocket.on('challenge_received', (challenge) => {
      notification.success({
        message: 'Challenge Received!',
        description: `${challenge.fromUserEmail} challenged you to a puzzle!`,
        duration: 10,
        btn: (
          <div>
            <button 
              onClick={() => {
                newSocket.emit('challenge_response', { 
                  challengeId: challenge.id, 
                  accepted: true 
                });
                notification.destroy(challenge.id);
              }}
              style={{ marginRight: 8 }}
            >
              Accept
            </button>
            <button 
              onClick={() => {
                newSocket.emit('challenge_response', { 
                  challengeId: challenge.id, 
                  accepted: false 
                });
                notification.destroy(challenge.id);
              }}
            >
              Decline
            </button>
          </div>
        ),
        key: challenge.id,
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);

  // Room management functions
  const createRoom = useCallback(async (roomData: CreateRoomData): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected) {
        reject(new Error('Not connected to server'));
        return;
      }

      socket.emit('create_room', roomData);
      
      const handleRoomCreated = (response: any) => {
        socket.off('room_created', handleRoomCreated);
        socket.off('room_error', handleRoomError);
        
        if (response.success) {
          message.success('Room created successfully!');
          resolve();
        } else {
          reject(new Error(response.message));
        }
      };

      const handleRoomError = (error: any) => {
        socket.off('room_created', handleRoomCreated);
        socket.off('room_error', handleRoomError);
        reject(new Error(error.message));
      };

      socket.on('room_created', handleRoomCreated);
      socket.on('room_error', handleRoomError);

      // Timeout after 10 seconds
      setTimeout(() => {
        socket.off('room_created', handleRoomCreated);
        socket.off('room_error', handleRoomError);
        reject(new Error('Room creation timeout'));
      }, 10000);
    });
  }, [socket, isConnected]);

  const joinRoom = useCallback(async (roomId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected) {
        reject(new Error('Not connected to server'));
        return;
      }

      socket.emit('join_room', { roomId });
      
      const handleRoomJoined = (response: any) => {
        socket.off('room_joined', handleRoomJoined);
        socket.off('room_error', handleRoomError);
        
        if (response.success) {
          message.success('Joined room successfully!');
          resolve();
        } else {
          reject(new Error(response.message));
        }
      };

      const handleRoomError = (error: any) => {
        socket.off('room_joined', handleRoomJoined);
        socket.off('room_error', handleRoomError);
        reject(new Error(error.message));
      };

      socket.on('room_joined', handleRoomJoined);
      socket.on('room_error', handleRoomError);

      setTimeout(() => {
        socket.off('room_joined', handleRoomJoined);
        socket.off('room_error', handleRoomError);
        reject(new Error('Room join timeout'));
      }, 10000);
    });
  }, [socket, isConnected]);

  const leaveRoom = useCallback((roomId: string) => {
    if (socket && isConnected) {
      socket.emit('leave_room', { roomId });
    }
  }, [socket, isConnected]);

  // Game action functions
  const makeMove = useCallback((roomId: string, row: number, col: number, value: number) => {
    if (socket && isConnected) {
      socket.emit('make_move', { roomId, row, col, value });
    }
  }, [socket, isConnected]);

  const sendMessage = useCallback((roomId: string, messageText: string) => {
    if (socket && isConnected) {
      socket.emit('send_message', { roomId, message: messageText });
    }
  }, [socket, isConnected]);

  const sendChallenge = useCallback((targetUserId: string, puzzleId: string, messageText?: string) => {
    if (socket && isConnected) {
      socket.emit('send_challenge', { 
        targetUserId, 
        puzzleId, 
        message: messageText 
      });
    }
  }, [socket, isConnected]);

  // Event listener functions
  const createEventListener = useCallback((eventName: string) => {
    return (callback: (data: any) => void) => {
      if (socket) {
        socket.on(eventName, callback);
        
        // Return cleanup function
        return () => {
          socket.off(eventName, callback);
        };
      }
      
      return () => {}; // No-op cleanup for when socket is null
    };
  }, [socket]);

  const onRoomJoined = createEventListener('room_joined');
  const onPlayerJoined = createEventListener('player_joined');
  const onPlayerLeft = createEventListener('player_left');
  const onMoveMade = createEventListener('move_made');
  const onMessageReceived = createEventListener('message_received');
  const onChallengeReceived = createEventListener('challenge_received');
  const onPuzzleCompleted = createEventListener('puzzle_completed');
  const onRoomClosed = createEventListener('room_closed');

  const contextValue: SocketContextType = {
    socket,
    isConnected,
    onlineUsers,
    activeRooms,
    createRoom,
    joinRoom,
    leaveRoom,
    makeMove,
    sendMessage,
    sendChallenge,
    onRoomJoined,
    onPlayerJoined,
    onPlayerLeft,
    onMoveMade,
    onMessageReceived,
    onChallengeReceived,
    onPuzzleCompleted,
    onRoomClosed,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};