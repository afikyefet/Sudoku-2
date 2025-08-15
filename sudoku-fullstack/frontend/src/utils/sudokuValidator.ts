// Sudoku validation utilities

/**
 * Check if a number can be placed at a specific position in the grid
 */
export const isValidPlacement = (grid: number[][], row: number, col: number, num: number): boolean => {
  // Check row
  for (let i = 0; i < 9; i++) {
    if (i !== col && grid[row][i] === num) {
      return false;
    }
  }

  // Check column
  for (let i = 0; i < 9; i++) {
    if (i !== row && grid[i][col] === num) {
      return false;
    }
  }

  // Check 3x3 subgrid
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;

  for (let i = startRow; i < startRow + 3; i++) {
    for (let j = startCol; j < startCol + 3; j++) {
      if ((i !== row || j !== col) && grid[i][j] === num) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Get all conflicting cells for a specific position and number
 */
export const getConflictingCells = (grid: number[][], row: number, col: number, num: number): string[] => {
  const conflicts: string[] = [];

  // Check row conflicts
  for (let i = 0; i < 9; i++) {
    if (i !== col && grid[row][i] === num) {
      conflicts.push(`${row}-${i}`);
    }
  }

  // Check column conflicts
  for (let i = 0; i < 9; i++) {
    if (i !== row && grid[i][col] === num) {
      conflicts.push(`${i}-${col}`);
    }
  }

  // Check 3x3 subgrid conflicts
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;

  for (let i = startRow; i < startRow + 3; i++) {
    for (let j = startCol; j < startCol + 3; j++) {
      if ((i !== row || j !== col) && grid[i][j] === num) {
        conflicts.push(`${i}-${j}`);
      }
    }
  }

  return conflicts;
};

/**
 * Check if the entire Sudoku grid is valid (no conflicts)
 */
export const isValidGrid = (grid: number[][]): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const num = grid[row][col];
      if (num !== 0 && !isValidPlacement(grid, row, col, num)) {
        return false;
      }
    }
  }
  return true;
};

/**
 * Check if the Sudoku is completely solved
 */
export const isSudokuComplete = (grid: number[][]): boolean => {
  // First check if all cells are filled
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        return false;
      }
    }
  }

  // Then check if the grid is valid
  return isValidGrid(grid);
};

/**
 * Get all cells that should be highlighted (same row, column, or subgrid)
 */
export const getHighlightedCells = (selectedRow: number, selectedCol: number): string[] => {
  const highlighted: string[] = [];

  // Add all cells in the same row
  for (let col = 0; col < 9; col++) {
    highlighted.push(`${selectedRow}-${col}`);
  }

  // Add all cells in the same column
  for (let row = 0; row < 9; row++) {
    highlighted.push(`${row}-${selectedCol}`);
  }

  // Add all cells in the same 3x3 subgrid
  const startRow = Math.floor(selectedRow / 3) * 3;
  const startCol = Math.floor(selectedCol / 3) * 3;

  for (let row = startRow; row < startRow + 3; row++) {
    for (let col = startCol; col < startCol + 3; col++) {
      highlighted.push(`${row}-${col}`);
    }
  }

  return [...new Set(highlighted)]; // Remove duplicates
};

/**
 * Create a deep copy of the grid
 */
export const cloneGrid = (grid: number[][]): number[][] => {
  return grid.map(row => [...row]);
};

/**
 * Generate a sample Sudoku puzzle (for demo purposes)
 */
export const generateSamplePuzzle = (): number[][] => {
  return [
    [0, 0, 0, 2, 6, 0, 7, 0, 1],
    [6, 8, 0, 0, 7, 0, 0, 9, 0],
    [1, 9, 0, 0, 0, 4, 5, 0, 0],
    [8, 2, 0, 1, 0, 0, 0, 4, 0],
    [0, 0, 4, 6, 0, 2, 9, 0, 0],
    [0, 5, 0, 0, 0, 3, 0, 2, 8],
    [0, 0, 9, 3, 0, 0, 0, 7, 4],
    [0, 4, 0, 0, 5, 0, 0, 3, 6],
    [7, 0, 3, 0, 1, 8, 0, 0, 0]
  ];
};

/**
 * Difficulty levels for Sudoku generation
 */
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

/**
 * Configuration for different difficulty levels
 */
const DIFFICULTY_CONFIG: Record<DifficultyLevel, { minClues: number; maxClues: number }> = {
  easy: { minClues: 36, maxClues: 46 },
  medium: { minClues: 28, maxClues: 35 },
  hard: { minClues: 22, maxClues: 27 },
  expert: { minClues: 17, maxClues: 21 }
};

/**
 * Create an empty 9x9 grid
 */
const createEmptyGrid = (): number[][] => {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
};

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Check if placing a number at a position is valid (for generation)
 */
const isValidForGeneration = (grid: number[][], row: number, col: number, num: number): boolean => {
  // Check row
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num) return false;
  }

  // Check column
  for (let i = 0; i < 9; i++) {
    if (grid[i][col] === num) return false;
  }

  // Check 3x3 box
  const boxStartRow = Math.floor(row / 3) * 3;
  const boxStartCol = Math.floor(col / 3) * 3;
  for (let i = boxStartRow; i < boxStartRow + 3; i++) {
    for (let j = boxStartCol; j < boxStartCol + 3; j++) {
      if (grid[i][j] === num) return false;
    }
  }

  return true;
};

