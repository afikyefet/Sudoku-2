import express from 'express';
import { 
  getUserPuzzles, 
  createPuzzle, 
  getPuzzleById, 
  deletePuzzle 
} from '../controllers/sudokuController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/sudoku - Get all user's puzzles
router.get('/', getUserPuzzles);

// POST /api/sudoku - Create new puzzle
router.post('/', createPuzzle);

// GET /api/sudoku/:id - Get specific puzzle
router.get('/:id', getPuzzleById);

// DELETE /api/sudoku/:id - Delete puzzle
router.delete('/:id', deletePuzzle);

export default router;