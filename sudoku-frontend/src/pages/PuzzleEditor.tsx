import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sudokuAPI, handleApiError } from '../services/api';
import { SudokuPuzzle, CellPosition } from '../types';
import { validatePuzzle } from '../utils/sudokuValidation';
import SudokuGrid from '../components/SudokuGrid';

/**
 * Puzzle Editor Page Component
 */
const PuzzleEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [puzzle, setPuzzle] = useState<SudokuPuzzle | null>(null);
  const [currentGrid, setCurrentGrid] = useState<number[][]>([]);
  const [originalGrid, setOriginalGrid] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validation, setValidation] = useState({ isValid: true, errors: new Set<string>(), isCompleted: false });

  /**
   * Load puzzle data
   */
  const loadPuzzle = async () => {
    if (!id) {
      setError('No puzzle ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await sudokuAPI.getPuzzle(id);
      const puzzleData = response.puzzle;
      
      setPuzzle(puzzleData);
      setCurrentGrid(puzzleData.puzzleData.map(row => [...row]));
      setOriginalGrid(puzzleData.puzzleData.map(row => [...row]));
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load puzzle on component mount
   */
  useEffect(() => {
    loadPuzzle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /**
   * Validate puzzle whenever current grid changes
   */
  useEffect(() => {
    if (currentGrid.length > 0) {
      const validationResult = validatePuzzle(currentGrid);
      setValidation(validationResult);
    }
  }, [currentGrid]);

  /**
   * Handle cell click
   */
  const handleCellClick = (row: number, col: number) => {
    // Only allow selection of non-original cells
    if (originalGrid[row][col] === 0) {
      setSelectedCell({ row, col });
    }
  };

  /**
   * Handle cell value change
   */
  const handleCellChange = (row: number, col: number, value: number) => {
    // Don't allow changes to original cells
    if (originalGrid[row][col] !== 0) return;

    const newGrid = currentGrid.map((r, rIndex) =>
      r.map((c, cIndex) => (rIndex === row && cIndex === col ? value : c))
    );
    setCurrentGrid(newGrid);
  };

  /**
   * Handle number pad click (for mobile/accessibility)
   */
  const handleNumberPadClick = (number: number) => {
    if (selectedCell && originalGrid[selectedCell.row][selectedCell.col] === 0) {
      handleCellChange(selectedCell.row, selectedCell.col, number);
    }
  };

  /**
   * Clear selected cell
   */
  const handleClearCell = () => {
    if (selectedCell && originalGrid[selectedCell.row][selectedCell.col] === 0) {
      handleCellChange(selectedCell.row, selectedCell.col, 0);
    }
  };

  /**
   * Reset puzzle to original state
   */
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the puzzle? All your progress will be lost.')) {
      setCurrentGrid(originalGrid.map(row => [...row]));
      setSelectedCell(null);
    }
  };

  /**
   * Get completion message
   */
  const getCompletionMessage = () => {
    if (validation.isCompleted) {
      return "🎉 Congratulations! You've solved the puzzle!";
    }
    if (!validation.isValid) {
      return "❌ There are some errors in your solution. Keep trying!";
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading puzzle...</p>
        </div>
      </div>
    );
  }

  if (error || !puzzle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error || 'Puzzle not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-secondary"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{puzzle.title}</h1>
                <p className="text-sm text-gray-600">Welcome, {user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleReset}
                className="btn-secondary"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Status Messages */}
        {getCompletionMessage() && (
          <div className={`mb-6 px-4 py-3 rounded-md text-center font-medium ${
            validation.isCompleted 
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-600'
          }`}>
            {getCompletionMessage()}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sudoku Grid */}
          <div className="flex-1 flex justify-center">
            <div className="space-y-4">
              <SudokuGrid
                puzzle={currentGrid}
                originalPuzzle={originalGrid}
                selectedCell={selectedCell}
                onCellClick={handleCellClick}
                onCellChange={handleCellChange}
                errors={validation.errors}
              />
              
              {/* Grid Status */}
              <div className="text-center text-sm text-gray-600">
                {validation.errors.size > 0 && (
                  <span className="text-red-600">
                    {validation.errors.size} error{validation.errors.size > 1 ? 's' : ''}
                  </span>
                )}
                {validation.errors.size === 0 && !validation.isCompleted && (
                  <span className="text-green-600">No errors found</span>
                )}
              </div>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="lg:w-80 w-full">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Controls</h3>
              
              {/* Number Pad */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Number Pad</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                    <button
                      key={number}
                      onClick={() => handleNumberPadClick(number)}
                      disabled={!selectedCell || originalGrid[selectedCell?.row || 0][selectedCell?.col || 0] !== 0}
                      className="btn-secondary h-12 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {number}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleClearCell}
                  disabled={!selectedCell || originalGrid[selectedCell?.row || 0][selectedCell?.col || 0] !== 0}
                  className="btn-secondary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
              </div>

              {/* Instructions */}
              <div className="space-y-3 text-sm text-gray-600">
                <h4 className="text-sm font-medium text-gray-700">How to Play</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Click on an empty cell to select it</li>
                  <li>Use the number pad or keyboard to enter numbers</li>
                  <li>Each row, column, and 3×3 box must contain digits 1-9</li>
                  <li>Gray cells are part of the original puzzle and cannot be changed</li>
                  <li>Red highlighting indicates conflicting numbers</li>
                </ul>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="mt-6 space-y-2 text-sm text-gray-600">
                <h4 className="text-sm font-medium text-gray-700">Keyboard Shortcuts</h4>
                <div className="space-y-1">
                  <div><kbd className="bg-gray-100 px-1 rounded">1-9</kbd> Enter number</div>
                  <div><kbd className="bg-gray-100 px-1 rounded">0</kbd> or <kbd className="bg-gray-100 px-1 rounded">Backspace</kbd> Clear cell</div>
                  <div><kbd className="bg-gray-100 px-1 rounded">Arrow keys</kbd> Navigate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PuzzleEditor;