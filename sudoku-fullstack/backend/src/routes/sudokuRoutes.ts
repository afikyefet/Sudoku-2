import express from 'express';
import { 
  getUserPuzzles, 
  createPuzzle, 
  getPuzzleById, 
  deletePuzzle,
  getPublicPuzzles,
  getPublicPuzzleById,
  getUserProfile,
  getLeaderboard
} from '../controllers/sudokuController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes (no authentication required)
router.get('/public', getPublicPuzzles);           // GET /api/sudoku/public - Get all public puzzles
router.get('/public/:id', getPublicPuzzleById);    // GET /api/sudoku/public/:id - Get any puzzle by ID
router.get('/leaderboard', getLeaderboard);        // GET /api/sudoku/leaderboard - Get user leaderboard

// Protected routes (authentication required)
router.use(authenticateToken);

// GET /api/sudoku/profile - Get user profile
router.get('/profile', getUserProfile);

// GET /api/sudoku - Get all user's puzzles
router.get('/', getUserPuzzles);

// POST /api/sudoku - Create new puzzle
router.post('/', createPuzzle);

// GET /api/sudoku/:id - Get specific puzzle
router.get('/:id', getPuzzleById);

// DELETE /api/sudoku/:id - Delete puzzle
router.delete('/:id', deletePuzzle);

export default router;