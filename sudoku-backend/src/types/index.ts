import { Request } from 'express';
import { Document } from 'mongoose';

// User interface
export interface IUser {
  _id?: string;
  email: string;
  username?: string;
  password: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  stats?: {
    puzzlesCreated: number;
    puzzlesSolved: number;
    averageTimeToSolve: number;
    favoritePuzzles: string[];
    recentlySolved: string[];
  };
}

// Sudoku puzzle interface with enhanced features
export interface ISudoku {
  _id?: string;
  user: string;
  title: string;
  description?: string;
  puzzleData: number[][];
  solutionData: number[][];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'master';
  difficultyScore: number; // Numerical difficulty rating
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  solvedBy: string[];
  favorites: string[];
  averageTimeToSolve?: number;
  hints: number; // Number of pre-filled cells
  rating: number; // Average user rating
  ratingCount: number;
}

// Game state for saving progress
export interface IGameState {
  _id?: string;
  user: string;
  puzzle: string;
  currentGrid: number[][];
  timeSpent: number;
  isCompleted: boolean;
  hintsUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

// User rating for puzzles
export interface IPuzzleRating {
  _id?: string;
  user: string;
  puzzle: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

// JWT payload interface
export interface IJWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Extended request interface
export interface IAuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

// API response interfaces
export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface IAuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username?: string;
    avatar?: string;
  };
}

// Request interfaces for authentication
export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  email: string;
  password: string;
  username?: string;
}

// Puzzle creation interfaces
export interface ICreatePuzzleRequest {
  title: string;
  description?: string;
  puzzleData: number[][];
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert' | 'master';
  tags?: string[];
  isPublic?: boolean;
}

export interface IPuzzleSearchQuery {
  difficulty?: string;
  tags?: string[];
  sortBy?: 'created' | 'difficulty' | 'rating' | 'popular';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  search?: string;
}

// Game progress interfaces
export interface IGameProgress {
  puzzle: string;
  currentGrid: number[][];
  timeSpent: number;
  hintsUsed: number;
}

export interface IUserStats {
  puzzlesCreated: number;
  puzzlesSolved: number;
  averageTimeToSolve: number;
  favoritePuzzles: ISudoku[];
  recentlySolved: ISudoku[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
}