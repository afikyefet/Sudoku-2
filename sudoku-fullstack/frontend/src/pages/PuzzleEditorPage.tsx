import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
} from '@heroui/react';
import { toast } from 'react-hot-toast';
import { sudokuAPI } from '../services/api';
import type { SudokuPuzzle } from '../types';
import {
  cloneGrid,
  isValidPlacement,
  getConflictingCells,
  getHighlightedCells,
  isFixedCell,
  isSudokuComplete,
} from '../utils/sudokuValidator';

const PuzzleEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [puzzle, setPuzzle] = useState<SudokuPuzzle | null>(null);
  const [gameGrid, setGameGrid] = useState<number[][]>([]);
  const [originalGrid, setOriginalGrid] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(new Set());
  const [conflictCells, setConflictCells] = useState<Set<string>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const fetchPuzzle = useCallback(async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const response = await sudokuAPI.getPuzzleById(id);
      if (response.success && response.data?.puzzle) {
        const puzzleData = response.data.puzzle;
        setPuzzle(puzzleData);
        setOriginalGrid(puzzleData.puzzleData);
        setGameGrid(cloneGrid(puzzleData.puzzleData));
      } else {
        toast.error('Puzzle not found');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Failed to load puzzle');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchPuzzle();
  }, [fetchPuzzle]);

  useEffect(() => {
    if (selectedCell) {
      const highlighted = getHighlightedCells(selectedCell.row, selectedCell.col);
      setHighlightedCells(new Set(highlighted));
    } else {
      setHighlightedCells(new Set());
    }
  }, [selectedCell]);

  useEffect(() => {
    if (gameGrid.length > 0) {
      const completed = isSudokuComplete(gameGrid);
      if (completed && !isCompleted) {
        setIsCompleted(true);
        onOpen();
        toast.success('🎉 Congratulations! Puzzle solved!');
      }
    }
  }, [gameGrid, isCompleted, onOpen]);

  const handleCellClick = (row: number, col: number) => {
    if (isFixedCell(originalGrid, row, col)) return;
    
    setSelectedCell({ row, col });
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell || isFixedCell(originalGrid, selectedCell.row, selectedCell.col)) {
      return;
    }

    const newGrid = cloneGrid(gameGrid);
    const { row, col } = selectedCell;

    // If clicking the same number, remove it (toggle behavior)
    if (newGrid[row][col] === num) {
      newGrid[row][col] = 0;
    } else {
      newGrid[row][col] = num;
    }

    // Update conflicts
    const conflicts = new Set<string>();
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cellValue = newGrid[r][c];
        if (cellValue !== 0 && !isValidPlacement(newGrid, r, c, cellValue)) {
          conflicts.add(`${r}-${c}`);
          // Also add all conflicting cells for this position
          const cellConflicts = getConflictingCells(newGrid, r, c, cellValue);
          cellConflicts.forEach(conflict => conflicts.add(conflict));
        }
      }
    }

    setConflictCells(conflicts);
    setGameGrid(newGrid);
  };

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!selectedCell) return;

    const num = parseInt(event.key);
    if (num >= 1 && num <= 9) {
      handleNumberInput(num);
    } else if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') {
      handleNumberInput(0);
    } else if (event.key === 'ArrowUp' && selectedCell.row > 0) {
      setSelectedCell({ ...selectedCell, row: selectedCell.row - 1 });
    } else if (event.key === 'ArrowDown' && selectedCell.row < 8) {
      setSelectedCell({ ...selectedCell, row: selectedCell.row + 1 });
    } else if (event.key === 'ArrowLeft' && selectedCell.col > 0) {
      setSelectedCell({ ...selectedCell, col: selectedCell.col - 1 });
    } else if (event.key === 'ArrowRight' && selectedCell.col < 8) {
      setSelectedCell({ ...selectedCell, col: selectedCell.col + 1 });
    }
  }, [selectedCell]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const resetPuzzle = () => {
    setGameGrid(cloneGrid(originalGrid));
    setConflictCells(new Set());
    setIsCompleted(false);
    toast.success('Puzzle reset');
  };

  const getCellClass = (row: number, col: number) => {
    const cellKey = `${row}-${col}`;
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isHighlighted = highlightedCells.has(cellKey);
    const isConflict = conflictCells.has(cellKey);
    const isFixed = isFixedCell(originalGrid, row, col);

    let classes = 'sudoku-cell';
    
    if (isSelected) classes += ' selected';
    else if (isHighlighted) classes += ' highlighted';
    
    if (isConflict) classes += ' invalid';
    if (isFixed) classes += ' fixed';

    return classes;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-default-500">Loading puzzle...</p>
        </div>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Puzzle not found</h2>
        <Button color="primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{puzzle.title}</h1>
          <p className="text-default-500">
            Created {new Date(puzzle.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            color="warning"
            variant="flat"
            onClick={resetPuzzle}
            disabled={isCompleted}
          >
            Reset
          </Button>
          <Button
            color="default"
            variant="flat"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sudoku Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <h3 className="text-lg font-semibold">Sudoku Grid</h3>
                <div className="flex gap-2">
                  {conflictCells.size > 0 && (
                    <Chip color="danger" size="sm">
                      {conflictCells.size} Error{conflictCells.size !== 1 ? 's' : ''}
                    </Chip>
                  )}
                  {isCompleted && (
                    <Chip color="success" size="sm">
                      ✓ Completed!
                    </Chip>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="sudoku-grid mx-auto">
                {gameGrid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={getCellClass(rowIndex, colIndex)}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      {cell || ''}
                    </div>
                  ))
                )}
              </div>
              <p className="text-small text-default-500 text-center mt-4">
                Click a cell and use number keys 1-9, or click the number buttons below
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Number Input */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Numbers</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <Button
                    key={num}
                    variant="flat"
                    color="primary"
                    onClick={() => handleNumberInput(num)}
                    disabled={!selectedCell || isFixedCell(originalGrid, selectedCell.row, selectedCell.col)}
                    className="aspect-square text-lg font-bold"
                  >
                    {num}
                  </Button>
                ))}
              </div>
              <Button
                variant="flat"
                color="danger"
                onClick={() => handleNumberInput(0)}
                disabled={!selectedCell || isFixedCell(originalGrid, selectedCell.row, selectedCell.col)}
                className="w-full mt-2"
              >
                Clear (0)
              </Button>
            </CardBody>
          </Card>

          {/* Game Info */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Game Info</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex justify-between">
                <span className="text-default-600">Filled cells:</span>
                <span className="font-semibold">
                  {gameGrid.flat().filter(cell => cell !== 0).length}/81
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-default-600">Errors:</span>
                <span className={conflictCells.size > 0 ? 'text-danger font-semibold' : 'text-success'}>
                  {conflictCells.size}
                </span>
              </div>
              
              <div className="space-y-2 text-small text-default-500">
                <p><strong>Controls:</strong></p>
                <ul className="space-y-1 ml-2">
                  <li>• Click cell + number key</li>
                  <li>• Arrow keys to navigate</li>
                  <li>• Backspace/Delete to clear</li>
                </ul>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Completion Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                🎉 Puzzle Completed!
              </ModalHeader>
              <ModalBody>
                <div className="text-center py-4">
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="text-xl font-bold mb-2">Congratulations!</h3>
                  <p className="text-default-600">
                    You've successfully solved "{puzzle.title}"!
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="primary" 
                  onPress={() => {
                    onClose();
                    navigate('/dashboard');
                  }}
                >
                  Back to Dashboard
                </Button>
                <Button 
                  color="secondary" 
                  variant="flat"
                  onPress={() => {
                    onClose();
                    resetPuzzle();
                  }}
                >
                  Play Again
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default PuzzleEditorPage;