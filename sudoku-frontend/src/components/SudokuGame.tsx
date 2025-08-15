import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Button, Space, Typography, Progress, Alert, message, Statistic, Badge } from 'antd';
import {
  UndoOutlined,
  RedoOutlined,
  BulbOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import {
  SudokuGrid,
  CellPosition,
  ValidationResult,
  isValidMove,
  validatePuzzle,
  getHighlightedCells,
  getHint,
  cloneGrid,
  gridsEqual,
  formatTime,
  calculateScore
} from '../utils/sudokuValidator';

const { Title, Text } = Typography;

interface SudokuGameProps {
  initialGrid: SudokuGrid;
  originalGrid: SudokuGrid;
  onComplete?: (grid: SudokuGrid, timeSeconds: number, hintsUsed: number) => void;
  onSave?: (grid: SudokuGrid, timeSeconds: number) => void;
  difficulty?: string;
  readOnly?: boolean;
  showTimer?: boolean;
  showHints?: boolean;
  autoSave?: boolean;
}

interface GameMove {
  grid: SudokuGrid;
  position: CellPosition;
  value: number;
  timestamp: number;
}

const SudokuGame: React.FC<SudokuGameProps> = ({
  initialGrid,
  originalGrid,
  onComplete,
  onSave,
  difficulty = 'medium',
  readOnly = false,
  showTimer = true,
  showHints = true,
  autoSave = true
}) => {
  const [currentGrid, setCurrentGrid] = useState<SudokuGrid>(() => cloneGrid(initialGrid));
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [gameHistory, setGameHistory] = useState<GameMove[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [startTime] = useState<number>(Date.now());
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [showErrors, setShowErrors] = useState(false);

  // Timer effect
  useEffect(() => {
    if (isCompleted || readOnly) return;

    const timer = setInterval(() => {
      setCurrentTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, isCompleted, readOnly]);

  // Auto-save effect
  useEffect(() => {
    if (autoSave && onSave && !isCompleted && currentTime > 0 && currentTime % 30 === 0) {
      onSave(currentGrid, currentTime);
    }
  }, [currentTime, currentGrid, autoSave, onSave, isCompleted]);

  // Validation effect
  useEffect(() => {
    const validation = validatePuzzle(currentGrid);
    setErrors(validation.errors);
    
    if (validation.isComplete && !isCompleted) {
      setIsCompleted(true);
      message.success({
        content: '🎉 Congratulations! Puzzle completed!',
        duration: 5,
        className: 'celebration'
      });
      onComplete?.(currentGrid, currentTime, hintsUsed);
    }
  }, [currentGrid, isCompleted, currentTime, hintsUsed, onComplete]);

  // Calculate validation and highlighting
  const validation = useMemo(() => validatePuzzle(currentGrid), [currentGrid]);
  const highlightedCells = useMemo(() => 
    selectedCell ? getHighlightedCells(selectedCell.row, selectedCell.col) : [],
    [selectedCell]
  );

  const handleCellClick = useCallback((row: number, col: number) => {
    if (readOnly || isCompleted) return;
    setSelectedCell({ row, col });
  }, [readOnly, isCompleted]);

  const makeMove = useCallback((row: number, col: number, value: number) => {
    if (readOnly || isCompleted) return;
    
    // Don't allow editing original puzzle cells
    if (originalGrid[row][col] !== 0) return;

    const newGrid = cloneGrid(currentGrid);
    const oldValue = newGrid[row][col];
    
    // Validate the move
    if (value !== 0 && !isValidMove(newGrid, row, col, value)) {
      message.warning('Invalid move! This number conflicts with the rules.');
      return;
    }

    newGrid[row][col] = value;

    // Add to history
    const move: GameMove = {
      grid: cloneGrid(newGrid),
      position: { row, col },
      value,
      timestamp: Date.now()
    };

    const newHistory = gameHistory.slice(0, historyIndex + 1);
    newHistory.push(move);
    
    setGameHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentGrid(newGrid);

    // Auto-advance to next empty cell
    if (value !== 0) {
      findNextEmptyCell(newGrid, row, col);
    }
  }, [currentGrid, originalGrid, gameHistory, historyIndex, readOnly, isCompleted]);

  const findNextEmptyCell = (grid: SudokuGrid, currentRow: number, currentCol: number) => {
    // Look for next empty cell in reading order
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0 && originalGrid[r][c] === 0) {
          // Skip current cell if it's the same
          if (r === currentRow && c === currentCol) continue;
          
          setSelectedCell({ row: r, col: c });
          return;
        }
      }
    }
  };

  const handleNumberInput = useCallback((num: number) => {
    if (!selectedCell) return;
    makeMove(selectedCell.row, selectedCell.col, num);
  }, [selectedCell, makeMove]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (readOnly || isCompleted || !selectedCell) return;

    const { key } = event;
    
    if (key >= '1' && key <= '9') {
      handleNumberInput(parseInt(key));
    } else if (key === '0' || key === 'Backspace' || key === 'Delete') {
      handleNumberInput(0);
    } else if (key === 'ArrowUp' && selectedCell.row > 0) {
      setSelectedCell({ ...selectedCell, row: selectedCell.row - 1 });
    } else if (key === 'ArrowDown' && selectedCell.row < 8) {
      setSelectedCell({ ...selectedCell, row: selectedCell.row + 1 });
    } else if (key === 'ArrowLeft' && selectedCell.col > 0) {
      setSelectedCell({ ...selectedCell, col: selectedCell.col - 1 });
    } else if (key === 'ArrowRight' && selectedCell.col < 8) {
      setSelectedCell({ ...selectedCell, col: selectedCell.col + 1 });
    }
  }, [selectedCell, handleNumberInput, readOnly, isCompleted]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentGrid(cloneGrid(gameHistory[historyIndex - 1].grid));
    }
  }, [historyIndex, gameHistory]);

  const redo = useCallback(() => {
    if (historyIndex < gameHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentGrid(cloneGrid(gameHistory[historyIndex + 1].grid));
    }
  }, [historyIndex, gameHistory]);

  const getHintForPlayer = useCallback(() => {
    const hint = getHint(currentGrid);
    if (hint) {
      setHintsUsed(prev => prev + 1);
      setSelectedCell({ row: hint.row, col: hint.col });
      makeMove(hint.row, hint.col, hint.value);
      message.info(`Hint: Added ${hint.value} at row ${hint.row + 1}, column ${hint.col + 1}`);
    } else {
      message.warning('No hints available for this puzzle state.');
    }
  }, [currentGrid, makeMove]);

  const resetGame = useCallback(() => {
    setCurrentGrid(cloneGrid(initialGrid));
    setSelectedCell(null);
    setGameHistory([]);
    setHistoryIndex(-1);
    setIsCompleted(false);
    setHintsUsed(0);
    setErrors([]);
    setShowErrors(false);
  }, [initialGrid]);

  const getCellClassName = (row: number, col: number) => {
    const classes = ['sudoku-cell'];
    
    // Original puzzle cells
    if (originalGrid[row][col] !== 0) {
      classes.push('original');
    }
    
    // Selected cell
    if (selectedCell?.row === row && selectedCell?.col === col) {
      classes.push('selected');
    }
    
    // Highlighted cells (same row, col, or subgrid)
    if (highlightedCells.some(cell => cell.row === row && cell.col === col)) {
      classes.push('highlighted');
    }
    
    // Invalid cells
    if (validation.conflicts.some(cell => cell.row === row && cell.col === col)) {
      classes.push('invalid');
    }
    
    // Completed cells
    if (isCompleted) {
      classes.push('completed');
    }
    
    return classes.join(' ');
  };

  const score = calculateScore(currentTime, difficulty, hintsUsed);

  return (
    <div className="sudoku-game">
      {/* Game Header */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Sudoku {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Title>
            <Space>
              <Badge color={validation.isValid ? 'green' : 'red'} text={`${Math.round(validation.completionPercentage)}% Complete`} />
              {isCompleted && <Badge color="gold" text="Completed!" />}
            </Space>
          </div>
          
          <Space wrap>
            {showTimer && (
              <Statistic
                title="Time"
                value={formatTime(currentTime)}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ fontSize: 16 }}
              />
            )}
            <Statistic
              title="Score"
              value={score}
              prefix={<TrophyOutlined />}
              valueStyle={{ fontSize: 16, color: '#52c41a' }}
            />
            {hintsUsed > 0 && (
              <Statistic
                title="Hints Used"
                value={hintsUsed}
                prefix={<BulbOutlined />}
                valueStyle={{ fontSize: 16, color: '#faad14' }}
              />
            )}
          </Space>
        </div>
      </Card>

      {/* Error Display */}
      {errors.length > 0 && showErrors && (
        <Alert
          type="warning"
          message="Validation Errors"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {errors.map((error, index) => <li key={index}>{error}</li>)}
            </ul>
          }
          closable
          onClose={() => setShowErrors(false)}
          style={{ marginBottom: 16 }}
        />
      )}

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Sudoku Grid */}
        <div style={{ flex: '1 1 auto', minWidth: 300 }}>
          <Card>
            <div className="sudoku-grid" style={{ maxWidth: 450, margin: '0 auto' }}>
              {currentGrid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={getCellClassName(rowIndex, colIndex)}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Cell ${rowIndex + 1}-${colIndex + 1}, value ${cell || 'empty'}`}
                  >
                    {cell || ''}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Controls Panel */}
        <div style={{ flex: '0 0 280px' }}>
          {/* Number Pad */}
          <Card title="Number Pad" style={{ marginBottom: 16 }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: 8,
              marginBottom: 16
            }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <Button
                  key={num}
                  size="large"
                  onClick={() => handleNumberInput(num)}
                  disabled={!selectedCell || readOnly || isCompleted}
                  style={{ aspectRatio: '1', fontSize: '18px', fontWeight: 'bold' }}
                >
                  {num}
                </Button>
              ))}
            </div>
            
            <Button
              block
              size="large"
              onClick={() => handleNumberInput(0)}
              disabled={!selectedCell || readOnly || isCompleted}
            >
              Clear Cell
            </Button>
          </Card>

          {/* Game Controls */}
          <Card title="Game Controls">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
                <Button
                  icon={<UndoOutlined />}
                  onClick={undo}
                  disabled={historyIndex <= 0 || readOnly}
                >
                  Undo
                </Button>
                <Button
                  icon={<RedoOutlined />}
                  onClick={redo}
                  disabled={historyIndex >= gameHistory.length - 1 || readOnly}
                >
                  Redo
                </Button>
              </Space>

              {showHints && (
                <Button
                  type="primary"
                  icon={<BulbOutlined />}
                  onClick={getHintForPlayer}
                  disabled={readOnly || isCompleted}
                  block
                >
                  Get Hint ({hintsUsed} used)
                </Button>
              )}

              <Button
                icon={<CheckOutlined />}
                onClick={() => setShowErrors(!showErrors)}
                danger={errors.length > 0}
                block
              >
                {showErrors ? 'Hide' : 'Show'} Validation ({errors.length} errors)
              </Button>

              <Button
                icon={<ReloadOutlined />}
                onClick={resetGame}
                disabled={readOnly}
                block
              >
                Reset Game
              </Button>
            </Space>
          </Card>

          {/* Progress */}
          <Card title="Progress" style={{ marginTop: 16 }}>
            <Progress
              percent={Math.round(validation.completionPercentage)}
              status={isCompleted ? 'success' : validation.isValid ? 'active' : 'exception'}
              strokeColor={isCompleted ? '#52c41a' : validation.isValid ? '#1890ff' : '#ff4d4f'}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              <div>Filled: {81 - validation.conflicts.length - (81 - currentGrid.flat().filter(c => c !== 0).length)} / 81 cells</div>
              <div>Valid: {validation.isValid ? 'Yes' : `No (${validation.conflicts.length} conflicts)`}</div>
              {validation.isSolvable !== undefined && (
                <div>Solvable: {validation.isSolvable ? 'Yes' : 'No'}</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SudokuGame;