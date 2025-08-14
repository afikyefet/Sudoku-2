import mongoose, { Schema } from 'mongoose';
import { ISudoku } from '../types';

/**
 * Sudoku Schema for MongoDB
 */
const SudokuSchema = new Schema<ISudoku>({
  user: {
    type: String,
    required: [true, 'User ID is required'],
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'Puzzle title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  puzzleData: {
    type: [[Number]],
    required: [true, 'Puzzle data is required'],
    validate: {
      validator: function (puzzle: number[][]) {
        // Validate that puzzle is 9x9 grid
        if (puzzle.length !== 9) return false;
        
        for (const row of puzzle) {
          if (row.length !== 9) return false;
          
          // Check each cell contains valid numbers (0-9)
          for (const cell of row) {
            if (!Number.isInteger(cell) || cell < 0 || cell > 9) {
              return false;
            }
          }
        }
        
        return true;
      },
      message: 'Puzzle must be a 9x9 grid with numbers 0-9 (0 for empty cells)'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Index for efficient queries
 */
SudokuSchema.index({ user: 1, createdAt: -1 });

/**
 * Static method to count user's puzzles
 */
SudokuSchema.statics.countUserPuzzles = function (userId: string) {
  return this.countDocuments({ user: userId });
};

export const Sudoku = mongoose.model<ISudoku>('Sudoku', SudokuSchema);