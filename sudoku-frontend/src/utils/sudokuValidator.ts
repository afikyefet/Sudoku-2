/**
 * Comprehensive Sudoku Validation and Helper Functions
 * Handles all aspects of Sudoku validation, solving, and game logic
 */

export type SudokuGrid = number[][];
export type CellPosition = { row: number; col: number };

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  conflicts: CellPosition[];
  completionPercentage: number;
  isComplete: boolean;
  isSolvable: boolean;
}

export interface SudokuAnalysis {
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'master';
  filledCells: number;
  emptyCells: number;
  solutionCount: number;
  techniques: string[];
  estimatedTime: number;
}

/**
 * Validates a single move in the Sudoku grid
 */
export function isValidMove(grid: SudokuGrid, row: number, col: number, value: number): boolean {
  if (value === 0) return true; // Allow clearing cells
  if (value < 1 || value > 9) return false;
  if (row < 0 || row > 8 || col < 0 || col > 8) return false;

  // Check row for duplicates
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c] === value) {
      return false;
    }
  }

  // Check column for duplicates
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col] === value) {
      return false;
    }
  }

  // Check 3x3 subgrid for duplicates
  const subgridRow = Math.floor(row / 3) * 3;
  const subgridCol = Math.floor(col / 3) * 3;
  
  for (let r = subgridRow; r < subgridRow + 3; r++) {
    for (let c = subgridCol; c < subgridCol + 3; c++) {
      if ((r !== row || c !== col) && grid[r][c] === value) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Validates the entire Sudoku grid
 */
export function validatePuzzle(grid: SudokuGrid): ValidationResult {
  const errors: string[] = [];
  const conflicts: CellPosition[] = [];
  let filledCells = 0;
  let totalCells = 81;

  // Check grid dimensions
  if (!grid || grid.length !== 9) {
    errors.push('Grid must be 9x9');
    return {
      isValid: false,
      errors,
      conflicts,
      completionPercentage: 0,
      isComplete: false,
      isSolvable: false
    };
  }

  // Validate each cell and collect conflicts
  for (let row = 0; row < 9; row++) {
    if (!grid[row] || grid[row].length !== 9) {
      errors.push(`Row ${row + 1} must have 9 cells`);
      continue;
    }

    for (let col = 0; col < 9; col++) {
      const value = grid[row][col];
      
      if (value !== 0) {
        filledCells++;
        
        // Validate cell value
        if (!Number.isInteger(value) || value < 0 || value > 9) {
          errors.push(`Invalid value ${value} at row ${row + 1}, column ${col + 1}`);
          conflicts.push({ row, col });
          continue;
        }

        // Check for conflicts
        if (!isValidMove(grid, row, col, value)) {
          conflicts.push({ row, col });
        }
      }
    }
  }

  // Check rows for completeness and validity
  for (let row = 0; row < 9; row++) {
    const rowValues = grid[row].filter(val => val !== 0);
    const uniqueValues = new Set(rowValues);
    if (rowValues.length !== uniqueValues.size) {
      errors.push(`Row ${row + 1} has duplicate values`);
    }
  }

  // Check columns for completeness and validity
  for (let col = 0; col < 9; col++) {
    const colValues = [];
    for (let row = 0; row < 9; row++) {
      if (grid[row][col] !== 0) {
        colValues.push(grid[row][col]);
      }
    }
    const uniqueValues = new Set(colValues);
    if (colValues.length !== uniqueValues.size) {
      errors.push(`Column ${col + 1} has duplicate values`);
    }
  }

  // Check 3x3 subgrids
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const boxValues = [];
      for (let row = boxRow * 3; row < boxRow * 3 + 3; row++) {
        for (let col = boxCol * 3; col < boxCol * 3 + 3; col++) {
          if (grid[row][col] !== 0) {
            boxValues.push(grid[row][col]);
          }
        }
      }
      const uniqueValues = new Set(boxValues);
      if (boxValues.length !== uniqueValues.size) {
        errors.push(`3x3 box at position (${boxRow + 1}, ${boxCol + 1}) has duplicate values`);
      }
    }
  }

  const completionPercentage = (filledCells / totalCells) * 100;
  const isComplete = filledCells === totalCells && errors.length === 0 && conflicts.length === 0;
  const isValid = conflicts.length === 0;
  const isSolvable = isValid && (isComplete || canBeSolved(grid));

  return {
    isValid,
    errors,
    conflicts,
    completionPercentage,
    isComplete,
    isSolvable
  };
}

