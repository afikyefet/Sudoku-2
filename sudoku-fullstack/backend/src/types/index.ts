import { Document } from 'mongoose';

// User types
export interface IUser extends Document {
  email: string;
  password: string;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserPayload {
  userId: string;
  email: string;
}

// Sudoku types
export interface ISudoku extends Document {
  user: string;
  title: string;
  puzzleData: number[][];
  createdAt: Date;
}

export interface SudokuInput {
  title: string;
  puzzleData: number[][];
}

// Auth types
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}