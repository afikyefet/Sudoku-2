"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sudoku = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const sudokuSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, 'User ID is required'],
        ref: 'User'
    },
    title: {
        type: String,
        required: [true, 'Puzzle title is required'],
        trim: true,
        maxlength: [100, 'Title must be less than 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description must be less than 500 characters'],
        default: ''
    },
    puzzleData: {
        type: [[Number]],
        required: [true, 'Puzzle data is required'],
        validate: {
            validator: function (data) {
                // Check if it's a 9x9 grid
                if (data.length !== 9)
                    return false;
                // Check each row has 9 elements and values are 0-9
                return data.every(row => row.length === 9 &&
                    row.every(cell => Number.isInteger(cell) && cell >= 0 && cell <= 9));
            },
            message: 'Puzzle data must be a 9x9 grid with numbers 0-9 (0 for empty cells)'
        }
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'expert'],
        default: 'medium'
    },
    category: {
        type: String,
        enum: ['classic', 'themed', 'challenge', 'community'],
        default: 'classic'
    },
    tags: [{
            type: String,
            trim: true,
            maxlength: [20, 'Tag must be less than 20 characters']
        }],
    isPublic: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    likes: [{
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
            likedAt: { type: Date, default: Date.now }
        }],
    comments: [{
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            content: { type: String, required: true, maxlength: [500, 'Comment must be less than 500 characters'] },
            createdAt: { type: Date, default: Date.now },
            likes: [{
                    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
                    likedAt: { type: Date, default: Date.now }
                }],
            replies: [{
                    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
                    content: { type: String, required: true, maxlength: [300, 'Reply must be less than 300 characters'] },
                    createdAt: { type: Date, default: Date.now }
                }]
        }],
    solvedBy: [{
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
            solvedAt: { type: Date, default: Date.now },
            solveTime: { type: Number }, // in seconds
            moves: { type: Number, default: 0 },
            hintsUsed: { type: Number, default: 0 }
        }],
    shares: [{
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
            sharedAt: { type: Date, default: Date.now },
            platform: { type: String, enum: ['twitter', 'facebook', 'link', 'discord'] }
        }],
    reports: [{
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
            reason: { type: String, required: true },
            reportedAt: { type: Date, default: Date.now }
        }],
    stats: {
        views: { type: Number, default: 0 },
        attempts: { type: Number, default: 0 },
        completions: { type: Number, default: 0 },
        averageSolveTime: { type: Number, default: 0 },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        ratingCount: { type: Number, default: 0 }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
// Indexes for faster queries
sudokuSchema.index({ user: 1, createdAt: -1 });
sudokuSchema.index({ difficulty: 1, createdAt: -1 });
sudokuSchema.index({ category: 1, createdAt: -1 });
sudokuSchema.index({ isPublic: 1, isFeatured: 1, createdAt: -1 });
sudokuSchema.index({ tags: 1 });
sudokuSchema.index({ 'stats.rating': -1, 'stats.ratingCount': -1 });
sudokuSchema.index({ 'stats.views': -1 });
// Middleware to update updatedAt on save
sudokuSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
// Virtual for like count
sudokuSchema.virtual('likeCount').get(function () {
    return this.likes?.length || 0;
});
// Virtual for comment count
sudokuSchema.virtual('commentCount').get(function () {
    return this.comments?.length || 0;
});
// Virtual for completion rate
sudokuSchema.virtual('completionRate').get(function () {
    if (!this.stats.attempts || this.stats.attempts === 0)
        return 0;
    return (this.stats.completions / this.stats.attempts) * 100;
});
// Static method to find trending puzzles
sudokuSchema.statics.findTrending = function (limit = 10) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return this.aggregate([
        {
            $match: {
                isPublic: true,
                createdAt: { $gte: sevenDaysAgo }
            }
        },
        {
            $addFields: {
                trendingScore: {
                    $add: [
                        { $multiply: [{ $size: '$likes' }, 3] },
                        { $multiply: [{ $size: '$comments' }, 2] },
                        { $multiply: ['$stats.views', 0.1] },
                        { $multiply: ['$stats.completions', 5] }
                    ]
                }
            }
        },
        {
            $sort: { trendingScore: -1, createdAt: -1 }
        },
        {
            $limit: limit
        },
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userInfo'
            }
        },
        {
            $unwind: '$userInfo'
        }
    ]);
};
// Include virtuals in JSON output
sudokuSchema.set('toJSON', { virtuals: true });
exports.Sudoku = mongoose_1.default.model('Sudoku', sudokuSchema);
//# sourceMappingURL=Sudoku.js.map