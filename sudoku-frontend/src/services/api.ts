import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  ApiResponse,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  SudokuPuzzle,
  CreatePuzzleData
} from '../types';

/**
 * API configuration
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Create axios instance with base configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

/**
 * Request interceptor to add auth token
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication API
 */
export const authAPI = {
  /**
   * Register a new user
   */
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', credentials);
    return response.data.data!;
  },

  /**
   * Login user
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data!;
  }
};

/**
 * Sudoku API
 */
export const sudokuAPI = {
  /**
   * Get all user puzzles
   */
  getPuzzles: async (): Promise<{ puzzles: SudokuPuzzle[]; count: number }> => {
    const response = await apiClient.get<ApiResponse<{ puzzles: SudokuPuzzle[]; count: number }>>('/sudoku');
    return response.data.data!;
  },

  /**
   * Get a specific puzzle by ID
   */
  getPuzzle: async (id: string): Promise<{ puzzle: SudokuPuzzle }> => {
    const response = await apiClient.get<ApiResponse<{ puzzle: SudokuPuzzle }>>(`/sudoku/${id}`);
    return response.data.data!;
  },

  /**
   * Create a new puzzle
   */
  createPuzzle: async (puzzleData: CreatePuzzleData): Promise<{ puzzle: SudokuPuzzle }> => {
    const response = await apiClient.post<ApiResponse<{ puzzle: SudokuPuzzle }>>('/sudoku', puzzleData);
    return response.data.data!;
  },

  /**
   * Delete a puzzle
   */
  deletePuzzle: async (id: string): Promise<{ deletedPuzzle: { id: string; title: string } }> => {
    const response = await apiClient.delete<ApiResponse<{ deletedPuzzle: { id: string; title: string } }>>(`/sudoku/${id}`);
    return response.data.data!;
  }
};

/**
 * Health check API
 */
export const healthAPI = {
  check: async (): Promise<{ message: string; timestamp: string }> => {
    const response = await apiClient.get<ApiResponse<{ message: string; timestamp: string }>>('/health');
    return response.data.data!;
  }
};

/**
 * Helper function to handle API errors
 */
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

export default apiClient;