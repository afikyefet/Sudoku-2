import mongoose, { Document } from 'mongoose';

// User types
export interface IUser extends Document {
  email: string;
  username: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  password: string;
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  isPublic: boolean;
  isVerified: boolean;
  level: number;
  experience: number;
  achievements: Array<{
    name: string;
    description: string;
    unlockedAt: Date;
    icon: string;
  }>;
  stats: {
    totalPuzzlesSolved: number;
    totalPuzzlesCreated: number;
    averageSolveTime: number;
    bestSolveTime: number;
    currentStreak: number;
    longestStreak: number;
  };
  preferences: {
    notifications: {
      likes: boolean;
      comments: boolean;
      follows: boolean;
      mentions: boolean;
    };
    privacy: {
      showStats: boolean;
      showActivity: boolean;
    };
  };
  lastActiveAt: Date;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserPayload {
  userId: string;
  email: string;
  username: string;
}

// Sudoku types
export interface ISudoku extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  puzzleData: number[][];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: 'classic' | 'themed' | 'challenge' | 'community';
  tags: string[];
  isPublic: boolean;
  isFeatured: boolean;
  likes: Array<{
    user: mongoose.Types.ObjectId;
    likedAt: Date;
  }>;
  comments: Array<{
    user: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
    likes: Array<{
      user: mongoose.Types.ObjectId;
      likedAt: Date;
    }>;
    replies: Array<{
      user: mongoose.Types.ObjectId;
      content: string;
      createdAt: Date;
    }>;
  }>;
  solvedBy: Array<{
    user: mongoose.Types.ObjectId;
    solvedAt: Date;
    solveTime?: number;
    moves: number;
    hintsUsed: number;
  }>;
  shares: Array<{
    user: mongoose.Types.ObjectId;
    sharedAt: Date;
    platform: 'twitter' | 'facebook' | 'link' | 'discord';
  }>;
  reports: Array<{
    user: mongoose.Types.ObjectId;
    reason: string;
    reportedAt: Date;
  }>;
  stats: {
    views: number;
    attempts: number;
    completions: number;
    averageSolveTime: number;
    rating: number;
    ratingCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SudokuInput {
  title: string;
  description?: string;
  puzzleData: number[][];
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  category?: 'classic' | 'themed' | 'challenge' | 'community';
  tags?: string[];
  isPublic?: boolean;
}

// Comment types
export interface CommentInput {
  content: string;
  parentCommentId?: string;
}

// Rating types
export interface RatingInput {
  rating: number; // 1-5
}

// Auth types
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}

// Social types
export interface FollowAction {
  targetUserId: string;
}

export interface LikeAction {
  puzzleId?: string;
  commentId?: string;
}

export interface ShareAction {
  puzzleId: string;
  platform: 'twitter' | 'facebook' | 'link' | 'discord';
}

// Search and filter types
export interface PuzzleFilters {
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  category?: 'classic' | 'themed' | 'challenge' | 'community';
  tags?: string[];
  author?: string;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'trending' | 'rating';
  page?: number;
  limit?: number;
}

// Room types (for multiplayer)
export interface IRoomParticipant {
  user: mongoose.Types.ObjectId;
  joinedAt: Date;
  isActive: boolean;
  currentGrid?: number[][];
  score: number;
  completedAt?: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedPayload<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<PaginatedPayload<T>> { }