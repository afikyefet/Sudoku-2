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
 * Check if a cell is part of the original puzzle (fixed cell)
 */
export const isFixedCell = (originalGrid: number[][], row: number, col: number): boolean => {
  return originalGrid[row][col] !== 0;
};