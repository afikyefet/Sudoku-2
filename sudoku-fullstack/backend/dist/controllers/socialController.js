"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sharePuzzle = exports.markNotificationsRead = exports.getNotifications = exports.toggleFollow = exports.addComment = exports.togglePuzzleLike = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Notification_1 = require("../models/Notification");
const Sudoku_1 = require("../models/Sudoku");
const User_1 = require("../models/User");
// Like/Unlike a puzzle
const togglePuzzleLike = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        const { puzzleId } = req.params;
        const userId = req.user.userId;
        const puzzle = await Sudoku_1.Sudoku.findById(puzzleId);
        if (!puzzle) {
            res.status(404).json({
                success: false,
                message: 'Puzzle not found'
            });
            return;
        }
        const existingLikeIndex = puzzle.likes.findIndex(like => like.user.toString() === userId);
        if (existingLikeIndex > -1) {
            // Unlike
            puzzle.likes.splice(existingLikeIndex, 1);
            await puzzle.save();
            res.status(200).json({
                success: true,
                message: 'Puzzle unliked',
                data: { isLiked: false, likeCount: puzzle.likes.length }
            });
        }
        else {
            // Like
            puzzle.likes.push({
                user: new mongoose_1.default.Types.ObjectId(userId),
                likedAt: new Date()
            });
            await puzzle.save();
            // Create notification if not own puzzle
            if (puzzle.user.toString() !== userId) {
                await Notification_1.Notification.create({
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
            });
        }
    }
    catch (error) {
        console.error('Toggle like error:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling like'
        });
    }
};
exports.togglePuzzleLike = togglePuzzleLike;
// Add comment to puzzle
const addComment = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        const { puzzleId } = req.params;
        const { content } = req.body;
        const userId = req.user.userId;
        if (!content || content.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
            return;
        }
        const puzzle = await Sudoku_1.Sudoku.findById(puzzleId);
        if (!puzzle) {
            res.status(404).json({
                success: false,
                message: 'Puzzle not found'
            });
            return;
        }
        const newComment = {
            user: new mongoose_1.default.Types.ObjectId(userId),
            content: content.trim(),
            createdAt: new Date(),
            likes: [],
            replies: []
        };
        puzzle.comments.push(newComment);
        await puzzle.save();
        // Create notification if not own puzzle
        if (puzzle.user.toString() !== userId) {
            await Notification_1.Notification.create({
                recipient: puzzle.user,
                sender: userId,
                type: 'comment',
                message: `${req.user.username} commented on your puzzle "${puzzle.title}"`,
                relatedPuzzle: puzzleId,
                relatedComment: content.trim()
            });
        }
        // Populate the new comment
        const populatedPuzzle = await Sudoku_1.Sudoku.findById(puzzleId)
            .populate('comments.user', 'username displayName avatar')
            .exec();
        const addedComment = populatedPuzzle?.comments[populatedPuzzle.comments.length - 1];
        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: { comment: addedComment }
        });
    }
    catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding comment'
        });
    }
};
exports.addComment = addComment;
// Follow/Unfollow user
const toggleFollow = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        const { userId: targetUserId } = req.params;
        const currentUserId = req.user.userId;
        if (targetUserId === currentUserId) {
            res.status(400).json({
                success: false,
                message: 'Cannot follow yourself'
            });
            return;
        }
        const [currentUser, targetUser] = await Promise.all([
            User_1.User.findById(currentUserId),
            User_1.User.findById(targetUserId)
        ]);
        if (!targetUser) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        if (!currentUser) {
            res.status(404).json({
                success: false,
                message: 'Current user not found'
            });
            return;
        }
        const isFollowing = currentUser.following.includes(new mongoose_1.default.Types.ObjectId(targetUserId));
        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);
            await Promise.all([currentUser.save(), targetUser.save()]);
            res.status(200).json({
                success: true,
                message: 'User unfollowed',
                data: { isFollowing: false, followerCount: targetUser.followers.length }
            });
        }
        else {
            // Follow
            currentUser.following.push(new mongoose_1.default.Types.ObjectId(targetUserId));
            targetUser.followers.push(new mongoose_1.default.Types.ObjectId(currentUserId));
            await Promise.all([currentUser.save(), targetUser.save()]);
            // Create notification
            await Notification_1.Notification.create({
                recipient: targetUserId,
                sender: currentUserId,
                type: 'follow',
                message: `${req.user.username} started following you`
            });
            res.status(200).json({
                success: true,
                message: 'User followed',
                data: { isFollowing: true, followerCount: targetUser.followers.length }
            });
        }
    }
    catch (error) {
        console.error('Toggle follow error:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling follow'
        });
    }
};
exports.toggleFollow = toggleFollow;
// Get user notifications
const getNotifications = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const notifications = await Notification_1.Notification.find({ recipient: req.user.userId })
            .populate('sender', 'username displayName avatar')
            .populate('relatedPuzzle', 'title')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await Notification_1.Notification.countDocuments({ recipient: req.user.userId });
        const unreadCount = await Notification_1.Notification.countDocuments({
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
        });
    }
    catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving notifications'
        });
    }
};
exports.getNotifications = getNotifications;
// Mark notifications as read
const markNotificationsRead = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        const { notificationIds } = req.body;
        if (notificationIds && Array.isArray(notificationIds)) {
            // Mark specific notifications as read
            await Notification_1.Notification.updateMany({
                _id: { $in: notificationIds },
                recipient: req.user.userId
            }, { isRead: true });
        }
        else {
            // Mark all notifications as read
            await Notification_1.Notification.updateMany({ recipient: req.user.userId }, { isRead: true });
        }
        res.status(200).json({
            success: true,
            message: 'Notifications marked as read'
        });
    }
    catch (error) {
        console.error('Mark notifications read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking notifications as read'
        });
    }
};
exports.markNotificationsRead = markNotificationsRead;
// Share puzzle
const sharePuzzle = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        const { puzzleId } = req.params;
        const { platform } = req.body;
        const puzzle = await Sudoku_1.Sudoku.findById(puzzleId);
        if (!puzzle) {
            res.status(404).json({
                success: false,
                message: 'Puzzle not found'
            });
            return;
        }
        // Add share record
        puzzle.shares.push({
            user: new mongoose_1.default.Types.ObjectId(req.user.userId),
            sharedAt: new Date(),
            platform
        });
        await puzzle.save();
        // Generate share URL based on platform
        const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/puzzle/${puzzleId}`;
        let shareData = {
            url: shareUrl,
            title: puzzle.title,
            description: puzzle.description || `Check out this ${puzzle.difficulty} Sudoku puzzle!`
        };
        if (platform === 'twitter') {
            shareData.twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out "${puzzle.title}" - a ${puzzle.difficulty} Sudoku puzzle!`)}&url=${encodeURIComponent(shareUrl)}`;
        }
        else if (platform === 'facebook') {
            shareData.facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        }
        res.status(200).json({
            success: true,
            message: 'Puzzle shared successfully',
            data: shareData
        });
    }
    catch (error) {
        console.error('Share puzzle error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sharing puzzle'
        });
    }
};
exports.sharePuzzle = sharePuzzle;
//# sourceMappingURL=socialController.js.map