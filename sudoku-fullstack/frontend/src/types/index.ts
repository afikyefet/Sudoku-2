// User types
export interface User {
  _id: string;
  email: string;
  username: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  followers: string[];
  following: string[];
  isPublic: boolean;
  isVerified: boolean;
  level: number;
  experience: number;
  achievements: Achievement[];
  stats: UserStats;
  preferences: UserPreferences;
  lastActiveAt: string;
  createdAt: string;
}

export interface Achievement {
  name: string;
  description: string;
  unlockedAt: string;
  icon: string;
}

export interface UserStats {
  totalPuzzlesSolved: number;
  totalPuzzlesCreated: number;
  averageSolveTime: number;
  bestSolveTime: number;
  currentStreak: number;
  longestStreak: number;
}

export interface UserPreferences {
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
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

// Sudoku types
export interface SudokuPuzzle {
  _id: string;
  user: User;
  title: string;
  description?: string;
  puzzleData: number[][];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: 'classic' | 'themed' | 'challenge' | 'community';
  tags: string[];
  isPublic: boolean;
  isFeatured: boolean;
  likes: Like[];
  comments: Comment[];
  solvedBy: SolutionRecord[];
  shares: Share[];
  stats: PuzzleStats;
  createdAt: string;
  updatedAt: string;
  // Virtual fields
  likeCount: number;
  commentCount: number;
  completionRate: number;
}

export interface Like {
  user: string;
  likedAt: string;
}

export interface Comment {
  _id: string;
  user: User;
  content: string;
  createdAt: string;
  likes: Like[];
  replies: Reply[];
}

export interface Reply {
  _id: string;
  user: User;
  content: string;
  createdAt: string;
}

export interface SolutionRecord {
  user: string;
  solvedAt: string;
  solveTime?: number;
  moves: number;
  hintsUsed: number;
}

export interface Share {
  user: string;
  sharedAt: string;
  platform: 'twitter' | 'facebook' | 'link' | 'discord';
}

export interface PuzzleStats {
  views: number;
  attempts: number;
  completions: number;
  averageSolveTime: number;
  rating: number;
  ratingCount: number;
}

export interface SudokuResponse {
  success: boolean;
  message: string;
  data?: {
    puzzle?: SudokuPuzzle;
    puzzles?: SudokuPuzzle[];
    count?: number;
    userInteractions?: {
      isLiked: boolean;
      isFollowing: boolean;
      isOwner: boolean;
    };
  };
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

// Notification types
export interface Notification {
  _id: string;
  recipient: string;
  sender: User;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'puzzle_shared' | 'achievement';
  message: string;
  relatedPuzzle?: SudokuPuzzle;
  relatedComment?: string;
  isRead: boolean;
  createdAt: string;
}

// Social types
export interface CommentInput {
  content: string;
  parentCommentId?: string;
}

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
  search?: string;
  page?: number;
  limit?: number;
}

// Room types (for multiplayer)
export interface Room {
  _id: string;
  name: string;
  description?: string;
  host: User;
  puzzle: SudokuPuzzle;
  participants: RoomParticipant[];
  maxParticipants: number;
  isPublic: boolean;
  isActive: boolean;
  gameMode: 'collaborative' | 'competitive' | 'race';
  settings: {
    allowHints: boolean;
    showTimer: boolean;
    showOtherProgress: boolean;
  };
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
}

export interface RoomParticipant {
  user: User;
  joinedAt: string;
  isActive: boolean;
  currentGrid?: number[][];
  score: number;
  completedAt?: string;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// API types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

// Sudoku game types
export interface SudokuGameState {
  originalPuzzle: number[][];
  currentPuzzle: number[][];
  solution?: number[][];
  selectedCell: { row: number; col: number } | null;
  isCompleted: boolean;
  errors: Set<string>;
  startTime: number;
  endTime?: number;
  moves: number;
  hintsUsed: number;
}

// Socket types
export interface SocketEvents {
  join_user_room: (userId: string) => void;
  join_puzzle_room: (puzzleId: string) => void;
  leave_puzzle_room: (puzzleId: string) => void;
  puzzle_progress: (data: {
    puzzleId: string;
    grid: number[][];
    cellPosition: { row: number; col: number };
    value: number;
  }) => void;
  user_joined_puzzle: (data: { socketId: string; timestamp: Date }) => void;
  user_left_puzzle: (data: { socketId: string; timestamp: Date }) => void;
  live_puzzle_update: (data: {
    socketId: string;
    grid: number[][];
    cellPosition: { row: number; col: number };
    value: number;
    timestamp: Date;
  }) => void;
  notification: (notification: Notification) => void;
}