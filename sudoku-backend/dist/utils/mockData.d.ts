interface MockUser {
    id: string;
    email: string;
    password: string;
    createdAt: Date;
}
interface MockSudoku {
    id: string;
    user: string;
    title: string;
    puzzleData: number[][];
    createdAt: Date;
}
export declare class MockDatabase {
    private users;
    private sudokus;
    private userIdCounter;
    private sudokuIdCounter;
    createUser(email: string, hashedPassword: string): Promise<MockUser>;
    findUserByEmail(email: string): Promise<MockUser | null>;
    findUserById(id: string): Promise<MockUser | null>;
    createSudoku(userId: string, title: string, puzzleData: number[][]): Promise<MockSudoku>;
    findSudokusByUser(userId: string): Promise<MockSudoku[]>;
    findSudokuById(id: string, userId: string): Promise<MockSudoku | null>;
    deleteSudoku(id: string, userId: string): Promise<MockSudoku | null>;
    countSudokusByUser(userId: string): Promise<number>;
}
export declare const mockDB: MockDatabase;
export {};
//# sourceMappingURL=mockData.d.ts.map