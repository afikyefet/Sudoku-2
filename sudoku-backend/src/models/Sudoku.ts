import mongoose, { Schema, Document } from 'mongoose';
import { ISudoku } from '../types';

// Interface for Sudoku document
interface ISudokuDocument extends Document, Omit<ISudoku, '_id'> {}

// Sudoku schema
const SudokuSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  puzzleData: {
    type: [[Number]],
    required: [true, 'Puzzle data is required'],
    validate: {
      validator: function(puzzle: number[][]) {
        // Check if it's a 9x9 grid
        if (puzzle.length !== 9) return false;
        
        for (const row of puzzle) {
          if (row.length !== 9) return false;
          
          // Check if all values are between 0-9
          for (const cell of row) {
            if (!Number.isInteger(cell) || cell < 0 || cell > 9) {
              return false;
            }
          }
        }
        return true;
      },
      message: 'Puzzle must be a valid 9x9 grid with values 0-9'
    }
  },
  solutionData: {
    type: [[Number]],
    required: [true, 'Solution data is required'],
    validate: {
      validator: function(solution: number[][]) {
        // Check if it's a 9x9 grid
        if (solution.length !== 9) return false;
        
        for (const row of solution) {
          if (row.length !== 9) return false;
          
          // Check if all values are between 1-9 (solution should be complete)
          for (const cell of row) {
            if (!Number.isInteger(cell) || cell < 1 || cell > 9) {
              return false;
            }
          }
        }
        return true;
      },
      message: 'Solution must be a valid completed 9x9 grid with values 1-9'
    }
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert', 'master'],
    required: [true, 'Difficulty level is required']
  },
  difficultyScore: {
    type: Number,
    required: [true, 'Difficulty score is required'],
    min: [0, 'Difficulty score must be non-negative']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  solvedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  favorites: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  averageTimeToSolve: {
    type: Number,
    default: 0,
    min: [0, 'Average time cannot be negative']
  },
  hints: {
    type: Number,
    required: [true, 'Number of hints is required'],
    min: [17, 'Minimum 17 hints required for unique solution'],
    max: [80, 'Maximum 80 hints allowed']
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  ratingCount: {
    type: Number,
    default: 0,
    min: [0, 'Rating count cannot be negative']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate number of hints (pre-filled cells) before saving
SudokuSchema.pre<ISudokuDocument>('save', function(next) {
  if (this.isModified('puzzleData')) {
    let hintsCount = 0;
    for (const row of this.puzzleData) {
      for (const cell of row) {
        if (cell !== 0) hintsCount++;
      }
    }
    this.hints = hintsCount;
  }
  next();
});

// Static method to count user puzzles
SudokuSchema.statics.countUserPuzzles = function(userId: string) {
  return this.countDocuments({ user: userId });
};

// Instance method to check if user has solved this puzzle
SudokuSchema.methods.hasSolvedBy = function(userId: string): boolean {
  return this.solvedBy.includes(userId);
};

// Instance method to check if user has favorited this puzzle
SudokuSchema.methods.isFavoritedBy = function(userId: string): boolean {
  return this.favorites.includes(userId);
};

// Instance method to add solver
SudokuSchema.methods.addSolver = function(userId: string, timeToSolve: number) {
  if (!this.hasSolvedBy(userId)) {
    this.solvedBy.push(userId);
    
    // Update average time to solve
    const totalSolvers = this.solvedBy.length;
    const currentTotal = this.averageTimeToSolve * (totalSolvers - 1);
    this.averageTimeToSolve = Math.round((currentTotal + timeToSolve) / totalSolvers);
  }
};

// Instance method to toggle favorite
SudokuSchema.methods.toggleFavorite = function(userId: string) {
  const index = this.favorites.indexOf(userId);
  if (index === -1) {
    this.favorites.push(userId);
    return true; // Added to favorites
  } else {
    this.favorites.splice(index, 1);
    return false; // Removed from favorites
  }
};

// Instance method to update rating
SudokuSchema.methods.updateRating = function(newRating: number) {
  const totalRating = this.rating * this.ratingCount;
  this.ratingCount += 1;
  this.rating = Math.round(((totalRating + newRating) / this.ratingCount) * 10) / 10;
};

// Add compound indexes for better query performance
SudokuSchema.index({ user: 1, createdAt: -1 });
SudokuSchema.index({ difficulty: 1, rating: -1 });
SudokuSchema.index({ isPublic: 1, createdAt: -1 });
SudokuSchema.index({ tags: 1 });
SudokuSchema.index({ 'favorites': 1 });
SudokuSchema.index({ 'solvedBy': 1 });

// Text index for search functionality
SudokuSchema.index({ 
  title: 'text', 
  description: 'text', 
  tags: 'text' 
});

// Create and export the model
export const Sudoku = mongoose.model<ISudokuDocument>('Sudoku', SudokuSchema);