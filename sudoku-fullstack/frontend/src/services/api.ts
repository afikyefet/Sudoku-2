import axios from 'axios';
import type {
  ApiResponse,
  AuthResponse,
  CommentInput,
  Notification,
  PaginatedResponse,
  PuzzleFilters,
  SudokuInput,
  SudokuPuzzle,
  SudokuResponse
} from '../types';

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
  register: async (email: string, username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', { email, username, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

// Sudoku API
export const sudokuAPI = {
  // User's personal puzzles
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

  // Public puzzles with filters
  getPublicPuzzles: async (filters: PuzzleFilters = {}): Promise<PaginatedResponse<SudokuPuzzle>> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await api.get(`/sudoku/public?${params.toString()}`);
    return response.data;
  },

  getPublicPuzzleById: async (id: string): Promise<SudokuResponse> => {
    const response = await api.get(`/sudoku/public/${id}`);
    return response.data;
  },

  // User profile and stats
  getUserProfile: async (): Promise<ApiResponse> => {
    const response = await api.get('/sudoku/profile');
    return response.data;
  },

  getLeaderboard: async (): Promise<ApiResponse> => {
    const response = await api.get('/sudoku/leaderboard');
    return response.data;
  },
};

// Social API
export const socialAPI = {
  // Likes
  toggleLike: async (puzzleId: string): Promise<ApiResponse> => {
    const response = await api.post(`/social/puzzles/${puzzleId}/like`);
    return response.data;
  },

  // Comments
  addComment: async (puzzleId: string, comment: CommentInput): Promise<ApiResponse> => {
    const response = await api.post(`/social/puzzles/${puzzleId}/comment`, comment);
    return response.data;
  },

  // Follow/Unfollow
  toggleFollow: async (userId: string): Promise<ApiResponse> => {
    const response = await api.post(`/social/users/${userId}/follow`);
    return response.data;
  },

  // Share
  sharePuzzle: async (puzzleId: string, platform: string): Promise<ApiResponse> => {
    const response = await api.post(`/social/puzzles/${puzzleId}/share`, { platform });
    return response.data;
  },

  // Notifications
  getNotifications: async (page = 1, limit = 20): Promise<PaginatedResponse<Notification>> => {
    const response = await api.get(`/social/notifications?page=${page}&limit=${limit}`);
    return response.data;
  },

  markNotificationsRead: async (notificationIds?: string[]): Promise<ApiResponse> => {
    const response = await api.patch('/social/notifications/read', { notificationIds });
    return response.data;
  },
};

// Search API
export const searchAPI = {
  searchPuzzles: async (query: string, filters: PuzzleFilters = {}): Promise<PaginatedResponse<SudokuPuzzle>> => {
    const params = new URLSearchParams({ search: query });

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await api.get(`/sudoku/public?${params.toString()}`);
    return response.data;
  },

  getTrendingPuzzles: async (limit = 10): Promise<ApiResponse<SudokuPuzzle[]>> => {
    const response = await api.get(`/sudoku/public?sortBy=trending&limit=${limit}`);
    return response.data;
  },

  getFeaturedPuzzles: async (): Promise<ApiResponse<SudokuPuzzle[]>> => {
    const response = await api.get('/sudoku/public?featured=true');
    return response.data;
  },
};

// Analytics API (for tracking user interactions)
export const analyticsAPI = {
  trackPuzzleView: async (puzzleId: string): Promise<void> => {
    try {
      await api.post(`/analytics/puzzles/${puzzleId}/view`);
    } catch (error) {
      console.warn('Failed to track puzzle view:', error);
    }
  },

  trackPuzzleStart: async (puzzleId: string): Promise<void> => {
    try {
      await api.post(`/analytics/puzzles/${puzzleId}/start`);
    } catch (error) {
      console.warn('Failed to track puzzle start:', error);
    }
  },

  trackPuzzleComplete: async (
    puzzleId: string,
    solveTime: number,
    moves: number,
    hintsUsed: number
  ): Promise<void> => {
    try {
      await api.post(`/analytics/puzzles/${puzzleId}/complete`, {
        solveTime,
        moves,
        hintsUsed
      });
    } catch (error) {
      console.warn('Failed to track puzzle completion:', error);
    }
  },
};

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;