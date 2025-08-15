import axios from 'axios';
import { AuthResponse, SudokuInput, SudokuResponse } from '../types/index.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sudoku_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('sudoku_token');
      localStorage.removeItem('sudoku_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

// Sudoku API
export const sudokuAPI = {
  getAllPuzzles: async (): Promise<SudokuResponse> => {
    const response = await api.get('/sudoku');
    return response.data;
  },

  getPuzzleById: async (id: string): Promise<SudokuResponse> => {
    const response = await api.get(`/sudoku/${id}`);
    return response.data;
  },

  createPuzzle: async (puzzleData: SudokuInput): Promise<SudokuResponse> => {
    const response = await api.post('/sudoku', puzzleData);
    return response.data;
  },

  deletePuzzle: async (id: string): Promise<SudokuResponse> => {
    const response = await api.delete(`/sudoku/${id}`);
    return response.data;
  },
};

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;