/**
 * Fill the grid using backtracking to create a complete valid Sudoku
 */
const fillGrid = (grid: number[][]): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);

        for (const num of numbers) {
          if (isValidForGeneration(grid, row, col, num)) {
            grid[row][col] = num;

            if (fillGrid(grid)) {
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
};

/**
 * Solve the Sudoku using backtracking (for validation)
 */
const solveSudoku = (grid: number[][]): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValidForGeneration(grid, row, col, num)) {
            grid[row][col] = num;

            if (solveSudoku(grid)) {
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
};

/**
 * Count the number of solutions for a given puzzle
 */
const countSolutions = (grid: number[][], limit = 2): number => {
  let count = 0;

  const solve = (): void => {
    if (count >= limit) return;

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValidForGeneration(grid, row, col, num)) {
              grid[row][col] = num;
              solve();
              grid[row][col] = 0;
            }
          }
          return;
        }
      }
    }
    count++;
  };

  solve();
  return count;
};

/**
 * Remove cells from a complete grid to create a puzzle
 */
const removeNumbers = (grid: number[][], targetClues: number): number[][] => {
  const puzzle = cloneGrid(grid);
  const cells = [];

  // Create list of all cell positions
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      cells.push({ row, col });
    }
  }

  // Shuffle the cells
  const shuffledCells = shuffleArray(cells);

  // Remove numbers while maintaining unique solution
  for (const { row, col } of shuffledCells) {
    const currentClues = puzzle.flat().filter(cell => cell !== 0).length;
    if (currentClues <= targetClues) break;

    const backup = puzzle[row][col];
    puzzle[row][col] = 0;

    // Check if puzzle still has unique solution
    const testGrid = cloneGrid(puzzle);
    const solutions = countSolutions(testGrid, 2);

    if (solutions !== 1) {
      // Restore the number if removing it creates multiple solutions
      puzzle[row][col] = backup;
    }
  }

  return puzzle;
};

/**
 * Generate a random Sudoku puzzle with specified difficulty
 */
export const generateRandomSudoku = (difficulty: DifficultyLevel = 'medium'): number[][] => {
  try {
    // Create a complete valid Sudoku grid
    const completeGrid = createEmptyGrid();

    // Fill the grid with a valid solution
    if (!fillGrid(completeGrid)) {
      console.warn('Failed to generate complete grid, using sample puzzle');
      return generateSamplePuzzle();
    }

    // Get difficulty configuration
    const config = DIFFICULTY_CONFIG[difficulty];
    const targetClues = Math.floor(
      Math.random() * (config.maxClues - config.minClues + 1) + config.minClues
    );

    // Remove numbers to create the puzzle
    const puzzle = removeNumbers(completeGrid, targetClues);

    // Verify the puzzle is valid
    if (!isValidGrid(puzzle)) {
      console.warn('Generated invalid puzzle, using sample puzzle');
      return generateSamplePuzzle();
    }

    return puzzle;
  } catch (error) {
    console.error('Error generating Sudoku:', error);
    return generateSamplePuzzle();
  }
};

/**
 * Generate multiple sample puzzles for different difficulties
 */
export const generateSamplePuzzles = (): Record<DifficultyLevel, number[][]> => {
  return {
    easy: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ],
    medium: [
      [0, 2, 0, 6, 0, 8, 0, 0, 0],
      [5, 8, 0, 0, 0, 9, 7, 0, 0],
      [0, 0, 0, 0, 4, 0, 0, 0, 0],
      [3, 7, 0, 0, 0, 0, 5, 0, 0],
      [6, 0, 0, 0, 0, 0, 0, 0, 4],
      [0, 0, 8, 0, 0, 0, 0, 1, 3],
      [0, 0, 0, 0, 2, 0, 0, 0, 0],
      [0, 0, 9, 8, 0, 0, 0, 3, 6],
      [0, 0, 0, 3, 0, 6, 0, 9, 0]
    ],
    hard: [
      [0, 0, 0, 6, 0, 0, 4, 0, 0],
      [7, 0, 0, 0, 0, 3, 6, 0, 0],
      [0, 0, 0, 0, 9, 1, 0, 8, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 5, 0, 1, 8, 0, 0, 0, 3],
      [0, 0, 0, 3, 0, 6, 0, 4, 5],
      [0, 4, 0, 2, 0, 0, 0, 6, 0],
      [9, 0, 3, 0, 0, 0, 0, 0, 0],
      [0, 2, 0, 0, 0, 0, 1, 0, 0]
    ],
    expert: [
      [0, 0, 0, 0, 0, 6, 0, 0, 0],
      [0, 5, 9, 0, 0, 0, 0, 0, 8],
      [2, 0, 0, 0, 0, 8, 0, 0, 0],
      [0, 4, 5, 0, 0, 0, 0, 0, 0],
      [0, 0, 3, 0, 0, 0, 0, 0, 0],
      [0, 0, 6, 0, 0, 3, 0, 5, 4],
      [0, 0, 0, 3, 2, 5, 0, 0, 6],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
  };
};

/**
 * Check if a cell is part of the original puzzle (fixed cell)
 */
export const isFixedCell = (originalGrid: number[][], row: number, col: number): boolean => {
  return originalGrid[row][col] !== 0;
};