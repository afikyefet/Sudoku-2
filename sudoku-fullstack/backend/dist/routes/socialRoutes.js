"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socialController_1 = require("../controllers/socialController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// All social routes require authentication
router.use(auth_1.authenticateToken);
// Puzzle interactions
router.post('/puzzles/:puzzleId/like', socialController_1.togglePuzzleLike); // POST /api/social/puzzles/:id/like
router.post('/puzzles/:puzzleId/comment', socialController_1.addComment); // POST /api/social/puzzles/:id/comment
router.post('/puzzles/:puzzleId/share', socialController_1.sharePuzzle); // POST /api/social/puzzles/:id/share
// User interactions
router.post('/users/:userId/follow', socialController_1.toggleFollow); // POST /api/social/users/:id/follow
// Notifications
router.get('/notifications', socialController_1.getNotifications); // GET /api/social/notifications
router.patch('/notifications/read', socialController_1.markNotificationsRead); // PATCH /api/social/notifications/read
exports.default = router;
//# sourceMappingURL=socialRoutes.js.map