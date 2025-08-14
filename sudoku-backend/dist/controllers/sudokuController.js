"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPuzzle = exports.deletePuzzle = exports.createPuzzle = exports.getUserPuzzles = void 0;
const Sudoku_1 = require("../models/Sudoku");
const getUserPuzzles = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }
        const puzzles = await Sudoku_1.Sudoku.find({ user: userId })
            .sort({ createdAt: -1 })
            .select('title puzzleData createdAt');
        res.status(200).json({
            success: true,
            message: 'Puzzles retrieved successfully',
            data: {
                puzzles,
                count: puzzles.length
            }
        });
    }
    catch (error) {
        console.error('Get puzzles error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving puzzles',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getUserPuzzles = getUserPuzzles;
const createPuzzle = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { title, puzzleData } = req.body;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }
        if (!title || !puzzleData) {
            res.status(400).json({
                success: false,
                message: 'Title and puzzle data are required'
            });
            return;
        }
        const userPuzzleCount = await Sudoku_1.Sudoku.countDocuments({ user: userId });
        if (userPuzzleCount >= 20) {
            res.status(403).json({
                success: false,
                message: 'Maximum of 20 puzzles allowed per user. Please delete some puzzles before adding new ones.'
            });
            return;
        }
        const puzzle = new Sudoku_1.Sudoku({
            user: userId,
            title: title.trim(),
            puzzleData
        });
        await puzzle.save();
        res.status(201).json({
            success: true,
            message: 'Puzzle created successfully',
            data: {
                puzzle: {
                    id: puzzle._id,
                    title: puzzle.title,
                    puzzleData: puzzle.puzzleData,
                    createdAt: puzzle.createdAt
                }
            }
        });
    }
    catch (error) {
        console.error('Create puzzle error:', error);
        if (error instanceof Error && error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                message: 'Validation error',
                error: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Server error while creating puzzle',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.createPuzzle = createPuzzle;
const deletePuzzle = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }
        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Puzzle ID is required'
            });
            return;
        }
        const deletedPuzzle = await Sudoku_1.Sudoku.findOneAndDelete({
            _id: id,
            user: userId
        });
        if (!deletedPuzzle) {
            res.status(404).json({
                success: false,
                message: 'Puzzle not found or you do not have permission to delete it'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Puzzle deleted successfully',
            data: {
                deletedPuzzle: {
                    id: deletedPuzzle._id,
                    title: deletedPuzzle.title
                }
            }
        });
    }
    catch (error) {
        console.error('Delete puzzle error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting puzzle',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.deletePuzzle = deletePuzzle;
const getPuzzle = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }
        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Puzzle ID is required'
            });
            return;
        }
        const puzzle = await Sudoku_1.Sudoku.findOne({
            _id: id,
            user: userId
        });
        if (!puzzle) {
            res.status(404).json({
                success: false,
                message: 'Puzzle not found or you do not have permission to access it'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Puzzle retrieved successfully',
            data: {
                puzzle: {
                    id: puzzle._id,
                    title: puzzle.title,
                    puzzleData: puzzle.puzzleData,
                    createdAt: puzzle.createdAt
                }
            }
        });
    }
    catch (error) {
        console.error('Get puzzle error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving puzzle',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getPuzzle = getPuzzle;
//# sourceMappingURL=sudokuController.js.map