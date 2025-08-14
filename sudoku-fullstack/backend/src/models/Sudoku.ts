import mongoose, { Schema } from 'mongoose';
import { ISudoku } from '../types';

const sudokuSchema = new Schema<ISudoku>({
  user: {
    type: String,
    required: [true, 'User ID is required'],
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'Puzzle title is required'],
    trim: true,
    maxlength: [100, 'Title must be less than 100 characters']
  },
  puzzleData: {
    type: [[Number]],
    required: [true, 'Puzzle data is required'],
    validate: {
      validator: function(data: number[][]) {
        // Check if it's a 9x9 grid
        if (data.length !== 9) return false;
        
        // Check each row has 9 elements and values are 0-9
        return data.every(row => 
          row.length === 9 && 
          row.every(cell => 
            Number.isInteger(cell) && cell >= 0 && cell <= 9
          )
        );
      },
      message: 'Puzzle data must be a 9x9 grid with numbers 0-9 (0 for empty cells)'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
sudokuSchema.index({ user: 1, createdAt: -1 });

export const Sudoku = mongoose.model<ISudoku>('Sudoku', sudokuSchema);