import { Request, Response } from 'express';
import { Sudoku } from '../models/Sudoku';
import { SudokuInput, ApiResponse } from '../types';

// Get all puzzles for authenticated user
export const getUserPuzzles = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as ApiResponse);
      return;
    }

    const puzzles = await Sudoku.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      message: 'Puzzles retrieved successfully',
      data: {
        puzzles,
        count: puzzles.length
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Get puzzles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving puzzles'
    } as ApiResponse);
  }
};

// Create new puzzle
export const createPuzzle = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as ApiResponse);
      return;
    }

    const { title, puzzleData }: SudokuInput = req.body;

    // Validate input
    if (!title || !puzzleData) {
      res.status(400).json({
        success: false,
        message: 'Title and puzzle data are required'
      } as ApiResponse);
      return;
    }

    // Check if user already has 20 puzzles
    const userPuzzleCount = await Sudoku.countDocuments({ user: req.user.userId });
    if (userPuzzleCount >= 20) {
      res.status(400).json({
        success: false,
        message: 'Maximum of 20 puzzles allowed per user. Please delete some puzzles first.'
      } as ApiResponse);
      return;
    }

    // Validate puzzle data format (9x9 grid with numbers 0-9)
    if (!Array.isArray(puzzleData) || puzzleData.length !== 9) {
      res.status(400).json({
        success: false,
        message: 'Puzzle data must be a 9x9 grid'
      } as ApiResponse);
      return;
    }

    const isValidGrid = puzzleData.every(row => 
      Array.isArray(row) && 
      row.length === 9 && 
      row.every(cell => 
        Number.isInteger(cell) && cell >= 0 && cell <= 9
      )
    );

    if (!isValidGrid) {
      res.status(400).json({
        success: false,
        message: 'Invalid puzzle format. Each cell must be a number between 0-9 (0 for empty cells)'
      } as ApiResponse);
      return;
    }

    // Create new puzzle
    const puzzle = new Sudoku({
      user: req.user.userId,
      title: title.trim(),
      puzzleData
    });

    await puzzle.save();

    res.status(201).json({
      success: true,
      message: 'Puzzle created successfully',
      data: { puzzle }
    } as ApiResponse);

  } catch (error) {
    console.error('Create puzzle error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating puzzle'
    } as ApiResponse);
  }
};

// Get single puzzle by ID
export const getPuzzleById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as ApiResponse);
      return;
    }

    const { id } = req.params;
    
    const puzzle = await Sudoku.findOne({ 
      _id: id, 
      user: req.user.userId 
    });

    if (!puzzle) {
      res.status(404).json({
        success: false,
        message: 'Puzzle not found'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Puzzle retrieved successfully',
      data: { puzzle }
    } as ApiResponse);

  } catch (error) {
    console.error('Get puzzle error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving puzzle'
    } as ApiResponse);
  }
};

// Delete puzzle
export const deletePuzzle = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as ApiResponse);
      return;
    }

    const { id } = req.params;
    
    const puzzle = await Sudoku.findOneAndDelete({ 
      _id: id, 
      user: req.user.userId 
    });

    if (!puzzle) {
      res.status(404).json({
        success: false,
        message: 'Puzzle not found'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Puzzle deleted successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Delete puzzle error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting puzzle'
    } as ApiResponse);
  }
};