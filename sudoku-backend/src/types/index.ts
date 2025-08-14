import { Request } from 'express';
import { Document } from 'mongoose';

// User related types
export interface IUser extends Document {
  email: string;
  password: string;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Sudoku related types
export interface ISudoku extends Document {
  user: string; // User ID
  title: string;
  puzzleData: number[][]; // 9x9 array of numbers (0 for empty cells)
  createdAt: Date;
}

// JWT Payload
export interface IJWTPayload {
  userId: string;
  email: string;
}

// Request with user
export interface IAuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

// API Response types
export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Auth response
export interface IAuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}