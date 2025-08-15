import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Button,
  Steps,
  Row,
  Col,
  Input,
  Select,
  Tag,
  Space,
  Alert,
  Divider,
  theme,
  message,
  Spin,
  Tabs,
  Form,
  InputNumber,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  ThunderboltOutlined,
  CheckOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  PlayCircleOutlined,
  BulbOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

type CreateMethod = 'manual' | 'random';
type Difficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'master';

interface PuzzleData {
  title: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  puzzleGrid: number[][];
  solutionGrid: number[][];
  isPublic: boolean;
}

const CreatePuzzle: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [createMethod, setCreateMethod] = useState<CreateMethod>('manual');
  const [puzzleData, setPuzzleData] = useState<PuzzleData>({
    title: '',
    description: '',
    difficulty: 'medium',
    tags: [],
    puzzleGrid: Array(9).fill(null).map(() => Array(9).fill(0)),
    solutionGrid: Array(9).fill(null).map(() => Array(9).fill(0)),
    isPublic: true,
  });
  const [loading, setLoading] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [validationResult, setValidationResult] = useState<{isValid: boolean, errors: string[]}>({
    isValid: true,
    errors: []
  });
  
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const difficultyConfig = {
    easy: { label: 'Easy', color: '#52c41a', description: '36-45 given numbers', hints: [36, 45] },
    medium: { label: 'Medium', color: '#faad14', description: '28-35 given numbers', hints: [28, 35] },
    hard: { label: 'Hard', color: '#fa8c16', description: '22-27 given numbers', hints: [22, 27] },
    expert: { label: 'Expert', color: '#f5222d', description: '17-21 given numbers', hints: [17, 21] },
    master: { label: 'Master', color: '#722ed1', description: '16-17 given numbers', hints: [16, 17] },
  };

  const steps = [
    {
      title: 'Choose Method',
      description: 'Manual or Random',
    },
    {
      title: 'Create Grid',
      description: 'Design your puzzle',
    },
    {
      title: 'Add Details',
      description: 'Title, tags, etc.',
    },
    {
      title: 'Publish',
      description: 'Review and save',
    },
  ];

  const generateRandomPuzzle = async (difficulty: Difficulty) => {
    setLoading(true);
    try {
      // Simulate puzzle generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock generated puzzle data
      const mockPuzzle = Array(9).fill(null).map(() => Array(9).fill(0));
      const mockSolution = Array(9).fill(null).map((_, row) => 
        Array(9).fill(null).map((_, col) => (row * 9 + col % 9) + 1)
      );
      
      // Add some random filled cells based on difficulty
      const config = difficultyConfig[difficulty];
      const numHints = Math.floor(Math.random() * (config.hints[1] - config.hints[0] + 1)) + config.hints[0];
      
      for (let i = 0; i < numHints; i++) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        if (mockPuzzle[row][col] === 0) {
          mockPuzzle[row][col] = mockSolution[row][col];
        }
      }
      
      setPuzzleData(prev => ({
        ...prev,
        puzzleGrid: mockPuzzle,
        solutionGrid: mockSolution,
        difficulty
      }));
      
      message.success(`Generated ${difficulty} puzzle with ${numHints} hints!`);
      setCurrentStep(2); // Skip to details step
    } catch (error) {
      message.error('Failed to generate puzzle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validatePuzzle = (grid: number[][]) => {
    const errors: string[] = [];
    let filledCells = 0;

    // Count filled cells
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] !== 0) filledCells++;
      }
    }

    // Check minimum filled cells
    const config = difficultyConfig[puzzleData.difficulty];
    if (filledCells < config.hints[0]) {
      errors.push(`Too few hints for ${puzzleData.difficulty} difficulty. Minimum: ${config.hints[0]}, Current: ${filledCells}`);
    }
    if (filledCells > config.hints[1]) {
      errors.push(`Too many hints for ${puzzleData.difficulty} difficulty. Maximum: ${config.hints[1]}, Current: ${filledCells}`);
    }

    // Basic validation (check for duplicates in rows, columns, boxes)
    // This is a simplified version - real implementation would be more thorough
    for (let i = 0; i < 9; i++) {
      const row = grid[i].filter(cell => cell !== 0);
      const col = grid.map(r => r[i]).filter(cell => cell !== 0);
      
      if (new Set(row).size !== row.length) {
        errors.push(`Duplicate numbers in row ${i + 1}`);
      }
      if (new Set(col).size !== col.length) {
        errors.push(`Duplicate numbers in column ${i + 1}`);
      }
    }

    setValidationResult({
      isValid: errors.length === 0,
      errors
    });

    return errors.length === 0;
  };

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col });
  };

  const handleCellChange = (value: number) => {
    if (selectedCell) {
      const newGrid = [...puzzleData.puzzleGrid];
      newGrid[selectedCell.row][selectedCell.col] = value;
      setPuzzleData(prev => ({ ...prev, puzzleGrid: newGrid }));
      validatePuzzle(newGrid);
    }
  };

  const handleSubmit = async () => {
    if (!validatePuzzle(puzzleData.puzzleGrid)) {
      message.error('Please fix validation errors before publishing');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      message.success('Puzzle created successfully!');
      navigate('/dashboard');
    } catch (error) {
      message.error('Failed to create puzzle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderMethodSelection = () => (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <Title level={2} style={{ marginBottom: 32 }}>
        How would you like to create your puzzle?
      </Title>
      
      <Row gutter={[32, 32]} justify="center">
        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            style={{
              borderRadius: 16,
              border: createMethod === 'manual' ? `2px solid ${token.colorPrimary}` : '1px solid #f0f0f0',
              cursor: 'pointer'
            }}
            bodyStyle={{ padding: 32, textAlign: 'center' }}
            onClick={() => setCreateMethod('manual')}
          >
            <EditOutlined style={{ fontSize: 48, color: token.colorPrimary, marginBottom: 16 }} />
            <Title level={3}>Manual Creation</Title>
            <Text type="secondary">
              Design your puzzle by hand. Fill in the grid cell by cell with complete control over every detail.
            </Text>
            <div style={{ marginTop: 16 }}>
              <Tag color="blue">Full Control</Tag>
              <Tag color="green">Custom Patterns</Tag>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            style={{
              borderRadius: 16,
              border: createMethod === 'random' ? `2px solid ${token.colorPrimary}` : '1px solid #f0f0f0',
              cursor: 'pointer'
            }}
            bodyStyle={{ padding: 32, textAlign: 'center' }}
            onClick={() => setCreateMethod('random')}
          >
            <ThunderboltOutlined style={{ fontSize: 48, color: token.colorPrimary, marginBottom: 16 }} />
            <Title level={3}>Random Generation</Title>
            <Text type="secondary">
              Let our algorithm create a valid puzzle for you. Choose difficulty and get a guaranteed solvable puzzle.
            </Text>
            <div style={{ marginTop: 16 }}>
              <Tag color="orange">AI Powered</Tag>
              <Tag color="purple">Guaranteed Valid</Tag>
            </div>
          </Card>
        </Col>
      </Row>
      
      <div style={{ marginTop: 32 }}>
        <Button
          type="primary"
          size="large"
          onClick={() => setCurrentStep(1)}
          disabled={!createMethod}
          style={{ minWidth: 120 }}
        >
          Continue
        </Button>
      </div>
    </div>
  );

  const renderGridCreation = () => (
    <div>
      {createMethod === 'random' ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Title level={2} style={{ marginBottom: 32 }}>
            Choose Difficulty Level
          </Title>
          
          <Row gutter={[16, 16]} justify="center">
            {Object.entries(difficultyConfig).map(([key, config]) => (
              <Col key={key} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 12,
                    border: puzzleData.difficulty === key ? `2px solid ${config.color}` : '1px solid #f0f0f0',
                    cursor: 'pointer'
                  }}
                  bodyStyle={{ padding: 20, textAlign: 'center' }}
                  onClick={() => setPuzzleData(prev => ({ ...prev, difficulty: key as Difficulty }))}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: config.color,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px',
                      fontSize: 18,
                      fontWeight: 'bold'
                    }}
                  >
                    {config.hints[0]}
                  </div>
                  <Title level={4} style={{ margin: '0 0 8px' }}>
                    {config.label}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {config.description}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
          
          <div style={{ marginTop: 32 }}>
            <Button
              type="primary"
              size="large"
              loading={loading}
              onClick={() => generateRandomPuzzle(puzzleData.difficulty)}
              icon={<ThunderboltOutlined />}
              style={{ minWidth: 160 }}
            >
              {loading ? 'Generating...' : 'Generate Puzzle'}
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: 24 }}>
            <Title level={2}>Create Your Puzzle Grid</Title>
            <Text type="secondary">
              Click on a cell and use the number pad below to fill in your puzzle. 
              Make sure to create a valid Sudoku with a unique solution.
            </Text>
          </div>
          
          <Row gutter={32}>
            <Col xs={24} lg={14}>
              {/* Sudoku Grid */}
              <Card style={{ marginBottom: 16 }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplate: 'repeat(9, 1fr) / repeat(9, 1fr)',
                  gap: 1,
                  backgroundColor: '#000',
                  padding: 8,
                  borderRadius: 8,
                  aspectRatio: '1',
                  maxWidth: 450,
                  margin: '0 auto'
                }}>
                  {puzzleData.puzzleGrid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        style={{
                          backgroundColor: selectedCell?.row === rowIndex && selectedCell?.col === colIndex 
                            ? token.colorPrimaryBg 
                            : '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: 16,
                          fontWeight: 'bold',
                          border: `2px solid ${
                            selectedCell?.row === rowIndex && selectedCell?.col === colIndex 
                              ? token.colorPrimary 
                              : 'transparent'
                          }`,
                          borderRadius: 4,
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                      >
                        {cell || ''}
                      </div>
                    ))
                  )}
                </div>
              </Card>
              
              {/* Number Pad */}
              <Card title="Number Pad">
                <Row gutter={[8, 8]}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
                    <Col span={4.8} key={num}>
                      <Button
                        block
                        size="large"
                        onClick={() => handleCellChange(num)}
                        disabled={!selectedCell}
                        style={{ aspectRatio: '1' }}
                      >
                        {num || 'Clear'}
                      </Button>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
            
            <Col xs={24} lg={10}>
              {/* Difficulty Selection */}
              <Card title="Puzzle Settings" style={{ marginBottom: 16 }}>
                <Form layout="vertical">
                  <Form.Item label="Difficulty Level">
                    <Select
                      value={puzzleData.difficulty}
                      onChange={(value) => setPuzzleData(prev => ({ ...prev, difficulty: value }))}
                      size="large"
                    >
                      {Object.entries(difficultyConfig).map(([key, config]) => (
                        <Option key={key} value={key}>
                          <Space>
                            <span style={{ color: config.color, fontWeight: 'bold' }}>●</span>
                            {config.label}
                            <Text type="secondary">({config.description})</Text>
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Form>
              </Card>
              
              {/* Validation Results */}
              {validationResult.errors.length > 0 && (
                <Alert
                  type="error"
                  message="Validation Errors"
                  description={
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {validationResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  }
                  style={{ marginBottom: 16 }}
                />
              )}
              
              {validationResult.isValid && (
                <Alert
                  type="success"
                  message="Puzzle looks good!"
                  description="Your puzzle passes basic validation checks."
                  style={{ marginBottom: 16 }}
                />
              )}
              
              {/* Help Tips */}
              <Card title="Tips" size="small">
                <Space direction="vertical" size="small">
                  <Text style={{ fontSize: 12 }}>
                    <BulbOutlined style={{ color: token.colorWarning }} /> Ensure each row, column, and 3×3 box has no repeated numbers
                  </Text>
                  <Text style={{ fontSize: 12 }}>
                    <BulbOutlined style={{ color: token.colorWarning }} /> Provide enough clues for a unique solution
                  </Text>
                  <Text style={{ fontSize: 12 }}>
                    <BulbOutlined style={{ color: token.colorWarning }} /> Test your puzzle before publishing
                  </Text>
                </Space>
              </Card>
            </Col>
          </Row>
          
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />}
                onClick={() => setCurrentStep(0)}
              >
                Back
              </Button>
              <Button
                type="primary"
                onClick={() => setCurrentStep(2)}
                disabled={!validationResult.isValid}
                icon={<CheckOutlined />}
              >
                Continue to Details
              </Button>
            </Space>
          </div>
        </div>
      )}
    </div>
  );

  const renderDetails = () => (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
        Add Puzzle Details
      </Title>
      
      <Form layout="vertical" size="large">
        <Form.Item label="Puzzle Title" required>
          <Input
            placeholder="Give your puzzle a catchy name..."
            value={puzzleData.title}
            onChange={(e) => setPuzzleData(prev => ({ ...prev, title: e.target.value }))}
            maxLength={100}
            showCount
          />
        </Form.Item>
        
        <Form.Item label="Description">
          <TextArea
            placeholder="Describe your puzzle, its theme, or solving techniques..."
            value={puzzleData.description}
            onChange={(e) => setPuzzleData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            maxLength={500}
            showCount
          />
        </Form.Item>
        
        <Form.Item label="Tags (help people find your puzzle)">
          <Select
            mode="tags"
            placeholder="Add tags like 'beginner', 'pattern', 'challenging'..."
            value={puzzleData.tags}
            onChange={(tags) => setPuzzleData(prev => ({ ...prev, tags }))}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
      
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <Space>
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={() => setCurrentStep(1)}
          >
            Back
          </Button>
          <Button
            type="primary"
            onClick={() => setCurrentStep(3)}
            disabled={!puzzleData.title.trim()}
            icon={<CheckOutlined />}
          >
            Review & Publish
          </Button>
        </Space>
      </div>
    </div>
  );

  const renderPublish = () => (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
        Review Your Puzzle
      </Title>
      
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>Title:</Text> {puzzleData.title}
          </div>
          <div>
            <Text strong>Difficulty:</Text>{' '}
            <Tag color={difficultyConfig[puzzleData.difficulty].color}>
              {difficultyConfig[puzzleData.difficulty].label}
            </Tag>
          </div>
          <div>
            <Text strong>Description:</Text> {puzzleData.description || 'No description'}
          </div>
          <div>
            <Text strong>Tags:</Text>{' '}
            {puzzleData.tags.length > 0 ? (
              puzzleData.tags.map(tag => <Tag key={tag}>{tag}</Tag>)
            ) : (
              <Text type="secondary">No tags</Text>
            )}
          </div>
        </Space>
      </Card>
      
      <div style={{ textAlign: 'center' }}>
        <Space size="large">
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={() => setCurrentStep(2)}
            size="large"
          >
            Back to Edit
          </Button>
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={handleSubmit}
            icon={<SaveOutlined />}
          >
            {loading ? 'Publishing...' : 'Publish Puzzle'}
          </Button>
        </Space>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderMethodSelection();
      case 1: return renderGridCreation();
      case 2: return renderDetails();
      case 3: return renderPublish();
      default: return null;
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Title level={1} style={{ margin: 0 }}>
          Create New Puzzle
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Share your creativity with the Sudoku community
        </Text>
      </div>

      {/* Progress Steps */}
      <Card style={{ marginBottom: 32 }}>
        <Steps current={currentStep} items={steps} />
      </Card>

      {/* Step Content */}
      <div style={{ minHeight: 400 }}>
        {renderStepContent()}
      </div>
    </div>
  );
};

export default CreatePuzzle;