import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Notification } from '../models/Notification';
import { Sudoku } from '../models/Sudoku';
import { User } from '../models/User';
import { ApiResponse, CommentInput } from '../types';

// Like/Unlike a puzzle
export const togglePuzzleLike = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            } as ApiResponse);
            return;
        }

        const { puzzleId } = req.params;
        const userId = req.user.userId;

        const puzzle = await Sudoku.findById(puzzleId);
        if (!puzzle) {
            res.status(404).json({
                success: false,
                message: 'Puzzle not found'
            } as ApiResponse);
            return;
        }

        const existingLikeIndex = puzzle.likes.findIndex(
            like => like.user.toString() === userId
        );

        if (existingLikeIndex > -1) {
            // Unlike
            puzzle.likes.splice(existingLikeIndex, 1);
            await puzzle.save();

            res.status(200).json({
                success: true,
                message: 'Puzzle unliked',
                data: { isLiked: false, likeCount: puzzle.likes.length }
            } as ApiResponse);
        } else {
            // Like
            puzzle.likes.push({
                user: new mongoose.Types.ObjectId(userId),
                likedAt: new Date()
            });
            await puzzle.save();

            // Create notification if not own puzzle
            if (puzzle.user.toString() !== userId) {
                await Notification.create({
                    recipient: puzzle.user,
                    sender: userId,
                    type: 'like',
                    message: `${req.user.username} liked your puzzle "${puzzle.title}"`,
                    relatedPuzzle: puzzleId
                });
            }

            res.status(200).json({
                success: true,
                message: 'Puzzle liked',
                data: { isLiked: true, likeCount: puzzle.likes.length }
            } as ApiResponse);
        }
    } catch (error) {
        console.error('Toggle like error:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling like'
        } as ApiResponse);
    }
};

// Add comment to puzzle
export const addComment = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            } as ApiResponse);
            return;
        }

        const { puzzleId } = req.params;
        const { content }: CommentInput = req.body;
        const userId = req.user.userId;

        if (!content || content.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: 'Comment content is required'
            } as ApiResponse);
            return;
        }

        const puzzle = await Sudoku.findById(puzzleId);
        if (!puzzle) {
            res.status(404).json({
                success: false,
                message: 'Puzzle not found'
            } as ApiResponse);
            return;
        }

        const newComment = {
            user: new mongoose.Types.ObjectId(userId),
            content: content.trim(),
            createdAt: new Date(),
            likes: [],
            replies: []
        };

        puzzle.comments.push(newComment);
        await puzzle.save();

        // Create notification if not own puzzle
        if (puzzle.user.toString() !== userId) {
            await Notification.create({
                recipient: puzzle.user,
                sender: userId,
                type: 'comment',
                message: `${req.user.username} commented on your puzzle "${puzzle.title}"`,
                relatedPuzzle: puzzleId,
                relatedComment: content.trim()
            });
        }

        // Populate the new comment
        const populatedPuzzle = await Sudoku.findById(puzzleId)
            .populate('comments.user', 'username displayName avatar')
            .exec();

        const addedComment = populatedPuzzle?.comments[populatedPuzzle.comments.length - 1];

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: { comment: addedComment }
        } as ApiResponse);
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding comment'
        } as ApiResponse);
    }
};

