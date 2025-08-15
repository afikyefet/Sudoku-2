import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';
import { Notification } from '../types';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    joinPuzzleRoom: (puzzleId: string) => void;
    leavePuzzleRoom: (puzzleId: string) => void;
    sendPuzzleProgress: (puzzleId: string, grid: number[][], cellPosition: { row: number; col: number }, value: number) => void;
    activePlayers: { [puzzleId: string]: number };
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
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
    const [activePlayers, setActivePlayers] = useState<{ [puzzleId: string]: number }>({});
    const { user, token } = useAuth();

    useEffect(() => {
        if (user && token) {
            // Initialize socket connection
            const socketInstance = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
                auth: {
                    token
                },
                autoConnect: true
            });

            // Connection event handlers
            socketInstance.on('connect', () => {
                console.log('🔌 Connected to server');
                setIsConnected(true);

                // Join user's personal room for notifications
                socketInstance.emit('join_user_room', user._id);
            });

            socketInstance.on('disconnect', () => {
                console.log('🔌 Disconnected from server');
                setIsConnected(false);
            });

            socketInstance.on('connect_error', (error) => {
                console.error('🔌 Connection error:', error);
                setIsConnected(false);
            });

            // Notification handlers
            socketInstance.on('notification', (notification: Notification) => {
                toast.success(notification.message, {
                    duration: 5000,
                    icon: '🔔',
                });
            });

            // Puzzle room handlers
            socketInstance.on('user_joined_puzzle', (data: { socketId: string; timestamp: Date }) => {
                console.log('👤 User joined puzzle room:', data);
                // Update active players count (simplified)
            });

            socketInstance.on('user_left_puzzle', (data: { socketId: string; timestamp: Date }) => {
                console.log('👤 User left puzzle room:', data);
                // Update active players count (simplified)
            });

            socketInstance.on('live_puzzle_update', (data: {
                socketId: string;
                grid: number[][];
                cellPosition: { row: number; col: number };
                value: number;
                timestamp: Date;
            }) => {
                console.log('🧩 Live puzzle update:', data);
                // This would be handled by the puzzle editor component
                // For now, just show a toast for demonstration
                if (data.value !== 0) {
                    toast(`Someone placed ${data.value} at ${data.cellPosition.row + 1},${data.cellPosition.col + 1}`, {
                        duration: 2000,
                        icon: '👥',
                    });
                }
            });

            setSocket(socketInstance);

            return () => {
                socketInstance.disconnect();
            };
        } else {
            // Disconnect if user logs out
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
        }
    }, [user, token]);

    const joinPuzzleRoom = (puzzleId: string) => {
        if (socket && isConnected) {
            socket.emit('join_puzzle_room', puzzleId);
            console.log(`🧩 Joined puzzle room: ${puzzleId}`);
        }
    };

    const leavePuzzleRoom = (puzzleId: string) => {
        if (socket && isConnected) {
            socket.emit('leave_puzzle_room', puzzleId);
            console.log(`🧩 Left puzzle room: ${puzzleId}`);
        }
    };

    const sendPuzzleProgress = (
        puzzleId: string,
        grid: number[][],
        cellPosition: { row: number; col: number },
        value: number
    ) => {
        if (socket && isConnected) {
            socket.emit('puzzle_progress', {
                puzzleId,
                grid,
                cellPosition,
                value
            });
        }
    };

    const value: SocketContextType = {
        socket,
        isConnected,
        joinPuzzleRoom,
        leavePuzzleRoom,
        sendPuzzleProgress,
        activePlayers
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
