// User types
export interface User {
  id: string;
  email: string;
}

// Authentication types
export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

// Sudoku types
export interface SudokuPuzzle {
  id: string;
  title: string;
  puzzleData: number[][];
  createdAt: string;
}

export interface CreatePuzzleData {
  title: string;
  puzzleData: number[][];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Sudoku game state
export interface SudokuGameState {
  puzzle: number[][];
  solution: number[][];
  originalPuzzle: number[][];
  selectedCell: { row: number; col: number } | null;
  isValid: boolean;
  isCompleted: boolean;
  errors: Set<string>; // Set of "row-col" strings for invalid cells
}

// Cell position
export interface CellPosition {
  row: number;
  col: number;
}

// Component props
export interface SudokuCellProps {
  value: number;
  row: number;
  col: number;
  isOriginal: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  isInvalid: boolean;
  onClick: (row: number, col: number) => void;
  onChange: (row: number, col: number, value: number) => void;
}

export interface SudokuGridProps {
  puzzle: number[][];
  originalPuzzle: number[][];
  selectedCell: CellPosition | null;
  onCellClick: (row: number, col: number) => void;
  onCellChange: (row: number, col: number, value: number) => void;
  errors: Set<string>;
}

// Context types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: Set<string>;
  isCompleted: boolean;
}