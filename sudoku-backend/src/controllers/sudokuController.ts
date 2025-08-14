import { Response } from 'express';
import { Sudoku } from '../models/Sudoku';
import { IAuthRequest, IApiResponse } from '../types';

/**
 * Get all puzzles for the authenticated user
 */
export const getUserPuzzles = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as IApiResponse);
      return;
    }

    // Get all puzzles for the user, sorted by creation date (newest first)
    const puzzles = await Sudoku.find({ user: userId })
      .sort({ createdAt: -1 })
      .select('title puzzleData createdAt');

    res.status(200).json({
      success: true,
      message: 'Puzzles retrieved successfully',
      data: {
        puzzles,
        count: puzzles.length
      }
    } as IApiResponse);

  } catch (error) {
    console.error('Get puzzles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving puzzles',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as IApiResponse);
  }
};

/**
 * Create a new puzzle for the authenticated user
 */
export const createPuzzle = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { title, puzzleData } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as IApiResponse);
      return;
    }

    // Validate input
    if (!title || !puzzleData) {
      res.status(400).json({
        success: false,
        message: 'Title and puzzle data are required'
      } as IApiResponse);
      return;
    }

    // Check if user has reached the 20 puzzle limit
    const userPuzzleCount = await Sudoku.countDocuments({ user: userId });
    if (userPuzzleCount >= 20) {
      res.status(403).json({
        success: false,
        message: 'Maximum of 20 puzzles allowed per user. Please delete some puzzles before adding new ones.'
      } as IApiResponse);
      return;
    }

    // Create new puzzle
    const puzzle = new Sudoku({
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
    } as IApiResponse);

  } catch (error) {
    console.error('Create puzzle error:', error);
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      } as IApiResponse);
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating puzzle',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as IApiResponse);
  }
};

/**
 * Delete a puzzle (only if it belongs to the authenticated user)
 */
export const deletePuzzle = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as IApiResponse);
      return;
    }

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Puzzle ID is required'
      } as IApiResponse);
      return;
    }

    // Find and delete puzzle (only if it belongs to the user)
    const deletedPuzzle = await Sudoku.findOneAndDelete({
      _id: id,
      user: userId
    });

    if (!deletedPuzzle) {
      res.status(404).json({
        success: false,
        message: 'Puzzle not found or you do not have permission to delete it'
      } as IApiResponse);
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
    } as IApiResponse);

  } catch (error) {
    console.error('Delete puzzle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting puzzle',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as IApiResponse);
  }
};

/**
 * Get a specific puzzle by ID (only if it belongs to the authenticated user)
 */
export const getPuzzle = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as IApiResponse);
      return;
    }

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Puzzle ID is required'
      } as IApiResponse);
      return;
    }

    // Find puzzle (only if it belongs to the user)
    const puzzle = await Sudoku.findOne({
      _id: id,
      user: userId
    });

    if (!puzzle) {
      res.status(404).json({
        success: false,
        message: 'Puzzle not found or you do not have permission to access it'
      } as IApiResponse);
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
    } as IApiResponse);

  } catch (error) {
    console.error('Get puzzle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving puzzle',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as IApiResponse);
  }
};