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
exports.Room = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const roomSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: [50, 'Room name must be less than 50 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description must be less than 200 characters']
    },
    host: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    puzzle: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Sudoku',
        required: true
    },
    participants: [{
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            joinedAt: { type: Date, default: Date.now },
            isActive: { type: Boolean, default: true },
            currentGrid: { type: [[Number]], default: null },
            score: { type: Number, default: 0 },
            completedAt: { type: Date }
        }],
    maxParticipants: {
        type: Number,
        default: 10,
        min: 2,
        max: 50
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    gameMode: {
        type: String,
        enum: ['collaborative', 'competitive', 'race'],
        default: 'competitive'
    },
    settings: {
        allowHints: { type: Boolean, default: true },
        showTimer: { type: Boolean, default: true },
        showOtherProgress: { type: Boolean, default: false }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    startedAt: {
        type: Date
    },
    endedAt: {
        type: Date
    }
});
// Indexes
roomSchema.index({ isPublic: 1, isActive: 1, createdAt: -1 });
roomSchema.index({ host: 1, createdAt: -1 });
exports.Room = mongoose_1.default.model('Room', roomSchema);
//# sourceMappingURL=Room.js.map