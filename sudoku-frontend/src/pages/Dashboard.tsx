import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Statistic,
  Table,
  Tag,
  Progress,
  Alert,
  Empty,
  Spin,
  message,
  Dropdown,
  Modal,
  Input,
  Upload,
  Divider,
  Badge
} from 'antd';
import {
  PlusOutlined,
  PlayCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  FireOutlined,
  CalendarOutlined,
  UploadOutlined,
  FileTextOutlined,
  SearchOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { sudokuAPI } from '../services/api';
import { SudokuGrid, analyzePuzzle, validatePuzzleFormat } from '../utils/sudokuValidator';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

interface DashboardPuzzle {
  id: string;
  title: string;
  difficulty: string;
  puzzleData: SudokuGrid;
  createdAt: string;
  lastPlayed?: string;
  completion: number;
  bestTime?: number;
  isCompleted: boolean;
  rating: number;
  solvedCount: number;
}

interface UserStats {
  totalPuzzles: number;
  puzzlesCompleted: number;
  averageTime: number;
  currentStreak: number;
  longestStreak: number;
  totalPlayTime: number;
  favoritesDifficulty: string;
  recentActivity: Array<{
    type: 'created' | 'completed' | 'started';
    puzzleTitle: string;
    timestamp: string;
  }>;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected, onlineUsers } = useSocket();
  const [puzzles, setPuzzles] = useState<DashboardPuzzle[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [puzzleToDelete, setPuzzleToDelete] = useState<string | null>(null);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Try to load from API
      try {
        const response = await sudokuAPI.getPuzzles();
        if (response.puzzles) {
          const apiPuzzles = response.puzzles.map(transformPuzzle);
          setPuzzles(apiPuzzles);
          generateStats(apiPuzzles);
          return;
        }
      } catch (error) {
        console.log('API not available, using mock data');
      }

      // Fallback to mock data
      const mockPuzzles: DashboardPuzzle[] = [
        {
          id: '1',
          title: 'Morning Brain Teaser',
          difficulty: 'medium',
          puzzleData: generateMockGrid(),
          createdAt: '2024-01-15T08:00:00Z',
          lastPlayed: '2024-01-16T09:30:00Z',
          completion: 65,
          bestTime: 720,
          isCompleted: false,
          rating: 4.2,
          solvedCount: 156
        },
        {
          id: '2',
          title: 'Expert Challenge #42',
          difficulty: 'expert',
          puzzleData: generateMockGrid(),
          createdAt: '2024-01-10T14:20:00Z',
          lastPlayed: '2024-01-15T16:45:00Z',
          completion: 100,
          bestTime: 1850,
          isCompleted: true,
          rating: 4.8,
          solvedCount: 67
        },
        {
          id: '3',
          title: 'Quick Lunch Break',
          difficulty: 'easy',
          puzzleData: generateMockGrid(),
          createdAt: '2024-01-12T12:15:00Z',
          lastPlayed: '2024-01-12T12:25:00Z',
          completion: 100,
          bestTime: 480,
          isCompleted: true,
          rating: 3.9,
          solvedCount: 234
        },
        {
          id: '4',
          title: 'Weekend Warrior',
          difficulty: 'hard',
          puzzleData: generateMockGrid(),
          createdAt: '2024-01-08T10:00:00Z',
          completion: 0,
          isCompleted: false,
          rating: 4.5,
          solvedCount: 89
        }
      ];

      setPuzzles(mockPuzzles);
      generateStats(mockPuzzles);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      message.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const transformPuzzle = (apiPuzzle: any): DashboardPuzzle => {
    const analysis = analyzePuzzle(apiPuzzle.puzzleData);
    return {
      id: apiPuzzle.id,
      title: apiPuzzle.title,
      difficulty: analysis.difficulty,
      puzzleData: apiPuzzle.puzzleData,
      createdAt: apiPuzzle.createdAt,
      lastPlayed: apiPuzzle.lastPlayed,
      completion: apiPuzzle.completion || 0,
      bestTime: apiPuzzle.bestTime,
      isCompleted: apiPuzzle.isCompleted || false,
      rating: apiPuzzle.rating || 0,
      solvedCount: apiPuzzle.solvedCount || 0
    };
  };

  const generateMockGrid = (): SudokuGrid => {
    // Generate a simple mock grid
    return [
      [5,3,0,0,7,0,0,0,0],
      [6,0,0,1,9,5,0,0,0],
      [0,9,8,0,0,0,0,6,0],
      [8,0,0,0,6,0,0,0,3],
      [4,0,0,8,0,3,0,0,1],
      [7,0,0,0,2,0,0,0,6],
      [0,6,0,0,0,0,2,8,0],
      [0,0,0,4,1,9,0,0,5],
      [0,0,0,0,8,0,0,7,9]
    ];
  };

  const generateStats = (puzzleList: DashboardPuzzle[]) => {
    const completed = puzzleList.filter(p => p.isCompleted);
    const avgTime = completed.reduce((sum, p) => sum + (p.bestTime || 0), 0) / completed.length || 0;
    
    const mockStats: UserStats = {
      totalPuzzles: puzzleList.length,
      puzzlesCompleted: completed.length,
      averageTime: Math.round(avgTime),
      currentStreak: 5,
      longestStreak: 12,
      totalPlayTime: Math.round(puzzleList.reduce((sum, p) => sum + (p.bestTime || 300), 0)),
      favoritesDifficulty: 'medium',
      recentActivity: [
        { type: 'completed', puzzleTitle: 'Morning Challenge', timestamp: '2024-01-16T09:30:00Z' },
        { type: 'created', puzzleTitle: 'Custom Puzzle #5', timestamp: '2024-01-15T14:20:00Z' },
        { type: 'started', puzzleTitle: 'Expert Level #3', timestamp: '2024-01-15T08:15:00Z' }
      ]
    };
    
    setStats(mockStats);
  };

  const filteredPuzzles = puzzles.filter(puzzle => {
    const matchesSearch = puzzle.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || puzzle.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const handlePlayPuzzle = (puzzleId: string) => {
    navigate(`/puzzle/${puzzleId}`);
  };

  const handleDeletePuzzle = async (puzzleId: string) => {
    try {
      // Try API first
      try {
        await sudokuAPI.deletePuzzle(puzzleId);
        message.success('Puzzle deleted successfully');
      } catch (error) {
        // Fallback to local state update
        console.log('API not available, updating local state');
      }
      
      setPuzzles(prev => prev.filter(p => p.id !== puzzleId));
      setDeleteModalVisible(false);
      setPuzzleToDelete(null);
    } catch (error) {
      console.error('Error deleting puzzle:', error);
      message.error('Failed to delete puzzle');
    }
  };

  const handleUploadPuzzle = async (file: File) => {
    try {
      const text = await file.text();
      const puzzleData = JSON.parse(text);
      
      const validation = validatePuzzleFormat(puzzleData);
      if (!validation.isValid) {
        message.error(`Invalid puzzle format: ${validation.errors.join(', ')}`);
        return false;
      }

      // Try API first
      try {
        await sudokuAPI.createPuzzle(puzzleData);
        message.success('Puzzle uploaded successfully');
        loadDashboardData();
      } catch (error) {
        // Fallback to local addition
        const analysis = analyzePuzzle(puzzleData.puzzleData);
        const newPuzzle: DashboardPuzzle = {
          id: Date.now().toString(),
          title: puzzleData.title,
          difficulty: analysis.difficulty,
          puzzleData: puzzleData.puzzleData,
          createdAt: new Date().toISOString(),
          completion: 0,
          isCompleted: false,
          rating: 0,
          solvedCount: 0
        };
        
        setPuzzles(prev => [newPuzzle, ...prev]);
        message.success('Puzzle added locally');
      }
      
      setUploadModalVisible(false);
      return false; // Prevent automatic upload
    } catch (error) {
      console.error('Error uploading puzzle:', error);
      message.error('Failed to upload puzzle');
      return false;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: '#52c41a',
      medium: '#faad14',
      hard: '#fa8c16',
      expert: '#f5222d',
      master: '#722ed1'
    };
    return colors[difficulty as keyof typeof colors] || '#666';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const columns = [
    {
      title: 'Puzzle',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: DashboardPuzzle) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{title}</div>
          <Space size={4}>
            <Tag color={getDifficultyColor(record.difficulty)} style={{ textTransform: 'capitalize' }}>
              {record.difficulty}
            </Tag>
            {record.isCompleted && <Badge status="success" text="Completed" />}
            {record.completion > 0 && record.completion < 100 && (
              <Badge status="processing" text={`${record.completion}% done`} />
            )}
          </Space>
        </div>
      )
    },
    {
      title: 'Progress',
      dataIndex: 'completion',
      key: 'completion',
      width: 120,
      render: (completion: number) => (
        <Progress
          percent={completion}
          size="small"
          status={completion === 100 ? 'success' : 'active'}
        />
      )
    },
    {
      title: 'Best Time',
      dataIndex: 'bestTime',
      key: 'bestTime',
      width: 100,
      render: (time: number) => time ? formatTime(time) : '--'
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 80,
      render: (rating: number) => rating ? `${rating.toFixed(1)}/5` : '--'
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 100,
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: DashboardPuzzle) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => handlePlayPuzzle(record.id)}
          >
            Play
          </Button>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'view',
                  icon: <EyeOutlined />,
                  label: 'View Details',
                  onClick: () => navigate(`/puzzle/${record.id}`)
                },
                {
                  key: 'edit',
                  icon: <EditOutlined />,
                  label: 'Edit',
                  onClick: () => navigate(`/create?edit=${record.id}`)
                },
                {
                  type: 'divider'
                },
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: 'Delete',
                  danger: true,
                  onClick: () => {
                    setPuzzleToDelete(record.id);
                    setDeleteModalVisible(true);
                  }
                }
              ]
            }}
            trigger={['click']}
          >
            <Button size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Loading your dashboard...</Text>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Header */}
      <Card style={{ marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
        <div style={{ color: 'white' }}>
          <Title level={2} style={{ color: 'white', margin: 0 }}>
            Welcome back, {user?.email?.split('@')[0] || 'Player'}! 👋
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 16, fontSize: 16 }}>
            Ready to challenge your mind? You have {puzzles.filter(p => !p.isCompleted).length} unsolved puzzles waiting.
          </Paragraph>
          <Space wrap>
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => navigate('/create')}>
              Create New Puzzle
            </Button>
            <Button size="large" ghost onClick={() => navigate('/browse')}>
              Browse Community Puzzles
            </Button>
            {isConnected && (
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                🔗 {onlineUsers} players online
              </Text>
            )}
          </Space>
        </div>
      </Card>

      {/* Statistics */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Puzzles"
                value={stats.totalPuzzles}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Completed"
                value={stats.puzzlesCompleted}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#52c41a' }}
                suffix={`/ ${stats.totalPuzzles}`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Current Streak"
                value={stats.currentStreak}
                prefix={<FireOutlined />}
                valueStyle={{ color: '#fa8c16' }}
                suffix="days"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Avg. Solve Time"
                value={formatTime(stats.averageTime)}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={16}>
        {/* Main Puzzles Table */}
        <Col xs={24} lg={16}>
          <Card
            title="Your Puzzles"
            extra={
              <Space>
                <Button
                  icon={<UploadOutlined />}
                  onClick={() => setUploadModalVisible(true)}
                >
                  Upload
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/create')}
                >
                  Create New
                </Button>
              </Space>
            }
          >
            <div style={{ marginBottom: 16 }}>
              <Row gutter={8}>
                <Col flex="auto">
                  <Search
                    placeholder="Search puzzles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    allowClear
                  />
                </Col>
                <Col>
                  <Button
                    onClick={() => setSelectedDifficulty(selectedDifficulty === 'all' ? 'medium' : 'all')}
                  >
                    {selectedDifficulty === 'all' ? 'All Difficulties' : selectedDifficulty}
                  </Button>
                </Col>
              </Row>
            </div>

            {filteredPuzzles.length === 0 ? (
              <div>
                <Empty description="No puzzles found" />
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/create')}>
                    Create Your First Puzzle
                  </Button>
                </div>
              </div>
            ) : (
              <Table
                dataSource={filteredPuzzles}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 10, showSizeChanger: false }}
                size="middle"
              />
            )}
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          {/* Quick Actions */}
          <Card title="Quick Actions" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                block
                size="large"
                icon={<PlayCircleOutlined />}
                onClick={() => {
                  const unfinished = puzzles.find(p => p.completion > 0 && !p.isCompleted);
                  if (unfinished) {
                    handlePlayPuzzle(unfinished.id);
                  } else {
                    navigate('/browse');
                  }
                }}
              >
                {puzzles.some(p => p.completion > 0 && !p.isCompleted) ? 'Continue Last Puzzle' : 'Find New Puzzle'}
              </Button>
              <Button block icon={<PlusOutlined />} onClick={() => navigate('/create')}>
                Create Custom Puzzle
              </Button>
              <Button block icon={<SearchOutlined />} onClick={() => navigate('/browse')}>
                Browse Community
              </Button>
            </Space>
          </Card>

          {/* Recent Activity */}
          {stats && (
            <Card title="Recent Activity">
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                      {activity.type === 'completed' && <TrophyOutlined style={{ color: '#52c41a', marginRight: 8 }} />}
                      {activity.type === 'created' && <PlusOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
                      {activity.type === 'started' && <PlayCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />}
                      <Text strong style={{ textTransform: 'capitalize' }}>{activity.type}</Text>
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <Text>{activity.puzzleTitle}</Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </Text>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Puzzle"
        open={deleteModalVisible}
        onOk={() => puzzleToDelete && handleDeletePuzzle(puzzleToDelete)}
        onCancel={() => {
          setDeleteModalVisible(false);
          setPuzzleToDelete(null);
        }}
        okText="Delete"
        okType="danger"
      >
        <Text>Are you sure you want to delete this puzzle? This action cannot be undone.</Text>
      </Modal>

      {/* Upload Modal */}
      <Modal
        title="Upload Puzzle"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Upload.Dragger
            accept=".json"
            beforeUpload={handleUploadPuzzle}
            showUploadList={false}
            style={{ marginBottom: 16 }}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text">Click or drag a JSON file to upload</p>
            <p className="ant-upload-hint">
              Upload a Sudoku puzzle in JSON format
            </p>
          </Upload.Dragger>
          
          <Divider>Expected Format</Divider>
          
          <div style={{ textAlign: 'left', backgroundColor: '#f6f6f6', padding: 12, borderRadius: 4 }}>
            <pre style={{ margin: 0, fontSize: 12 }}>
{`{
  "title": "My Puzzle",
  "puzzleData": [
    [5,3,0,0,7,0,0,0,0],
    [6,0,0,1,9,5,0,0,0],
    // ... 9 rows of 9 numbers
  ]
}`}
            </pre>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;