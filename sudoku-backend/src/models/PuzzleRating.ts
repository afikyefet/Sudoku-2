import mongoose, { Schema, Document } from 'mongoose';
import { IPuzzleRating } from '../types';

// Interface for PuzzleRating document
interface IPuzzleRatingDocument extends Document, Omit<IPuzzleRating, '_id'> {}

// PuzzleRating schema for user ratings and reviews
const PuzzleRatingSchema: Schema = new Schema({
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
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure only one rating per user per puzzle
PuzzleRatingSchema.index({ user: 1, puzzle: 1 }, { unique: true });

// Index for finding puzzle ratings
PuzzleRatingSchema.index({ puzzle: 1, createdAt: -1 });

// Index for finding user's ratings
PuzzleRatingSchema.index({ user: 1, createdAt: -1 });

// Static method to get average rating for a puzzle
PuzzleRatingSchema.statics.getAverageRating = async function(puzzleId: string) {
  const result = await this.aggregate([
    { $match: { puzzle: new mongoose.Types.ObjectId(puzzleId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  if (result.length > 0) {
    return {
      averageRating: Math.round(result[0].averageRating * 10) / 10,
      totalRatings: result[0].totalRatings
    };
  }

  return { averageRating: 0, totalRatings: 0 };
};

// Static method to get user's rating for a puzzle
PuzzleRatingSchema.statics.getUserRating = async function(userId: string, puzzleId: string) {
  return await this.findOne({ user: userId, puzzle: puzzleId });
};

// Create and export the model
export const PuzzleRating = mongoose.model<IPuzzleRatingDocument>('PuzzleRating', PuzzleRatingSchema);