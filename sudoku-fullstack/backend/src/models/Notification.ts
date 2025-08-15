import mongoose, { Schema } from 'mongoose';

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

const notificationSchema = new Schema<INotification>({
    recipient: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['like', 'comment', 'follow', 'mention', 'puzzle_shared', 'achievement'],
        required: true
    },
    message: {
        type: String,
        required: true,
        maxlength: [200, 'Message must be less than 200 characters']
    },
    relatedPuzzle: {
        type: Schema.Types.ObjectId,
        ref: 'Sudoku'
    },
    relatedComment: {
        type: String
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
