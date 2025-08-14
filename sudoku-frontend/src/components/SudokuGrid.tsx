import React from 'react';
import SudokuCell from './SudokuCell';
import { SudokuGridProps } from '../types';
import { getHighlightedCells } from '../utils/sudokuValidation';

/**
 * Sudoku Grid Component
 */
const SudokuGrid: React.FC<SudokuGridProps> = ({
  puzzle,
  originalPuzzle,
  selectedCell,
  onCellClick,
  onCellChange,
  errors
}) => {
  /**
   * Get highlighted cells based on selected cell
   */
  const highlightedCells = selectedCell 
    ? getHighlightedCells(selectedCell.row, selectedCell.col)
    : new Set<string>();

  /**
   * Check if a cell is original (pre-filled)
   */
  const isOriginalCell = (row: number, col: number): boolean => {
    return originalPuzzle[row][col] !== 0;
  };

  /**
   * Check if a cell is selected
   */
  const isSelectedCell = (row: number, col: number): boolean => {
    return selectedCell?.row === row && selectedCell?.col === col;
  };

  /**
   * Check if a cell should be highlighted
   */
  const isHighlightedCell = (row: number, col: number): boolean => {
    return highlightedCells.has(`${row}-${col}`) && !isSelectedCell(row, col);
  };

  /**
   * Check if a cell has an error
   */
  const isCellInvalid = (row: number, col: number): boolean => {
    return errors.has(`${row}-${col}`);
  };

  return (
    <div className="grid grid-cols-9 grid-rows-9 gap-0 w-fit mx-auto border-2 border-gray-800 bg-white">
      {puzzle.map((row, rowIndex) =>
        row.map((cellValue, colIndex) => (
          <SudokuCell
            key={`${rowIndex}-${colIndex}`}
            value={cellValue}
            row={rowIndex}
            col={colIndex}
            isOriginal={isOriginalCell(rowIndex, colIndex)}
            isSelected={isSelectedCell(rowIndex, colIndex)}
            isHighlighted={isHighlightedCell(rowIndex, colIndex)}
            isInvalid={isCellInvalid(rowIndex, colIndex)}
            onClick={onCellClick}
            onChange={onCellChange}
          />
        ))
      )}
    </div>
  );
};

export default SudokuGrid;