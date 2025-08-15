import mongoose, { Schema, Document } from 'mongoose';
import { IGameState } from '../types';

// Interface for GameState document
interface IGameStateDocument extends Document, Omit<IGameState, '_id'> {}

// GameState schema for saving user progress
const GameStateSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  puzzle: {
    type: Schema.Types.ObjectId,
    ref: 'Sudoku',
    required: [true, 'Puzzle is required']
  },
  currentGrid: {
    type: [[Number]],
    required: [true, 'Current grid state is required'],
    validate: {
      validator: function(grid: number[][]) {
        // Check if it's a 9x9 grid
        if (grid.length !== 9) return false;
        
        for (const row of grid) {
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
      message: 'Current grid must be a valid 9x9 grid with values 0-9'
    }
  },
  timeSpent: {
    type: Number,
    required: [true, 'Time spent is required'],
    min: [0, 'Time spent cannot be negative'],
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  hintsUsed: {
    type: Number,
    default: 0,
    min: [0, 'Hints used cannot be negative']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
GameStateSchema.pre<IGameStateDocument>('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Ensure only one game state per user per puzzle
GameStateSchema.index({ user: 1, puzzle: 1 }, { unique: true });

// Index for finding user's game states
GameStateSchema.index({ user: 1, updatedAt: -1 });

// Index for finding incomplete games
GameStateSchema.index({ user: 1, isCompleted: 1, updatedAt: -1 });

// Static method to find or create game state
GameStateSchema.statics.findOrCreate = async function(userId: string, puzzleId: string, initialGrid: number[][]) {
  let gameState = await this.findOne({ user: userId, puzzle: puzzleId });
  
  if (!gameState) {
    gameState = new this({
      user: userId,
      puzzle: puzzleId,
      currentGrid: initialGrid,
      timeSpent: 0,
      isCompleted: false,
      hintsUsed: 0
    });
    await gameState.save();
  }
  
  return gameState;
};

// Instance method to update progress
GameStateSchema.methods.updateProgress = function(grid: number[][], timeSpent: number, hintsUsed: number) {
  this.currentGrid = grid;
  this.timeSpent = timeSpent;
  this.hintsUsed = hintsUsed;
  this.updatedAt = new Date();
};

// Instance method to mark as completed
GameStateSchema.methods.markCompleted = function(finalGrid: number[][], totalTime: number) {
  this.currentGrid = finalGrid;
  this.timeSpent = totalTime;
  this.isCompleted = true;
  this.updatedAt = new Date();
};

// Create and export the model
export const GameState = mongoose.model<IGameStateDocument>('GameState', GameStateSchema);