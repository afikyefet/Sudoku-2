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
const SudokuSchema = new mongoose_1.Schema({
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
            validator: function (puzzle) {
                if (puzzle.length !== 9)
                    return false;
                for (const row of puzzle) {
                    if (row.length !== 9)
                        return false;
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
SudokuSchema.index({ user: 1, createdAt: -1 });
SudokuSchema.statics.countUserPuzzles = function (userId) {
    return this.countDocuments({ user: userId });
};
exports.Sudoku = mongoose_1.default.model('Sudoku', SudokuSchema);
//# sourceMappingURL=Sudoku.js.map