import mongoose from 'mongoose';
export interface INotification extends mongoose.Document {
    recipient: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    type: 'like' | 'comment' | 'follow' | 'mention' | 'puzzle_shared' | 'achievement';
    message: string;
    relatedPuzzle?: mongoose.Types.ObjectId;
    relatedComment?: string;
    isRead: boolean;
    createdAt: Date;
}
export declare const Notification: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Notification.d.ts.map