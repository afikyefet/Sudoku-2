import mongoose, { Schema } from 'mongoose';

export interface IRoom extends mongoose.Document {
    name: string;
    description?: string;
    host: mongoose.Types.ObjectId;
    puzzle: mongoose.Types.ObjectId;
    participants: Array<{
        user: mongoose.Types.ObjectId;
        joinedAt: Date;
        isActive: boolean;
        currentGrid?: number[][];
        score: number;
        completedAt?: Date;
    }>;
    maxParticipants: number;
    isPublic: boolean;
    isActive: boolean;
    gameMode: 'collaborative' | 'competitive' | 'race';
    settings: {
        allowHints: boolean;
        showTimer: boolean;
        showOtherProgress: boolean;
    };
    createdAt: Date;
    startedAt?: Date;
    endedAt?: Date;
}

const roomSchema = new Schema<IRoom>({
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
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    puzzle: {
        type: Schema.Types.ObjectId,
        ref: 'Sudoku',
        required: true
    },
    participants: [{
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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

export const Room = mongoose.model<IRoom>('Room', roomSchema);
