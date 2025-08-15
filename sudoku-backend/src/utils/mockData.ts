// Mock data storage for demo purposes when MongoDB is not available

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

export class MockDatabase {
  private users: MockUser[] = [];
  private sudokus: MockSudoku[] = [];
  private userIdCounter = 1;
  private sudokuIdCounter = 1;

  // User methods
  async createUser(email: string, hashedPassword: string): Promise<MockUser> {
    const user: MockUser = {
      id: this.userIdCounter.toString(),
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date()
    };
    
    this.userIdCounter++;
    this.users.push(user);
    return user;
  }

  async findUserByEmail(email: string): Promise<MockUser | null> {
    return this.users.find(user => user.email === email.toLowerCase()) || null;
  }

  async findUserById(id: string): Promise<MockUser | null> {
    return this.users.find(user => user.id === id) || null;
  }

  // Sudoku methods
  async createSudoku(userId: string, title: string, puzzleData: number[][]): Promise<MockSudoku> {
    const sudoku: MockSudoku = {
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

  async findSudokusByUser(userId: string): Promise<MockSudoku[]> {
    return this.sudokus
      .filter(sudoku => sudoku.user === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findSudokuById(id: string, userId: string): Promise<MockSudoku | null> {
    return this.sudokus.find(sudoku => sudoku.id === id && sudoku.user === userId) || null;
  }

  async deleteSudoku(id: string, userId: string): Promise<MockSudoku | null> {
    const index = this.sudokus.findIndex(sudoku => sudoku.id === id && sudoku.user === userId);
    if (index !== -1) {
      return this.sudokus.splice(index, 1)[0];
    }
    return null;
  }

  async countSudokusByUser(userId: string): Promise<number> {
    return this.sudokus.filter(sudoku => sudoku.user === userId).length;
  }
}

// Global instance for the mock database
export const mockDB = new MockDatabase();