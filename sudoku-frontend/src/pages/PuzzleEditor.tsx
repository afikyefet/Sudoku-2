import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Space, Alert, Spin, message, Divider } from 'antd';
import {
  ArrowLeftOutlined,
  ShareAltOutlined,
  HeartOutlined,
  HeartFilled,
  StarOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import SudokuGame from '../components/SudokuGame';
import { SudokuGrid, createEmptyGrid, analyzePuzzle } from '../utils/sudokuValidator';
import { sudokuAPI } from '../services/api';

const { Title, Text } = Typography;

interface PuzzleData {
  id: string;
  title: string;
  description?: string;
  difficulty: string;
  puzzleData: SudokuGrid;
  solutionData?: SudokuGrid;
  creator: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  ratingCount: number;
  solvedCount: number;
  estimatedTime: number;
  tags: string[];
  isFavorited: boolean;
  createdAt: string;
}

const PuzzleEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isFavorited, setIsFavorited] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (id) {
      loadPuzzle(id);
    }
  }, [id]);

  const loadPuzzle = async (puzzleId: string) => {
    try {
      setLoading(true);
      setError('');

      // Try to fetch from API first
      try {
        const response = await sudokuAPI.getPuzzle(puzzleId);
        if (response.puzzle) {
          const puzzleData = response.puzzle;
          setPuzzle({
            id: puzzleData.id,
            title: puzzleData.title,
            description: (puzzleData as any).description || 'A challenging Sudoku puzzle',
            difficulty: (puzzleData as any).difficulty || 'medium',
            puzzleData: puzzleData.puzzleData,
            solutionData: (puzzleData as any).solutionData,
            creator: {
              id: (puzzleData as any).user || 'unknown',
              name: 'Anonymous Player',
              avatar: undefined
            },
            rating: (puzzleData as any).rating || 0,
            ratingCount: (puzzleData as any).ratingCount || 0,
            solvedCount: (puzzleData as any).solvedCount || 0,
            estimatedTime: (puzzleData as any).estimatedTime || 15,
            tags: (puzzleData as any).tags || [],
            isFavorited: false,
            createdAt: (puzzleData as any).createdAt || new Date().toISOString()
          });
          setIsFavorited(false);
          return;
        }
      } catch (apiError) {
        console.log('API not available, using mock data');
      }

      // Fallback to mock data for demo
      const mockPuzzles: { [key: string]: Partial<PuzzleData> } = {
        '1': {
          title: 'Morning Brain Teaser',
          description: 'A perfect puzzle to start your day with. Classic patterns with a modern twist.',
          difficulty: 'medium',
          puzzleData: [
            [5,3,0,0,7,0,0,0,0],
            [6,0,0,1,9,5,0,0,0],
            [0,9,8,0,0,0,0,6,0],
            [8,0,0,0,6,0,0,0,3],
            [4,0,0,8,0,3,0,0,1],
            [7,0,0,0,2,0,0,0,6],
            [0,6,0,0,0,0,2,8,0],
            [0,0,0,4,1,9,0,0,5],
            [0,0,0,0,8,0,0,7,9]
          ],
          creator: { id: '1', name: 'PuzzleMaster' },
          rating: 4.2,
          ratingCount: 156,
          solvedCount: 432,
          estimatedTime: 12,
          tags: ['classic', 'morning', 'balanced']
        },
        '2': {
          title: 'Expert Challenge #42',
          description: 'For seasoned solvers only. This puzzle will test your advanced techniques.',
          difficulty: 'expert',
          puzzleData: [
            [0,0,0,0,0,0,0,1,0],
            [4,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,6,0,2],
            [0,0,0,0,3,0,0,0,0],
            [5,0,8,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,8,0,0,0],
            [1,0,0,0,0,0,4,0,0],
            [0,0,0,0,0,0,0,0,0]
          ],
          creator: { id: '2', name: 'SudokuSensei' },
          rating: 4.8,
          ratingCount: 67,
          solvedCount: 123,
          estimatedTime: 35,
          tags: ['challenge', 'advanced', 'techniques']
        }
      };

      const mockData = mockPuzzles[puzzleId];
      if (mockData) {
        const analysis = analyzePuzzle(mockData.puzzleData!);
        setPuzzle({
          id: puzzleId,
          title: mockData.title!,
          description: mockData.description,
          difficulty: mockData.difficulty!,
          puzzleData: mockData.puzzleData!,
          creator: mockData.creator!,
          rating: mockData.rating!,
          ratingCount: mockData.ratingCount!,
          solvedCount: mockData.solvedCount!,
          estimatedTime: analysis.estimatedTime,
          tags: mockData.tags!,
          isFavorited: false,
          createdAt: new Date().toISOString()
        });
      } else {
        setError('Puzzle not found');
      }
    } catch (error) {
      console.error('Error loading puzzle:', error);
      setError('Failed to load puzzle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGameComplete = async (grid: SudokuGrid, timeSeconds: number, hintsUsed: number) => {
    try {
      message.success({
        content: `🎉 Puzzle completed in ${Math.floor(timeSeconds / 60)}:${(timeSeconds % 60).toString().padStart(2, '0')}!`,
        duration: 5
      });

      // Update puzzle stats (mock implementation)
      if (puzzle) {
        setPuzzle(prev => prev ? {
          ...prev,
          solvedCount: prev.solvedCount + 1
        } : null);
      }

      // You would typically send this data to the backend here
      console.log('Puzzle completed:', { puzzleId: id, timeSeconds, hintsUsed, grid });
    } catch (error) {
      console.error('Error saving completion:', error);
    }
  };

  const handleGameSave = async (grid: SudokuGrid, timeSeconds: number) => {
    try {
      // Auto-save game state (mock implementation)
      localStorage.setItem(`sudoku_save_${id}`, JSON.stringify({
        grid,
        timeSeconds,
        timestamp: Date.now()
      }));
      
      console.log('Game saved:', { puzzleId: id, timeSeconds, grid });
    } catch (error) {
      console.error('Error saving game:', error);
    }
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    message.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
  };

  const sharePuzzle = () => {
    if (navigator.share) {
      navigator.share({
        title: puzzle?.title,
        text: `Check out this ${puzzle?.difficulty} Sudoku puzzle: ${puzzle?.title}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      message.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Loading puzzle...</Text>
        </div>
      </div>
    );
  }

  if (error || !puzzle) {
    return (
      <div style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center' }}>
        <Alert
          type="error"
          message="Puzzle Not Found"
          description={error || 'The puzzle you\'re looking for doesn\'t exist or has been removed.'}
          showIcon
          action={
            <Button type="primary" onClick={() => navigate('/browse')}>
              Browse Puzzles
            </Button>
          }
        />
      </div>
    );
  }

  // Check for saved game state
  const savedGame = localStorage.getItem(`sudoku_save_${id}`);
  let initialGrid = puzzle.puzzleData;
  
  if (savedGame && !gameStarted) {
    try {
      const saveData = JSON.parse(savedGame);
      const saveAge = Date.now() - saveData.timestamp;
      
      // Only use save if it's less than 24 hours old
      if (saveAge < 24 * 60 * 60 * 1000) {
        initialGrid = saveData.grid;
      }
    } catch (error) {
      console.error('Error loading saved game:', error);
    }
  }

  return (
    <div>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{ marginBottom: 16 }}
            >
              Back
            </Button>
            
            <Title level={2} style={{ margin: '0 0 8px 0' }}>
              {puzzle.title}
            </Title>
            
            {puzzle.description && (
              <Text type="secondary" style={{ fontSize: 16, lineHeight: 1.5 }}>
                {puzzle.description}
              </Text>
            )}
            
            <div style={{ marginTop: 16 }}>
              <Space wrap>
                <Space>
                  <UserOutlined />
                  <Text>by {puzzle.creator.name}</Text>
                </Space>
                <Space>
                  <StarOutlined />
                  <Text>{puzzle.rating.toFixed(1)} ({puzzle.ratingCount} ratings)</Text>
                </Space>
                <Space>
                  <ClockCircleOutlined />
                  <Text>~{puzzle.estimatedTime} min</Text>
                </Space>
                <Text type="secondary">{puzzle.solvedCount} solved</Text>
              </Space>
            </div>
            
            {puzzle.tags.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <Space wrap>
                  {puzzle.tags.map(tag => (
                    <Button key={tag} size="small" type="text">
                      #{tag}
                    </Button>
                  ))}
                </Space>
              </div>
            )}
          </div>
          
          <Space>
            <Button
              icon={isFavorited ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
              onClick={toggleFavorite}
            >
              {isFavorited ? 'Favorited' : 'Favorite'}
            </Button>
            <Button
              icon={<ShareAltOutlined />}
              onClick={sharePuzzle}
            >
              Share
            </Button>
          </Space>
        </div>
      </Card>

      {/* Game Instructions */}
      {!gameStarted && savedGame && (
        <Alert
          type="info"
          message="Saved Game Found"
          description="We found a saved game for this puzzle. Your progress will be restored automatically."
          style={{ marginBottom: 24 }}
          showIcon
        />
      )}

      {/* Game */}
      <SudokuGame
        initialGrid={initialGrid}
        originalGrid={puzzle.puzzleData}
        difficulty={puzzle.difficulty}
        onComplete={handleGameComplete}
        onSave={handleGameSave}
        showTimer={true}
        showHints={true}
        autoSave={true}
      />

      {/* Additional Information */}
      <Card style={{ marginTop: 24 }}>
        <Title level={4}>About This Puzzle</Title>
        <Divider />
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div>
            <Text strong>Difficulty:</Text>
            <div style={{ marginTop: 4 }}>
              <Text style={{ 
                textTransform: 'capitalize',
                color: (() => {
                  const colors: { [key: string]: string } = {
                    easy: '#52c41a',
                    medium: '#faad14',
                    hard: '#fa8c16',
                    expert: '#f5222d',
                    master: '#722ed1'
                  };
                  return colors[puzzle.difficulty] || '#666';
                })()
              }}>
                {puzzle.difficulty}
              </Text>
            </div>
          </div>
          
          <div>
            <Text strong>Created:</Text>
            <div style={{ marginTop: 4 }}>
              <Text type="secondary">
                {new Date(puzzle.createdAt).toLocaleDateString()}
              </Text>
            </div>
          </div>
          
          <div>
            <Text strong>Times Solved:</Text>
            <div style={{ marginTop: 4 }}>
              <Text>{puzzle.solvedCount}</Text>
            </div>
          </div>
          
          <div>
            <Text strong>Average Rating:</Text>
            <div style={{ marginTop: 4 }}>
              <Text>{puzzle.rating.toFixed(1)}/5.0 ({puzzle.ratingCount} votes)</Text>
            </div>
          </div>
        </div>
        
        {puzzle.description && (
          <>
            <Divider />
            <div>
              <Text strong>Description:</Text>
              <div style={{ marginTop: 8 }}>
                <Text>{puzzle.description}</Text>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default PuzzleEditor;