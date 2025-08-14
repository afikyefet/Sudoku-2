import { ValidationResult } from '../types';

/**
 * Check if a number is valid in a specific cell
 */
export const isValidMove = (
  puzzle: number[][],
  row: number,
  col: number,
  num: number
): boolean => {
  if (num === 0) return true; // Empty cell is always valid
  
  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && puzzle[row][c] === num) {
      return false;
    }
  }
  
  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && puzzle[r][col] === num) {
      return false;
    }
  }
  
  // Check 3x3 subgrid
  const subgridRow = Math.floor(row / 3) * 3;
  const subgridCol = Math.floor(col / 3) * 3;
  
  for (let r = subgridRow; r < subgridRow + 3; r++) {
    for (let c = subgridCol; c < subgridCol + 3; c++) {
      if ((r !== row || c !== col) && puzzle[r][c] === num) {
        return false;
      }
    }
  }
  
  return true;
};

/**
 * Get all cells that should be highlighted when a cell is selected
 */
export const getHighlightedCells = (row: number, col: number): Set<string> => {
  const highlighted = new Set<string>();
  
  // Highlight row
  for (let c = 0; c < 9; c++) {
    highlighted.add(`${row}-${c}`);
  }
  
  // Highlight column
  for (let r = 0; r < 9; r++) {
    highlighted.add(`${r}-${col}`);
  }
  
  // Highlight 3x3 subgrid
  const subgridRow = Math.floor(row / 3) * 3;
  const subgridCol = Math.floor(col / 3) * 3;
  
  for (let r = subgridRow; r < subgridRow + 3; r++) {
    for (let c = subgridCol; c < subgridCol + 3; c++) {
      highlighted.add(`${r}-${c}`);
    }
  }
  
  return highlighted;
};

/**
 * Validate the entire puzzle and return errors
 */
export const validatePuzzle = (puzzle: number[][]): ValidationResult => {
  const errors = new Set<string>();
  let filledCells = 0;
  
  // Check each cell
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const value = puzzle[row][col];
      
      if (value !== 0) {
        filledCells++;
        
        // Temporarily set cell to 0 to check if the value would be valid
        const tempPuzzle = puzzle.map(r => [...r]);
        tempPuzzle[row][col] = 0;
        
        if (!isValidMove(tempPuzzle, row, col, value)) {
          errors.add(`${row}-${col}`);
        }
      }
    }
  }
  
  const isValid = errors.size === 0;
  const isCompleted = isValid && filledCells === 81;
  
  return {
    isValid,
    errors,
    isCompleted
  };
};

/**
 * Check if a puzzle is solvable (has at least one solution)
 */
export const isSolvable = (puzzle: number[][]): boolean => {
  const solvePuzzle = (board: number[][]): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValidMove(board, row, col, num)) {
              board[row][col] = num;
              
              if (solvePuzzle(board)) {
                return true;
              }
              
              board[row][col] = 0; // Backtrack
            }
          }
          return false;
        }
      }
    }
    return true;
  };
  
  // Create a copy to avoid modifying the original
  const puzzleCopy = puzzle.map(row => [...row]);
  return solvePuzzle(puzzleCopy);
};

/**
 * Generate a completely empty 9x9 grid
 */
export const createEmptyGrid = (): number[][] => {
  return Array(9).fill(null).map(() => Array(9).fill(0));
};

/**
 * Parse puzzle data from JSON string
 */
export const parsePuzzleFromJSON = (jsonString: string): number[][] | null => {
  try {
    const data = JSON.parse(jsonString);
    
    if (data.puzzleData && Array.isArray(data.puzzleData)) {
      const puzzle = data.puzzleData;
      
      // Validate structure
      if (puzzle.length !== 9 || !puzzle.every((row: any) => 
        Array.isArray(row) && row.length === 9 && 
        row.every((cell: any) => typeof cell === 'number' && cell >= 0 && cell <= 9)
      )) {
        return null;
      }
      
      return puzzle;
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Convert puzzle data to JSON string for uploading
 */
export const puzzleToJSON = (title: string, puzzleData: number[][]): string => {
  return JSON.stringify({
    title,
    puzzleData
  }, null, 2);
};

/**
 * Get the subgrid index for a given cell
 */
export const getSubgridIndex = (row: number, col: number): number => {
  return Math.floor(row / 3) * 3 + Math.floor(col / 3);
};

/**
 * Check if two cells are in the same subgrid
 */
export const areInSameSubgrid = (row1: number, col1: number, row2: number, col2: number): boolean => {
  return getSubgridIndex(row1, col1) === getSubgridIndex(row2, col2);
};