/**
 * Checks if a puzzle can be solved (has at least one solution)
 */
export function canBeSolved(grid: SudokuGrid): boolean {
  const gridCopy = grid.map(row => [...row]);
  return solveSudoku(gridCopy);
}

/**
 * Solves a Sudoku puzzle using backtracking
 */
export function solveSudoku(grid: SudokuGrid): boolean {
  const emptyCell = findEmptyCell(grid);
  if (!emptyCell) {
    return true; // Puzzle is solved
  }

  const { row, col } = emptyCell;

  for (let num = 1; num <= 9; num++) {
    if (isValidMove(grid, row, col, num)) {
      grid[row][col] = num;

      if (solveSudoku(grid)) {
        return true;
      }

      grid[row][col] = 0; // Backtrack
    }
  }

  return false;
}

/**
 * Finds the first empty cell in the grid
 */
function findEmptyCell(grid: SudokuGrid): CellPosition | null {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        return { row, col };
      }
    }
  }
  return null;
}

/**
 * Gets all cells that should be highlighted (same row, column, or subgrid)
 */
export function getHighlightedCells(selectedRow: number, selectedCol: number): CellPosition[] {
  const highlighted: CellPosition[] = [];

  // Highlight row
  for (let col = 0; col < 9; col++) {
    highlighted.push({ row: selectedRow, col });
  }

  // Highlight column
  for (let row = 0; row < 9; row++) {
    highlighted.push({ row, col: selectedCol });
  }

  // Highlight 3x3 subgrid
  const subgridRow = Math.floor(selectedRow / 3) * 3;
  const subgridCol = Math.floor(selectedCol / 3) * 3;
  
  for (let row = subgridRow; row < subgridRow + 3; row++) {
    for (let col = subgridCol; col < subgridCol + 3; col++) {
      highlighted.push({ row, col });
    }
  }

  return highlighted;
}

/**
 * Analyzes a Sudoku puzzle for difficulty and other metrics
 */
export function analyzePuzzle(grid: SudokuGrid): SudokuAnalysis {
  const filledCells = grid.flat().filter(cell => cell !== 0).length;
  const emptyCells = 81 - filledCells;
  
  // Determine difficulty based on filled cells and complexity
  let difficulty: SudokuAnalysis['difficulty'];
  if (filledCells >= 36) difficulty = 'easy';
  else if (filledCells >= 32) difficulty = 'medium';
  else if (filledCells >= 28) difficulty = 'hard';
  else if (filledCells >= 22) difficulty = 'expert';
  else difficulty = 'master';

  // Count possible solutions (limited to 2 for performance)
  const solutionCount = countSolutions(grid, 2);
  
  // Estimate solving time based on difficulty
  const baseTime = {
    easy: 5,
    medium: 12,
    hard: 25,
    expert: 45,
    master: 90
  };

  const estimatedTime = baseTime[difficulty] + Math.random() * 10 - 5; // Add some variance

  // Identify required solving techniques (simplified)
  const techniques = identifyRequiredTechniques(grid);

  return {
    difficulty,
    filledCells,
    emptyCells,
    solutionCount,
    techniques,
    estimatedTime: Math.max(1, Math.round(estimatedTime))
  };
}

/**
 * Counts the number of solutions for a puzzle (up to maxSolutions)
 */
function countSolutions(grid: SudokuGrid, maxSolutions: number = 2): number {
  const solutions: SudokuGrid[] = [];
  const gridCopy = grid.map(row => [...row]);
  
  function solve(g: SudokuGrid): void {
    if (solutions.length >= maxSolutions) return;
    
    const emptyCell = findEmptyCell(g);
    if (!emptyCell) {
      solutions.push(g.map(row => [...row]));
      return;
    }

    const { row, col } = emptyCell;
    for (let num = 1; num <= 9; num++) {
      if (isValidMove(g, row, col, num)) {
        g[row][col] = num;
        solve(g);
        g[row][col] = 0;
      }
    }
  }

  solve(gridCopy);
  return solutions.length;
}

/**
 * Identifies solving techniques required for a puzzle
 */
function identifyRequiredTechniques(grid: SudokuGrid): string[] {
  const techniques: string[] = ['Basic Logic'];
  
  // This is a simplified version - a full implementation would analyze
  // specific solving patterns like naked pairs, hidden singles, etc.
  const filledCells = grid.flat().filter(cell => cell !== 0).length;
  
  if (filledCells < 30) {
    techniques.push('Advanced Logic');
  }
  
  if (filledCells < 25) {
    techniques.push('Backtracking');
  }
  
  return techniques;
}

