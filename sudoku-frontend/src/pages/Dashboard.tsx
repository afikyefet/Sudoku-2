import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Input, 
  Card, 
  CardBody, 
  CardHeader, 
  CardFooter,
  Textarea, 
  RadioGroup, 
  Radio,
  Chip,
  Spinner,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem
} from '@heroui/react';
import { useAuth } from '../contexts/AuthContext';
import { sudokuAPI, handleApiError } from '../services/api';
import { SudokuPuzzle, CreatePuzzleData } from '../types';
import { createEmptyGrid, parsePuzzleFromJSON, puzzleToJSON } from '../utils/sudokuValidation';

/**
 * Dashboard Page Component
 */
const Dashboard: React.FC = () => {
  const [puzzles, setPuzzles] = useState<SudokuPuzzle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'json' | 'manual'>('json');
  
  // Form states
  const [title, setTitle] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [manualGrid, setManualGrid] = useState<number[][]>(createEmptyGrid());
  const [uploading, setUploading] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /**
   * Load user puzzles
   */
  const loadPuzzles = async () => {
    try {
      setLoading(true);
      const response = await sudokuAPI.getPuzzles();
      setPuzzles(response.puzzles);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load puzzles on component mount
   */
  useEffect(() => {
    loadPuzzles();
  }, []);

  /**
   * Handle puzzle deletion
   */
  const handleDeletePuzzle = async (puzzleId: string) => {
    if (!window.confirm('Are you sure you want to delete this puzzle?')) {
      return;
    }

    try {
      await sudokuAPI.deletePuzzle(puzzleId);
      setPuzzles(puzzles.filter(p => p.id !== puzzleId));
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  /**
   * Handle manual grid cell change
   */
  const handleManualCellChange = (row: number, col: number, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0 || numValue > 9) return;

    const newGrid = manualGrid.map((r, rIndex) =>
      r.map((c, cIndex) => (rIndex === row && cIndex === col ? numValue : c))
    );
    setManualGrid(newGrid);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please enter a title for your puzzle');
      return;
    }

    let puzzleData: number[][];

    if (uploadMethod === 'json') {
      const parsed = parsePuzzleFromJSON(jsonInput);
      if (!parsed) {
        setError('Invalid JSON format. Please check the example format.');
        return;
      }
      puzzleData = parsed;
    } else {
      puzzleData = manualGrid;
    }

    // Check if puzzle has some filled cells
    const filledCells = puzzleData.flat().filter(cell => cell !== 0).length;
    if (filledCells === 0) {
      setError('Please add some numbers to your puzzle');
      return;
    }

    setUploading(true);

    try {
      const createData: CreatePuzzleData = {
        title: title.trim(),
        puzzleData
      };

      const response = await sudokuAPI.createPuzzle(createData);
      setPuzzles([response.puzzle, ...puzzles]);
      
      // Reset form
      setTitle('');
      setJsonInput('');
      setManualGrid(createEmptyGrid());
      setShowUploadForm(false);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setUploading(false);
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /**
   * Sample JSON for reference
   */
  const sampleJSON = puzzleToJSON('Easy Puzzle 1', [
    [0,0,0,2,6,0,7,0,1],
    [6,8,0,0,7,0,0,9,0],
    [1,9,0,0,0,4,5,0,0],
    [8,2,0,1,0,0,0,4,0],
    [0,0,4,6,0,2,9,0,0],
    [0,5,0,0,0,3,0,2,8],
    [0,0,9,3,0,0,0,7,4],
    [0,4,0,0,5,0,0,3,6],
    [7,0,3,0,1,8,0,0,0]
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-8">
          <CardBody className="text-center space-y-4">
            <Spinner size="lg" color="primary" />
            <p className="text-gray-600">Loading your puzzles...</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">🧩 Sudoku Master</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Dashboard Stats */}
          <div className="mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">📊</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Your Puzzles
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {puzzles.length} / 20
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              disabled={puzzles.length >= 20}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showUploadForm ? 'Cancel Upload' : 'Upload New Puzzle'}
            </button>
            {puzzles.length >= 20 && (
              <p className="text-sm text-red-600 flex items-center">
                ⚠️ You've reached the maximum of 20 puzzles. Delete some to add new ones.
              </p>
            )}
          </div>

          {/* Upload Form */}
          {showUploadForm && (
            <div className="mb-8 bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload New Puzzle</h2>
              
              {/* Upload Method Selection */}
              <div className="mb-4">
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="uploadMethod"
                      value="json"
                      checked={uploadMethod === 'json'}
                      onChange={(e) => setUploadMethod(e.target.value as 'json')}
                      className="mr-2"
                    />
                    Upload JSON
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="uploadMethod"
                      value="manual"
                      checked={uploadMethod === 'manual'}
                      onChange={(e) => setUploadMethod(e.target.value as 'manual')}
                      className="mr-2"
                    />
                    Manual Entry
                  </label>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Puzzle Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 input-field w-full"
                    placeholder="Enter puzzle title"
                    required
                  />
                </div>

                {uploadMethod === 'json' ? (
                  <div>
                    <label htmlFor="jsonInput" className="block text-sm font-medium text-gray-700">
                      Puzzle JSON
                    </label>
                    <textarea
                      id="jsonInput"
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      className="mt-1 input-field w-full h-40"
                      placeholder={`Example format:\n${sampleJSON}`}
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Use 0 for empty cells, numbers 1-9 for filled cells. Each row should have exactly 9 numbers.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Manual Grid Entry
                    </label>
                    <div className="grid grid-cols-9 gap-1 w-fit">
                      {manualGrid.map((row, rowIndex) =>
                        row.map((cell, colIndex) => (
                          <input
                            key={`${rowIndex}-${colIndex}`}
                            type="text"
                            value={cell === 0 ? '' : cell.toString()}
                            onChange={(e) => handleManualCellChange(rowIndex, colIndex, e.target.value)}
                            className="w-8 h-8 text-center border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            maxLength={1}
                          />
                        ))
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Enter numbers 1-9, leave empty for blank cells
                    </p>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="btn-primary disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload Puzzle'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Puzzles Grid */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Puzzles</h2>
            {puzzles.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🧩</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No puzzles yet</h3>
                <p className="text-gray-500 mb-4">Upload your first Sudoku puzzle to get started!</p>
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="btn-primary"
                >
                  Upload Puzzle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {puzzles.map((puzzle) => (
                  <div key={puzzle.id} className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{puzzle.title}</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Created: {new Date(puzzle.createdAt).toLocaleDateString()}
                    </p>
                    
                    {/* Mini puzzle preview */}
                    <div className="grid grid-cols-9 gap-px mb-4 w-fit mx-auto">
                      {puzzle.puzzleData.map((row, rowIndex) =>
                        row.map((cell, colIndex) => (
                          <div
                            key={`${rowIndex}-${colIndex}`}
                            className="w-3 h-3 border border-gray-300 flex items-center justify-center text-xs bg-gray-50"
                          >
                            {cell || ''}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/puzzle/${puzzle.id}`)}
                        className="btn-primary flex-1 text-sm"
                      >
                        Play
                      </button>
                      <button
                        onClick={() => handleDeletePuzzle(puzzle.id)}
                        className="btn-secondary text-sm text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;