// Follow/Unfollow user
export const toggleFollow = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            } as ApiResponse);
            return;
        }

        const { userId: targetUserId } = req.params;
        const currentUserId = req.user.userId;

        if (targetUserId === currentUserId) {
            res.status(400).json({
                success: false,
                message: 'Cannot follow yourself'
            } as ApiResponse);
            return;
        }

        const [currentUser, targetUser] = await Promise.all([
            User.findById(currentUserId),
            User.findById(targetUserId)
        ]);

        if (!targetUser) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            } as ApiResponse);
            return;
        }

        if (!currentUser) {
            res.status(404).json({
                success: false,
                message: 'Current user not found'
            } as ApiResponse);
            return;
        }

        const isFollowing = currentUser.following.includes(new mongoose.Types.ObjectId(targetUserId));

        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter(
                id => id.toString() !== targetUserId
            );
            targetUser.followers = targetUser.followers.filter(
                id => id.toString() !== currentUserId
            );

            await Promise.all([currentUser.save(), targetUser.save()]);

            res.status(200).json({
                success: true,
                message: 'User unfollowed',
                data: { isFollowing: false, followerCount: targetUser.followers.length }
            } as ApiResponse);
        } else {
            // Follow
            currentUser.following.push(new mongoose.Types.ObjectId(targetUserId));
            targetUser.followers.push(new mongoose.Types.ObjectId(currentUserId));

            await Promise.all([currentUser.save(), targetUser.save()]);

            // Create notification
            await Notification.create({
                recipient: targetUserId,
                sender: currentUserId,
                type: 'follow',
                message: `${req.user.username} started following you`
            });

            res.status(200).json({
                success: true,
                message: 'User followed',
                data: { isFollowing: true, followerCount: targetUser.followers.length }
            } as ApiResponse);
        }
    } catch (error) {
        console.error('Toggle follow error:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling follow'
        } as ApiResponse);
    }
};

// Get user notifications
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            } as ApiResponse);
            return;
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ recipient: req.user.userId })
            .populate('sender', 'username displayName avatar')
            .populate('relatedPuzzle', 'title')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Notification.countDocuments({ recipient: req.user.userId });
        const unreadCount = await Notification.countDocuments({
            recipient: req.user.userId,
            isRead: false
        });

        res.status(200).json({
            success: true,
            message: 'Notifications retrieved successfully',
            data: {
                notifications,
                unreadCount,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            }
        } as ApiResponse);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving notifications'
        } as ApiResponse);
    }
};

// Mark notifications as read
export const markNotificationsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            } as ApiResponse);
            return;
        }

        const { notificationIds } = req.body;

        if (notificationIds && Array.isArray(notificationIds)) {
            // Mark specific notifications as read
            await Notification.updateMany(
                {
                    _id: { $in: notificationIds },
                    recipient: req.user.userId
                },
                { isRead: true }
            );
        } else {
            // Mark all notifications as read
            await Notification.updateMany(
                { recipient: req.user.userId },
                { isRead: true }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Notifications marked as read'
        } as ApiResponse);
    } catch (error) {
        console.error('Mark notifications read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking notifications as read'
        } as ApiResponse);
    }
};

// Share puzzle
export const sharePuzzle = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            } as ApiResponse);
            return;
        }

        const { puzzleId } = req.params;
        const { platform } = req.body;

        const puzzle = await Sudoku.findById(puzzleId);
        if (!puzzle) {
            res.status(404).json({
                success: false,
                message: 'Puzzle not found'
            } as ApiResponse);
            return;
        }

        // Add share record
        puzzle.shares.push({
            user: new mongoose.Types.ObjectId(req.user.userId),
            sharedAt: new Date(),
            platform
        });

        await puzzle.save();

        // Generate share URL based on platform
        const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/puzzle/${puzzleId}`;
        let shareData: any = {
            url: shareUrl,
            title: puzzle.title,
            description: puzzle.description || `Check out this ${puzzle.difficulty} Sudoku puzzle!`
        };

        if (platform === 'twitter') {
            shareData.twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out "${puzzle.title}" - a ${puzzle.difficulty} Sudoku puzzle!`)}&url=${encodeURIComponent(shareUrl)}`;
        } else if (platform === 'facebook') {
            shareData.facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        }

        res.status(200).json({
            success: true,
            message: 'Puzzle shared successfully',
            data: shareData
        } as ApiResponse);
    } catch (error) {
        console.error('Share puzzle error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sharing puzzle'
        } as ApiResponse);
    }
};
