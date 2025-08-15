/**
 * Sudoku Generator and Solver
 * Creates valid puzzles with unique solutions based on difficulty levels
 */

export type SudokuGrid = number[][];
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'master';

export class SudokuGenerator {
  private grid: SudokuGrid;

  constructor() {
    this.grid = this.createEmptyGrid();
  }

  /**
   * Generate a complete Sudoku puzzle with unique solution
   */
  public generatePuzzle(difficulty: Difficulty): { puzzle: SudokuGrid; solution: SudokuGrid; score: number } {
    // Create a complete valid grid
    const solution = this.generateCompleteGrid();
    
    // Create puzzle by removing cells based on difficulty
    const { puzzle, cellsRemoved } = this.createPuzzleFromSolution(solution, difficulty);
    
    // Calculate difficulty score
    const score = this.calculateDifficultyScore(puzzle, cellsRemoved);

    return { puzzle, solution, score };
  }

  /**
   * Check if a puzzle has a unique solution
   */
  public hasUniqueSolution(puzzle: SudokuGrid): boolean {
    const solutions: SudokuGrid[] = [];
    this.findAllSolutions(this.copyGrid(puzzle), solutions, 2); // Stop after finding 2 solutions
    return solutions.length === 1;
  }

  /**
   * Solve a Sudoku puzzle
   */
  public solvePuzzle(puzzle: SudokuGrid): SudokuGrid | null {
    const grid = this.copyGrid(puzzle);
    if (this.solve(grid)) {
      return grid;
    }
    return null;
  }

  /**
   * Validate if a move is valid
   */
  public isValidMove(grid: SudokuGrid, row: number, col: number, num: number): boolean {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (grid[row][x] === num) return false;
    }

    // Check column
    for (let x = 0; x < 9; x++) {
      if (grid[x][col] === num) return false;
    }

    // Check 3x3 box
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[i + startRow][j + startCol] === num) return false;
      }
    }

    return true;
  }

  /**
   * Check if grid is complete and valid
   */
  public isValidComplete(grid: SudokuGrid): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const num = grid[row][col];
        if (num === 0) return false;
        
        // Temporarily clear the cell to check validity
        grid[row][col] = 0;
        const valid = this.isValidMove(grid, row, col, num);
        grid[row][col] = num;
        
        if (!valid) return false;
      }
    }
    return true;
  }

  private createEmptyGrid(): SudokuGrid {
    return Array(9).fill(null).map(() => Array(9).fill(0));
  }

  private copyGrid(grid: SudokuGrid): SudokuGrid {
    return grid.map(row => [...row]);
  }

  private generateCompleteGrid(): SudokuGrid {
    const grid = this.createEmptyGrid();
    this.fillGrid(grid);
    return grid;
  }

  private fillGrid(grid: SudokuGrid): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          for (const num of numbers) {
            if (this.isValidMove(grid, row, col, num)) {
              grid[row][col] = num;
              if (this.fillGrid(grid)) {
                return true;
              }
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  private createPuzzleFromSolution(solution: SudokuGrid, difficulty: Difficulty): { puzzle: SudokuGrid; cellsRemoved: number } {
    const puzzle = this.copyGrid(solution);
    const difficultySettings = this.getDifficultySettings(difficulty);
    
    const positions = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        positions.push([row, col]);
      }
    }
    
    // Shuffle positions for random removal
    this.shuffleArray(positions);
    
    let cellsRemoved = 0;
    const maxAttempts = difficultySettings.maxRemove;
    
    for (const [row, col] of positions) {
      if (cellsRemoved >= maxAttempts) break;
      
      const originalValue = puzzle[row][col];
      puzzle[row][col] = 0;
      
      // Check if puzzle still has unique solution
      if (this.hasUniqueSolution(puzzle)) {
        cellsRemoved++;
      } else {
        // Restore the cell if removing it creates multiple solutions
        puzzle[row][col] = originalValue;
      }
    }
    
    return { puzzle, cellsRemoved };
  }

  private getDifficultySettings(difficulty: Difficulty) {
    const settings = {
      easy: { maxRemove: 45, minFilled: 36 },
      medium: { maxRemove: 50, minFilled: 31 },
      hard: { maxRemove: 55, minFilled: 26 },
      expert: { maxRemove: 60, minFilled: 21 },
      master: { maxRemove: 65, minFilled: 16 }
    };
    
    return settings[difficulty];
  }

  private calculateDifficultyScore(puzzle: SudokuGrid, cellsRemoved: number): number {
    const filledCells = 81 - cellsRemoved;
    
    // Calculate complexity based on solving techniques needed
    let complexity = 0;
    
    // Basic scoring based on empty cells
    complexity += cellsRemoved * 2;
    
    // Additional complexity for advanced patterns
    complexity += this.calculatePatternComplexity(puzzle);
    
    return Math.round(complexity);
  }

  private calculatePatternComplexity(puzzle: SudokuGrid): number {
    let complexity = 0;
    
    // Check for naked pairs, hidden singles, etc.
    // This is a simplified version - real implementation would be more sophisticated
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (puzzle[row][col] === 0) {
          const possibilities = this.getPossibleValues(puzzle, row, col);
          if (possibilities.length <= 2) {
            complexity += 5; // Hard to solve cells
          } else if (possibilities.length >= 7) {
            complexity += 1; // Easy to solve cells
          } else {
            complexity += 3; // Medium difficulty cells
          }
        }
      }
    }
    
    return complexity;
  }

  private getPossibleValues(grid: SudokuGrid, row: number, col: number): number[] {
    const possible = [];
    for (let num = 1; num <= 9; num++) {
      if (this.isValidMove(grid, row, col, num)) {
        possible.push(num);
      }
    }
    return possible;
  }

  private solve(grid: SudokuGrid): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (this.isValidMove(grid, row, col, num)) {
              grid[row][col] = num;
              if (this.solve(grid)) {
                return true;
              }
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  private findAllSolutions(grid: SudokuGrid, solutions: SudokuGrid[], maxSolutions: number): void {
    if (solutions.length >= maxSolutions) return;
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (this.isValidMove(grid, row, col, num)) {
              grid[row][col] = num;
              this.findAllSolutions(grid, solutions, maxSolutions);
              if (solutions.length >= maxSolutions) return;
              grid[row][col] = 0;
            }
          }
          return;
        }
      }
    }
    
    // If we reach here, we found a complete solution
    solutions.push(this.copyGrid(grid));
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// Utility functions for external use
export const sudokuGenerator = new SudokuGenerator();

export function generatePuzzle(difficulty: Difficulty) {
  return sudokuGenerator.generatePuzzle(difficulty);
}

export function solvePuzzle(puzzle: SudokuGrid) {
  return sudokuGenerator.solvePuzzle(puzzle);
}

export function validatePuzzle(puzzle: SudokuGrid) {
  return sudokuGenerator.hasUniqueSolution(puzzle);
}

export function isValidMove(grid: SudokuGrid, row: number, col: number, num: number) {
  return sudokuGenerator.isValidMove(grid, row, col, num);
}