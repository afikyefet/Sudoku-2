// User types
export interface User {
  id: string;
  email: string;
  createdAt: string;
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
  user: string;
  title: string;
  puzzleData: number[][];
  createdAt: string;
}

export interface SudokuResponse {
  success: boolean;
  message: string;
  data?: {
    puzzle?: SudokuPuzzle;
    puzzles?: SudokuPuzzle[];
    count?: number;
  };
}

export interface SudokuInput {
  title: string;
  puzzleData: number[][];
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// API types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// Sudoku game types
export interface SudokuGameState {
  puzzle: number[][];
  solution: number[][];
  selectedCell: { row: number; col: number } | null;
  isCompleted: boolean;
  errors: Set<string>;
}