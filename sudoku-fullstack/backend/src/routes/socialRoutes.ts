import express from 'express';
import {
    addComment,
    getNotifications,
    markNotificationsRead,
    sharePuzzle,
    toggleFollow,
    togglePuzzleLike
} from '../controllers/socialController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All social routes require authentication
router.use(authenticateToken);

// Puzzle interactions
router.post('/puzzles/:puzzleId/like', togglePuzzleLike);      // POST /api/social/puzzles/:id/like
router.post('/puzzles/:puzzleId/comment', addComment);        // POST /api/social/puzzles/:id/comment
router.post('/puzzles/:puzzleId/share', sharePuzzle);         // POST /api/social/puzzles/:id/share

// User interactions
router.post('/users/:userId/follow', toggleFollow);           // POST /api/social/users/:id/follow

// Notifications
router.get('/notifications', getNotifications);              // GET /api/social/notifications
router.patch('/notifications/read', markNotificationsRead);  // PATCH /api/social/notifications/read

export default router;
