"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockDB = exports.MockDatabase = void 0;
class MockDatabase {
    constructor() {
        this.users = [];
        this.sudokus = [];
        this.userIdCounter = 1;
        this.sudokuIdCounter = 1;
    }
    async createUser(email, hashedPassword) {
        const user = {
            id: this.userIdCounter.toString(),
            email: email.toLowerCase(),
            password: hashedPassword,
            createdAt: new Date()
        };
        this.userIdCounter++;
        this.users.push(user);
        return user;
    }
    async findUserByEmail(email) {
        return this.users.find(user => user.email === email.toLowerCase()) || null;
    }
    async findUserById(id) {
        return this.users.find(user => user.id === id) || null;
    }
    async createSudoku(userId, title, puzzleData) {
        const sudoku = {
            id: this.sudokuIdCounter.toString(),
            user: userId,
            title,
            puzzleData,
            createdAt: new Date()
        };
        this.sudokuIdCounter++;
        this.sudokus.push(sudoku);
        return sudoku;
    }
    async findSudokusByUser(userId) {
        return this.sudokus
            .filter(sudoku => sudoku.user === userId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async findSudokuById(id, userId) {
        return this.sudokus.find(sudoku => sudoku.id === id && sudoku.user === userId) || null;
    }
    async deleteSudoku(id, userId) {
        const index = this.sudokus.findIndex(sudoku => sudoku.id === id && sudoku.user === userId);
        if (index !== -1) {
            return this.sudokus.splice(index, 1)[0];
        }
        return null;
    }
    async countSudokusByUser(userId) {
        return this.sudokus.filter(sudoku => sudoku.user === userId).length;
    }
}
exports.MockDatabase = MockDatabase;
exports.mockDB = new MockDatabase();
//# sourceMappingURL=mockData.js.map