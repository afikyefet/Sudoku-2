import React, { useState } from 'react';
import { SudokuCellProps } from '../types';

/**
 * Individual Sudoku Cell Component
 */
const SudokuCell: React.FC<SudokuCellProps> = ({
  value,
  row,
  col,
  isOriginal,
  isSelected,
  isHighlighted,
  isInvalid,
  onClick,
  onChange
}) => {
  const [inputValue, setInputValue] = useState<string>(value === 0 ? '' : value.toString());

  /**
   * Handle cell click
   */
  const handleClick = () => {
    if (!isOriginal) {
      onClick(row, col);
    }
  };

  /**
   * Handle input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isOriginal) return;

    const newValue = e.target.value;
    
    // Allow only single digits 1-9 or empty
    if (newValue === '' || /^[1-9]$/.test(newValue)) {
      setInputValue(newValue);
      const numValue = newValue === '' ? 0 : parseInt(newValue, 10);
      onChange(row, col, numValue);
    }
  };

  /**
   * Handle key down for better UX
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isOriginal) return;

    // Allow backspace, delete, and arrow keys
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab'].includes(e.key)) {
      return;
    }

    // Allow digits 1-9
    if (/^[1-9]$/.test(e.key)) {
      return;
    }

    // Prevent all other keys
    e.preventDefault();
  };

  /**
   * Update input value when prop changes
   */
  React.useEffect(() => {
    setInputValue(value === 0 ? '' : value.toString());
  }, [value]);

  /**
   * Determine cell classes
   */
  const getCellClasses = (): string => {
    let classes = 'sudoku-cell';
    
    if (isOriginal) {
      classes += ' sudoku-cell-filled cursor-not-allowed';
    } else {
      classes += ' sudoku-cell-empty';
    }
    
    if (isSelected) {
      classes += ' sudoku-cell-selected';
    } else if (isHighlighted) {
      classes += ' sudoku-cell-highlighted';
    }
    
    if (isInvalid) {
      classes += ' sudoku-cell-invalid';
    }

    // Add thick borders for 3x3 subgrid separation
    if (row % 3 === 0 && row !== 0) {
      classes += ' border-t-2 border-t-gray-800';
    }
    if (col % 3 === 0 && col !== 0) {
      classes += ' border-l-2 border-l-gray-800';
    }
    if (row === 8) {
      classes += ' border-b-2 border-b-gray-800';
    }
    if (col === 8) {
      classes += ' border-r-2 border-r-gray-800';
    }

    return classes;
  };

  if (isOriginal) {
    // Render as non-editable div for original puzzle cells
    return (
      <div
        className={getCellClasses()}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={`Cell ${row + 1}-${col + 1}, value ${value || 'empty'}, original`}
      >
        {value || ''}
      </div>
    );
  }

  // Render as input for editable cells
  return (
    <input
      type="text"
      value={inputValue}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      className={`${getCellClasses()} text-center focus:outline-none`}
      maxLength={1}
      aria-label={`Cell ${row + 1}-${col + 1}, ${isInvalid ? 'invalid' : 'valid'}`}
      autoComplete="off"
    />
  );
};

export default SudokuCell;