"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPuzzle = exports.deletePuzzle = exports.createPuzzle = exports.getUserPuzzles = void 0;
const Sudoku_1 = require("../models/Sudoku");
const mockData_1 = require("../utils/mockData");
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
        let puzzles;
        try {
            puzzles = await Sudoku_1.Sudoku.find({ user: userId })
                .sort({ createdAt: -1 })
                .select('title puzzleData createdAt');
        }
        catch (dbError) {
            console.log('MongoDB not available, using mock database');
            puzzles = await mockData_1.mockDB.findSudokusByUser(userId);
        }
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
        let puzzle;
        try {
            const userPuzzleCount = await Sudoku_1.Sudoku.countDocuments({ user: userId });
            if (userPuzzleCount >= 20) {
                res.status(403).json({
                    success: false,
                    message: 'Maximum of 20 puzzles allowed per user. Please delete some puzzles before adding new ones.'
                });
                return;
            }
            puzzle = new Sudoku_1.Sudoku({
                user: userId,
                title: title.trim(),
                puzzleData
            });
            await puzzle.save();
        }
        catch (dbError) {
            console.log('MongoDB not available, using mock database');
            const userPuzzleCount = await mockData_1.mockDB.countSudokusByUser(userId);
            if (userPuzzleCount >= 20) {
                res.status(403).json({
                    success: false,
                    message: 'Maximum of 20 puzzles allowed per user. Please delete some puzzles before adding new ones.'
                });
                return;
            }
            puzzle = await mockData_1.mockDB.createSudoku(userId, title.trim(), puzzleData);
        }
        res.status(201).json({
            success: true,
            message: 'Puzzle created successfully',
            data: {
                puzzle: {
                    id: puzzle._id || puzzle.id,
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
        let deletedPuzzle;
        try {
            deletedPuzzle = await Sudoku_1.Sudoku.findOneAndDelete({
                _id: id,
                user: userId
            });
        }
        catch (dbError) {
            console.log('MongoDB not available, using mock database');
            deletedPuzzle = await mockData_1.mockDB.deleteSudoku(id, userId);
        }
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
                    id: deletedPuzzle._id || deletedPuzzle.id,
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
        let puzzle;
        try {
            puzzle = await Sudoku_1.Sudoku.findOne({
                _id: id,
                user: userId
            });
        }
        catch (dbError) {
            console.log('MongoDB not available, using mock database');
            puzzle = await mockData_1.mockDB.findSudokuById(id, userId);
        }
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
                    id: puzzle._id || puzzle.id,
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