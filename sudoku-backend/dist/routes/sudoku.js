"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sudokuController_1 = require("../controllers/sudokuController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/', sudokuController_1.getUserPuzzles);
router.post('/', sudokuController_1.createPuzzle);
router.get('/:id', sudokuController_1.getPuzzle);
router.delete('/:id', sudokuController_1.deletePuzzle);
exports.default = router;
//# sourceMappingURL=sudoku.js.map