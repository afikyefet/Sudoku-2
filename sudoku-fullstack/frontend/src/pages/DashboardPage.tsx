import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  useDisclosure,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner,
} from '@heroui/react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { sudokuAPI } from '../services/api';
import type { SudokuPuzzle, SudokuInput } from '../types';
import { generateSamplePuzzle } from '../utils/sudokuValidator';

const DashboardPage = () => {
  const [puzzles, setPuzzles] = useState<SudokuPuzzle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newPuzzle, setNewPuzzle] = useState<SudokuInput>({
    title: '',
    puzzleData: generateSamplePuzzle(),
  });
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    fetchPuzzles();
  }, []);

  const fetchPuzzles = async () => {
    try {
      setIsLoading(true);
      const response = await sudokuAPI.getAllPuzzles();
      if (response.success && response.data) {
        setPuzzles(response.data.puzzles || []);
      }
    } catch (error) {
      toast.error('Failed to fetch puzzles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePuzzle = async () => {
    if (!newPuzzle.title.trim()) {
      toast.error('Please enter a puzzle title');
      return;
    }

    try {
      setIsCreating(true);
      const response = await sudokuAPI.createPuzzle(newPuzzle);
      if (response.success) {
        toast.success('Puzzle created successfully!');
        fetchPuzzles();
        setNewPuzzle({ title: '', puzzleData: generateSamplePuzzle() });
        onOpenChange();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create puzzle';
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePuzzle = async (id: string) => {
    try {
      const response = await sudokuAPI.deletePuzzle(id);
      if (response.success) {
        toast.success('Puzzle deleted successfully');
        fetchPuzzles();
      }
    } catch (error) {
      toast.error('Failed to delete puzzle');
    }
  };

  const handlePuzzleDataChange = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed) && parsed.length === 9) {
        const isValid = parsed.every(row => 
          Array.isArray(row) && 
          row.length === 9 && 
          row.every(cell => Number.isInteger(cell) && cell >= 0 && cell <= 9)
        );
        
        if (isValid) {
          setNewPuzzle(prev => ({ ...prev, puzzleData: parsed }));
        } else {
          toast.error('Invalid puzzle format. Must be 9x9 grid with numbers 0-9');
        }
      } else {
        toast.error('Puzzle must be a 9x9 array');
      }
    } catch (error) {
      toast.error('Invalid JSON format');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-default-500">Loading your puzzles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Sudoku Puzzles</h1>
          <p className="text-default-500 mt-1">
            Welcome back, {user?.email}! You have {puzzles.length}/20 puzzles.
          </p>
        </div>
        <Button
          color="primary"
          size="lg"
          onPress={onOpen}
          disabled={puzzles.length >= 20}
          className="w-full sm:w-auto"
        >
          {puzzles.length >= 20 ? 'Puzzle Limit Reached' : 'Create New Puzzle'}
        </Button>
      </div>

      {/* Puzzles Grid */}
      {puzzles.length === 0 ? (
        <Card className="text-center py-12">
          <CardBody>
            <div className="text-6xl mb-4">🧩</div>
            <h2 className="text-2xl font-bold mb-2">No puzzles yet</h2>
            <p className="text-default-500 mb-6">
              Create your first Sudoku puzzle to get started!
            </p>
            <Button color="primary" size="lg" onPress={onOpen}>
              Create Your First Puzzle
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {puzzles.map((puzzle) => (
            <Card key={puzzle._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex justify-between">
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold">{puzzle.title}</h3>
                  <p className="text-small text-default-500">
                    Created {formatDate(puzzle.createdAt)}
                  </p>
                </div>
                <Dropdown>
                  <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="light">
                      ⋮
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Puzzle actions">
                    <DropdownItem
                      key="play"
                      onClick={() => navigate(`/puzzle/${puzzle._id}`)}
                    >
                      Play Puzzle
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      color="danger"
                      onClick={() => handleDeletePuzzle(puzzle._id)}
                    >
                      Delete
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </CardHeader>
              
              <CardBody>
                <div className="grid grid-cols-9 gap-px bg-default-300 p-2 rounded-lg aspect-square">
                  {puzzle.puzzleData.flat().map((cell, index) => (
                    <div
                      key={index}
                      className="bg-content1 flex items-center justify-center text-xs font-medium"
                    >
                      {cell || ''}
                    </div>
                  ))}
                </div>
              </CardBody>
              
              <CardFooter>
                <Button
                  color="primary"
                  variant="flat"
                  className="w-full"
                  onClick={() => navigate(`/puzzle/${puzzle._id}`)}
                >
                  Play Puzzle
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Puzzle Modal */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Create New Puzzle
                <p className="text-small text-default-500 font-normal">
                  Upload a new Sudoku puzzle (0 for empty cells)
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <Input
                    label="Puzzle Title"
                    placeholder="Enter puzzle title (e.g., Easy Puzzle 1)"
                    value={newPuzzle.title}
                    onChange={(e) => setNewPuzzle(prev => ({ 
                      ...prev, 
                      title: e.target.value 
                    }))}
                    variant="bordered"
                    isRequired
                  />
                  
                  <Textarea
                    label="Puzzle Data (JSON)"
                    placeholder="Paste or edit the puzzle data..."
                    value={JSON.stringify(newPuzzle.puzzleData, null, 2)}
                    onChange={(e) => handlePuzzleDataChange(e.target.value)}
                    variant="bordered"
                    minRows={8}
                    className="font-mono text-small"
                  />
                  
                  <div className="bg-default-100 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Preview:</h4>
                    <div className="grid grid-cols-9 gap-px bg-default-300 max-w-xs aspect-square">
                      {newPuzzle.puzzleData.flat().map((cell, index) => (
                        <div
                          key={index}
                          className="bg-content1 flex items-center justify-center text-xs font-medium"
                        >
                          {cell || ''}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-small text-blue-800">
                      <strong>Format:</strong> 9x9 array with numbers 0-9 (0 = empty cell)
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="danger" 
                  variant="light" 
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleCreatePuzzle}
                  isLoading={isCreating}
                  disabled={!newPuzzle.title.trim() || isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create Puzzle'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default DashboardPage;