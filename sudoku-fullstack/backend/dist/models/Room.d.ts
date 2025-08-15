import mongoose from 'mongoose';
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
export declare const Room: mongoose.Model<IRoom, {}, {}, {}, mongoose.Document<unknown, {}, IRoom, {}, {}> & IRoom & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Room.d.ts.map