import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Typography,
  Input,
  Select,
  Button,
  Space,
  Tag,
  Avatar,
  Rate,
  Spin,
  Empty,
  Pagination,
  Tooltip,
  theme,
  Badge,
  Divider
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  StarOutlined,
  StarFilled,
  UserOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  EyeOutlined,
  HeartOutlined,
  HeartFilled,
  SortAscendingOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface Puzzle {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'master';
  rating: number;
  ratingCount: number;
  creator: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags: string[];
  averageTimeToSolve: number;
  solvedCount: number;
  favoriteCount: number;
  isFavorited: boolean;
  createdAt: string;
}

const Browse: React.FC = () => {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPuzzles, setTotalPuzzles] = useState(0);
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const difficultyColors = {
    easy: '#52c41a',
    medium: '#faad14',
    hard: '#fa8c16',
    expert: '#f5222d',
    master: '#722ed1',
  };

  const difficultyLabels = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    expert: 'Expert',
    master: 'Master',
  };

  // Mock data for demonstration
  useEffect(() => {
    const fetchPuzzles = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockPuzzles: Puzzle[] = [
        {
          id: '1',
          title: 'Morning Brain Teaser',
          description: 'A perfect puzzle to start your day with. Classic patterns with a modern twist.',
          difficulty: 'medium',
          rating: 4.2,
          ratingCount: 156,
          creator: { id: '1', name: 'PuzzleMaster', avatar: undefined },
          tags: ['classic', 'morning', 'balanced'],
          averageTimeToSolve: 12,
          solvedCount: 432,
          favoriteCount: 89,
          isFavorited: false,
          createdAt: '2024-01-15',
        },
        {
          id: '2',
          title: 'Expert Challenge #42',
          description: 'For seasoned solvers only. This puzzle will test your advanced techniques.',
          difficulty: 'expert',
          rating: 4.8,
          ratingCount: 67,
          creator: { id: '2', name: 'SudokuSensei', avatar: undefined },
          tags: ['challenge', 'advanced', 'techniques'],
          averageTimeToSolve: 35,
          solvedCount: 123,
          favoriteCount: 45,
          isFavorited: true,
          createdAt: '2024-01-14',
        },
        {
          id: '3',
          title: 'Beginner Friendly',
          description: 'Perfect for those just starting their Sudoku journey. Clear logical steps.',
          difficulty: 'easy',
          rating: 4.0,
          ratingCount: 234,
          creator: { id: '3', name: 'NewbieFriend', avatar: undefined },
          tags: ['beginner', 'tutorial', 'learning'],
          averageTimeToSolve: 8,
          solvedCount: 1234,
          favoriteCount: 167,
          isFavorited: false,
          createdAt: '2024-01-13',
        },
      ];
      
      setPuzzles(mockPuzzles);
      setTotalPuzzles(mockPuzzles.length);
      setLoading(false);
    };

    fetchPuzzles();
  }, [searchTerm, selectedDifficulty, sortBy, currentPage]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleDifficultyChange = (value: string) => {
    setSelectedDifficulty(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const toggleFavorite = (puzzleId: string) => {
    setPuzzles(puzzles.map(puzzle =>
      puzzle.id === puzzleId
        ? { ...puzzle, isFavorited: !puzzle.isFavorited }
        : puzzle
    ));
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Title level={1} style={{ margin: 0, color: token.colorTextHeading }}>
          Discover Puzzles
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Find your next challenge from thousands of community-created puzzles
        </Text>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Search
              placeholder="Search puzzles..."
              onSearch={handleSearch}
              prefix={<SearchOutlined />}
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Select
              placeholder="Difficulty"
              value={selectedDifficulty || undefined}
              onChange={handleDifficultyChange}
              size="large"
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="easy">Easy</Option>
              <Option value="medium">Medium</Option>
              <Option value="hard">Hard</Option>
              <Option value="expert">Expert</Option>
              <Option value="master">Master</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Select
              value={sortBy}
              onChange={handleSortChange}
              size="large"
              style={{ width: '100%' }}
              prefix={<SortAscendingOutlined />}
            >
              <Option value="newest">Newest</Option>
              <Option value="rating">Highest Rated</Option>
              <Option value="popular">Most Popular</Option>
              <Option value="difficulty">Difficulty</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} lg={8}>
            <Space>
              <Button type="primary" icon={<FilterOutlined />} size="large">
                Advanced Filters
              </Button>
              <Button icon={<TrophyOutlined />} size="large">
                Random Challenge
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Loading amazing puzzles...</Text>
          </div>
        </div>
      )}

      {/* Puzzle Grid */}
      {!loading && (
        <>
          <Row gutter={[24, 24]}>
            {puzzles.map((puzzle) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={puzzle.id}>
                <Card
                  style={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  bodyStyle={{ padding: 20 }}
                  hoverable
                  onClick={() => navigate(`/puzzle/${puzzle.id}`)}
                  actions={[
                    <Tooltip title={puzzle.isFavorited ? 'Remove from favorites' : 'Add to favorites'}>
                      <Button
                        type="text"
                        icon={puzzle.isFavorited ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(puzzle.id);
                        }}
                      />
                    </Tooltip>,
                    <Tooltip title="View puzzle">
                      <Button type="text" icon={<EyeOutlined />} />
                    </Tooltip>,
                  ]}
                >
                  {/* Difficulty Badge */}
                  <div style={{ position: 'absolute', top: 12, right: 12 }}>
                    <Tag
                      color={difficultyColors[puzzle.difficulty]}
                      style={{
                        borderRadius: 12,
                        padding: '2px 8px',
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                      }}
                    >
                      {difficultyLabels[puzzle.difficulty]}
                    </Tag>
                  </div>

                  {/* Content */}
                  <div style={{ marginTop: 8 }}>
                    <Title level={4} style={{ margin: '0 0 8px 0', fontSize: 16 }}>
                      {puzzle.title}
                    </Title>
                    
                    <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.4 }}>
                      {puzzle.description}
                    </Text>

                    <Divider style={{ margin: '16px 0' }} />

                    {/* Creator */}
                    <Space style={{ marginBottom: 12 }}>
                      <Avatar size={20} icon={<UserOutlined />} />
                      <Text style={{ fontSize: 12 }}>{puzzle.creator.name}</Text>
                    </Space>

                    {/* Rating */}
                    <div style={{ marginBottom: 12 }}>
                      <Space>
                        <Rate
                          disabled
                          allowHalf
                          value={puzzle.rating}
                          style={{ fontSize: 12 }}
                        />
                        <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>
                          ({puzzle.ratingCount})
                        </Text>
                      </Space>
                    </div>

                    {/* Stats */}
                    <Row gutter={16} style={{ marginBottom: 12 }}>
                      <Col span={12}>
                        <Space size={4}>
                          <ClockCircleOutlined style={{ fontSize: 12, color: token.colorTextSecondary }} />
                          <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>
                            {formatTime(puzzle.averageTimeToSolve)}
                          </Text>
                        </Space>
                      </Col>
                      <Col span={12}>
                        <Space size={4}>
                          <TrophyOutlined style={{ fontSize: 12, color: token.colorTextSecondary }} />
                          <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>
                            {puzzle.solvedCount} solved
                          </Text>
                        </Space>
                      </Col>
                    </Row>

                    {/* Tags */}
                    <div>
                      {puzzle.tags.slice(0, 2).map((tag) => (
                        <Tag
                          key={tag}
                          style={{
                            margin: '0 4px 4px 0',
                            borderRadius: 6,
                            fontSize: 10,
                          }}
                        >
                          {tag}
                        </Tag>
                      ))}
                      {puzzle.tags.length > 2 && (
                        <Tag style={{ margin: '0 4px 4px 0', borderRadius: 6, fontSize: 10 }}>
                          +{puzzle.tags.length - 2}
                        </Tag>
                      )}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Empty State */}
          {puzzles.length === 0 && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No puzzles found"
              style={{ margin: '60px 0' }}
            >
              <Button type="primary" onClick={() => setSearchTerm('')}>
                Clear Filters
              </Button>
            </Empty>
          )}

          {/* Pagination */}
          {puzzles.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <Pagination
                current={currentPage}
                total={totalPuzzles}
                pageSize={12}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} puzzles`
                }
                onChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Browse;