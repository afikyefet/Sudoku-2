import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  Button,
  Space,
  Statistic,
  Progress,
  Tag,
  List,
  Empty,
  Spin,
  Badge,
  Tooltip,
  Divider,
  Timeline
} from 'antd';
import {
  UserOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  FireOutlined,
  StarOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  EditOutlined,
  MessageOutlined,
  PlayCircleOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text, Paragraph } = Typography;

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  joinDate: string;
  lastActive: string;
  stats: {
    totalPuzzlesCreated: number;
    totalPuzzlesSolved: number;
    averageSolveTime: number;
    bestSolveTime: number;
    currentStreak: number;
    longestStreak: number;
    totalPlayTime: number;
    favoritesDifficulty: string;
    completionRate: number;
    averageRating: number;
  };
  achievements: Achievement[];
  recentActivity: Activity[];
  favoritePuzzles: PuzzleInfo[];
  recentlySolved: PuzzleInfo[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Activity {
  id: string;
  type: 'solved' | 'created' | 'favorited' | 'achieved';
  title: string;
  timestamp: string;
  extra?: string;
}

interface PuzzleInfo {
  id: string;
  title: string;
  difficulty: string;
  solveTime?: number;
  rating: number;
  createdAt: string;
}

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'activity' | 'puzzles'>('overview');

  const isOwnProfile = !userId || userId === user?.id;

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Mock profile data for demonstration
      const mockProfile: UserProfile = {
        id: userId || user?.id || '1',
        username: isOwnProfile ? (user?.email?.split('@')[0] || 'Player') : 'SudokuMaster',
        email: isOwnProfile ? (user?.email || 'player@example.com') : 'sudokumaster@example.com',
        avatar: undefined,
        bio: isOwnProfile ? 'Passionate Sudoku solver and puzzle creator. Always up for a challenge!' : 'Expert puzzle creator with 1000+ puzzles solved.',
        joinDate: '2023-06-15T00:00:00Z',
        lastActive: new Date().toISOString(),
        stats: {
          totalPuzzlesCreated: isOwnProfile ? 12 : 156,
          totalPuzzlesSolved: isOwnProfile ? 89 : 1247,
          averageSolveTime: isOwnProfile ? 720 : 480,
          bestSolveTime: isOwnProfile ? 245 : 156,
          currentStreak: isOwnProfile ? 7 : 23,
          longestStreak: isOwnProfile ? 15 : 45,
          totalPlayTime: isOwnProfile ? 15600 : 89400, // seconds
          favoritesDifficulty: 'medium',
          completionRate: isOwnProfile ? 85 : 94,
          averageRating: isOwnProfile ? 4.2 : 4.7
        },
        achievements: [
          {
            id: '1',
            title: 'First Steps',
            description: 'Solved your first puzzle',
            icon: '🎯',
            unlockedAt: '2024-01-10T00:00:00Z',
            rarity: 'common'
          },
          {
            id: '2',
            title: 'Speed Demon',
            description: 'Solved a puzzle in under 5 minutes',
            icon: '⚡',
            unlockedAt: '2024-01-12T00:00:00Z',
            rarity: 'rare'
          },
          {
            id: '3',
            title: 'Perfectionist',
            description: 'Solved 10 puzzles without using hints',
            icon: '🎖️',
            unlockedAt: '2024-01-15T00:00:00Z',
            rarity: 'epic'
          },
          {
            id: '4',
            title: 'Master Creator',
            description: 'Created 50 unique puzzles',
            icon: '👑',
            unlockedAt: '2024-01-20T00:00:00Z',
            rarity: 'legendary'
          }
        ],
        recentActivity: [
          {
            id: '1',
            type: 'solved',
            title: 'Expert Challenge #42',
            timestamp: '2024-01-16T14:30:00Z',
            extra: '12:34'
          },
          {
            id: '2',
            type: 'created',
            title: 'Morning Brain Teaser',
            timestamp: '2024-01-16T09:15:00Z'
          },
          {
            id: '3',
            type: 'achieved',
            title: 'Speed Demon',
            timestamp: '2024-01-15T16:45:00Z'
          },
          {
            id: '4',
            type: 'favorited',
            title: 'Weekend Challenge',
            timestamp: '2024-01-15T11:20:00Z'
          }
        ],
        favoritePuzzles: [
          {
            id: '1',
            title: 'Classic Symphony',
            difficulty: 'hard',
            rating: 4.8,
            createdAt: '2024-01-10T00:00:00Z'
          },
          {
            id: '2',
            title: 'Zen Garden',
            difficulty: 'medium',
            rating: 4.5,
            createdAt: '2024-01-08T00:00:00Z'
          }
        ],
        recentlySolved: [
          {
            id: '1',
            title: 'Morning Challenge',
            difficulty: 'medium',
            solveTime: 890,
            rating: 4.2,
            createdAt: '2024-01-16T00:00:00Z'
          },
          {
            id: '2',
            title: 'Expert Level #3',
            difficulty: 'expert',
            solveTime: 1650,
            rating: 4.9,
            createdAt: '2024-01-15T00:00:00Z'
          }
        ]
      };

      setProfile(mockProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}:${(seconds % 60).toString().padStart(2, '0')}`;
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

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: '#8c8c8c',
      rare: '#1890ff',
      epic: '#722ed1',
      legendary: '#fa8c16'
    };
    return colors[rarity as keyof typeof colors] || '#666';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'solved': return <TrophyOutlined style={{ color: '#52c41a' }} />;
      case 'created': return <PlayCircleOutlined style={{ color: '#1890ff' }} />;
      case 'achieved': return <StarOutlined style={{ color: '#faad14' }} />;
      case 'favorited': return <HeartOutlined style={{ color: '#f5222d' }} />;
      default: return <CalendarOutlined />;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Loading profile...</Text>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Empty description="Profile not found" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <Avatar
              size={80}
              icon={<UserOutlined />}
              src={profile.avatar}
              style={{ backgroundColor: '#1890ff' }}
            />
            <div>
              <Title level={2} style={{ margin: 0 }}>
                {profile.username}
              </Title>
              <Space direction="vertical" size={4}>
                <Text type="secondary">{profile.email}</Text>
                {profile.bio && (
                  <Paragraph style={{ margin: 0, maxWidth: 400 }}>{profile.bio}</Paragraph>
                )}
                <Space size={16}>
                  <Text type="secondary">
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    Joined {new Date(profile.joinDate).toLocaleDateString()}
                  </Text>
                  <Text type="secondary">
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    Last active {new Date(profile.lastActive).toLocaleDateString()}
                  </Text>
                </Space>
              </Space>
            </div>
          </div>

          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              Back
            </Button>
            {isOwnProfile && (
              <Button type="primary" icon={<EditOutlined />}>
                Edit Profile
              </Button>
            )}
            {!isOwnProfile && (
              <Button icon={<MessageOutlined />}>
                Send Message
              </Button>
            )}
          </Space>
        </div>
      </Card>

      {/* Stats Overview */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Puzzles Solved"
              value={profile.stats.totalPuzzlesSolved}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Current Streak"
              value={profile.stats.currentStreak}
              prefix={<FireOutlined />}
              suffix="days"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Avg. Solve Time"
              value={formatTime(profile.stats.averageSolveTime)}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completion Rate"
              value={profile.stats.completionRate}
              prefix={<ThunderboltOutlined />}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Navigation Tabs */}
      <Card style={{ marginBottom: 24 }}>
        <Space wrap>
          {['overview', 'achievements', 'activity', 'puzzles'].map(tab => (
            <Button
              key={tab}
              type={activeTab === tab ? 'primary' : 'default'}
              onClick={() => setActiveTab(tab as any)}
              style={{ textTransform: 'capitalize' }}
            >
              {tab}
            </Button>
          ))}
        </Space>
      </Card>

      <Row gutter={16}>
        {/* Main Content */}
        <Col xs={24} lg={16}>
          {activeTab === 'overview' && (
            <Card title="Detailed Statistics">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <div style={{ marginBottom: 24 }}>
                    <Text strong>Solving Performance</Text>
                    <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text>Best Time:</Text>
                        <Text strong>{formatTime(profile.stats.bestSolveTime)}</Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text>Total Play Time:</Text>
                        <Text strong>{formatTime(profile.stats.totalPlayTime)}</Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text>Longest Streak:</Text>
                        <Text strong>{profile.stats.longestStreak} days</Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text>Average Rating:</Text>
                        <Text strong>{profile.stats.averageRating}/5.0</Text>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div style={{ marginBottom: 24 }}>
                    <Text strong>Creation Stats</Text>
                    <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text>Puzzles Created:</Text>
                        <Text strong>{profile.stats.totalPuzzlesCreated}</Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text>Favorite Difficulty:</Text>
                        <Tag color={getDifficultyColor(profile.stats.favoritesDifficulty)} style={{ textTransform: 'capitalize' }}>
                          {profile.stats.favoritesDifficulty}
                        </Tag>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
              
              <Divider />
              
              <div>
                <Text strong>Completion Progress</Text>
                <div style={{ marginTop: 12 }}>
                  <Progress
                    percent={profile.stats.completionRate}
                    status="active"
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'achievements' && (
            <Card title="Achievements">
              <Row gutter={16}>
                {profile.achievements.map(achievement => (
                  <Col key={achievement.id} xs={24} sm={12} style={{ marginBottom: 16 }}>
                    <Card size="small">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ fontSize: 32 }}>{achievement.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <Text strong>{achievement.title}</Text>
                            <Badge
                              color={getRarityColor(achievement.rarity)}
                              text={achievement.rarity}
                              style={{ textTransform: 'capitalize' }}
                            />
                          </div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {achievement.description}
                          </Text>
                          <div style={{ marginTop: 4 }}>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )}

          {activeTab === 'activity' && (
            <Card title="Recent Activity">
              <Timeline>
                {profile.recentActivity.map(activity => (
                  <Timeline.Item key={activity.id} dot={getActivityIcon(activity.type)}>
                    <div>
                      <Text strong style={{ textTransform: 'capitalize' }}>{activity.type}</Text>
                      <Text style={{ marginLeft: 8 }}>{activity.title}</Text>
                      {activity.extra && (
                        <Text type="secondary" style={{ marginLeft: 8 }}>({activity.extra})</Text>
                      )}
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(activity.timestamp).toLocaleString()}
                        </Text>
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          )}

          {activeTab === 'puzzles' && (
            <div>
              <Card title="Recently Solved" style={{ marginBottom: 16 }}>
                <List
                  dataSource={profile.recentlySolved}
                  renderItem={puzzle => (
                    <List.Item
                      actions={[
                        <Button
                          key="play"
                          type="link"
                          onClick={() => navigate(`/puzzle/${puzzle.id}`)}
                        >
                          Play Again
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={puzzle.title}
                        description={
                          <Space>
                            <Tag color={getDifficultyColor(puzzle.difficulty)} style={{ textTransform: 'capitalize' }}>
                              {puzzle.difficulty}
                            </Tag>
                            {puzzle.solveTime && (
                              <Text type="secondary">Solved in {formatTime(puzzle.solveTime)}</Text>
                            )}
                            <Text type="secondary">Rating: {puzzle.rating}/5</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>

              <Card title="Favorite Puzzles">
                <List
                  dataSource={profile.favoritePuzzles}
                  renderItem={puzzle => (
                    <List.Item
                      actions={[
                        <Button
                          key="play"
                          type="link"
                          onClick={() => navigate(`/puzzle/${puzzle.id}`)}
                        >
                          Play
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={puzzle.title}
                        description={
                          <Space>
                            <Tag color={getDifficultyColor(puzzle.difficulty)} style={{ textTransform: 'capitalize' }}>
                              {puzzle.difficulty}
                            </Tag>
                            <Text type="secondary">Rating: {puzzle.rating}/5</Text>
                            <Text type="secondary">
                              Created {new Date(puzzle.createdAt).toLocaleDateString()}
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </div>
          )}
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          {/* Quick Actions */}
          <Card title="Quick Actions" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                block
                icon={<PlayCircleOutlined />}
                onClick={() => navigate('/browse')}
              >
                Find New Puzzles
              </Button>
              {isOwnProfile && (
                <Button
                  block
                  icon={<EditOutlined />}
                  onClick={() => navigate('/create')}
                >
                  Create Puzzle
                </Button>
              )}
              <Button
                block
                icon={<TrophyOutlined />}
                onClick={() => setActiveTab('achievements')}
              >
                View Achievements
              </Button>
            </Space>
          </Card>

          {/* Achievement Progress */}
          <Card title="Next Achievement">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
              <Text strong>Century Club</Text>
              <div style={{ marginTop: 8, marginBottom: 12 }}>
                <Text type="secondary">Solve 100 puzzles</Text>
              </div>
              <Progress
                type="circle"
                percent={Math.round((profile.stats.totalPuzzlesSolved / 100) * 100)}
                size={80}
                format={(percent) => `${profile.stats.totalPuzzlesSolved}/100`}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;