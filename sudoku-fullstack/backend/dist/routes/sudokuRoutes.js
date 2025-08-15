"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sudokuController_1 = require("../controllers/sudokuController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes (no authentication required)
router.get('/public', sudokuController_1.getPublicPuzzles); // GET /api/sudoku/public - Get all public puzzles
router.get('/public/:id', sudokuController_1.getPublicPuzzleById); // GET /api/sudoku/public/:id - Get any puzzle by ID
router.get('/leaderboard', sudokuController_1.getLeaderboard); // GET /api/sudoku/leaderboard - Get user leaderboard
// Protected routes (authentication required)
router.use(auth_1.authenticateToken);
// GET /api/sudoku/profile - Get user profile
router.get('/profile', sudokuController_1.getUserProfile);
// GET /api/sudoku - Get all user's puzzles
router.get('/', sudokuController_1.getUserPuzzles);
// POST /api/sudoku - Create new puzzle
router.post('/', sudokuController_1.createPuzzle);
// GET /api/sudoku/:id - Get specific puzzle
router.get('/:id', sudokuController_1.getPuzzleById);
// DELETE /api/sudoku/:id - Delete puzzle
router.delete('/:id', sudokuController_1.deletePuzzle);
exports.default = router;
//# sourceMappingURL=sudokuRoutes.js.map