/**
 * Creates an empty 9x9 Sudoku grid
 */
export function createEmptyGrid(): SudokuGrid {
  return Array(9).fill(null).map(() => Array(9).fill(0));
}

/**
 * Deep clones a Sudoku grid
 */
export function cloneGrid(grid: SudokuGrid): SudokuGrid {
  return grid.map(row => [...row]);
}

/**
 * Checks if two grids are identical
 */
export function gridsEqual(grid1: SudokuGrid, grid2: SudokuGrid): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid1[row][col] !== grid2[row][col]) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Converts grid to a string for storage or transmission
 */
export function gridToString(grid: SudokuGrid): string {
  return grid.flat().join('');
}

/**
 * Converts string back to grid
 */
export function stringToGrid(str: string): SudokuGrid {
  if (str.length !== 81) {
    throw new Error('Invalid grid string length');
  }
  
  const grid = createEmptyGrid();
  for (let i = 0; i < 81; i++) {
    const row = Math.floor(i / 9);
    const col = i % 9;
    grid[row][col] = parseInt(str[i]) || 0;
  }
  
  return grid;
}

/**
 * Gets possible values for a specific cell
 */
export function getPossibleValues(grid: SudokuGrid, row: number, col: number): number[] {
  if (grid[row][col] !== 0) return []; // Cell is already filled
  
  const possible: number[] = [];
  for (let num = 1; num <= 9; num++) {
    if (isValidMove(grid, row, col, num)) {
      possible.push(num);
    }
  }
  return possible;
}

/**
 * Gets a hint for the next move
 */
export function getHint(grid: SudokuGrid): { row: number; col: number; value: number } | null {
  // Find cell with fewest possibilities
  let bestCell: { row: number; col: number; possibilities: number[] } | null = null;
  
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const possibilities = getPossibleValues(grid, row, col);
        if (possibilities.length === 1) {
          // Found a cell with only one possibility - return it immediately
          return { row, col, value: possibilities[0] };
        }
        
        if (!bestCell || possibilities.length < bestCell.possibilities.length) {
          bestCell = { row, col, possibilities };
        }
      }
    }
  }
  
  if (bestCell && bestCell.possibilities.length > 0) {
    return {
      row: bestCell.row,
      col: bestCell.col,
      value: bestCell.possibilities[0]
    };
  }
  
  return null;
}

/**
 * Validates puzzle data format for upload
 */
export function validatePuzzleFormat(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    errors.push('Puzzle data must be an object');
    return { isValid: false, errors };
  }
  
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Puzzle must have a valid title');
  }
  
  if (!data.puzzleData || !Array.isArray(data.puzzleData)) {
    errors.push('Puzzle data must be an array');
    return { isValid: false, errors };
  }
  
  if (data.puzzleData.length !== 9) {
    errors.push('Puzzle must have exactly 9 rows');
    return { isValid: false, errors };
  }
  
  for (let i = 0; i < 9; i++) {
    if (!Array.isArray(data.puzzleData[i]) || data.puzzleData[i].length !== 9) {
      errors.push(`Row ${i + 1} must have exactly 9 columns`);
      continue;
    }
    
    for (let j = 0; j < 9; j++) {
      const value = data.puzzleData[i][j];
      if (!Number.isInteger(value) || value < 0 || value > 9) {
        errors.push(`Invalid value ${value} at row ${i + 1}, column ${j + 1}. Must be 0-9.`);
      }
    }
  }
  
  // Check if puzzle has enough clues
  const filledCells = data.puzzleData.flat().filter((cell: number) => cell !== 0).length;
  if (filledCells < 17) {
    errors.push('Puzzle must have at least 17 filled cells for a unique solution');
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Formats time in minutes and seconds
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculates score based on time and difficulty
 */
export function calculateScore(timeSeconds: number, difficulty: string, hintsUsed: number = 0): number {
  const baseScores = {
    easy: 100,
    medium: 200,
    hard: 350,
    expert: 500,
    master: 750
  };
  
  const baseScore = baseScores[difficulty as keyof typeof baseScores] || 100;
  const timeBonus = Math.max(0, 1000 - timeSeconds); // Bonus for speed
  const hintPenalty = hintsUsed * 25; // Penalty for using hints
  
  return Math.max(10, Math.round(baseScore + timeBonus - hintPenalty));
}