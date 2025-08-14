import { Router } from 'express';
import { 
  getUserPuzzles, 
  createPuzzle, 
  deletePuzzle, 
  getPuzzle 
} from '../controllers/sudokuController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   GET /api/sudoku
 * @desc    Get all puzzles for authenticated user
 * @access  Private
 */
router.get('/', getUserPuzzles);

/**
 * @route   POST /api/sudoku
 * @desc    Create a new puzzle
 * @access  Private
 */
router.post('/', createPuzzle);

/**
 * @route   GET /api/sudoku/:id
 * @desc    Get a specific puzzle by ID
 * @access  Private
 */
router.get('/:id', getPuzzle);

/**
 * @route   DELETE /api/sudoku/:id
 * @desc    Delete a puzzle by ID
 * @access  Private
 */
router.delete('/:id', deletePuzzle);

export default router;