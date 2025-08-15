import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout as AntLayout,
  Menu,
  Avatar,
  Dropdown,
  Button,
  Typography,
  Space,
  theme,
  Badge
} from 'antd';
import {
  DashboardOutlined,
  SearchOutlined,
  PlusOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
  PuzzleOutlined,
  StarOutlined,
  SettingOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header, Content, Sider } = AntLayout;
const { Title, Text } = Typography;

const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/browse',
      icon: <SearchOutlined />,
      label: 'Browse Puzzles',
    },
    {
      key: '/create',
      icon: <PlusOutlined />,
      label: 'Create Puzzle',
    },
    {
      type: 'divider',
    },
    {
      key: 'favorites',
      icon: <StarOutlined />,
      label: 'My Favorites',
      children: [
        {
          key: '/profile?tab=favorites',
          label: 'Favorite Puzzles',
        },
        {
          key: '/profile?tab=created',
          label: 'My Creations',
        },
      ],
    },
    {
      key: 'stats',
      icon: <TrophyOutlined />,
      label: 'Statistics',
      children: [
        {
          key: '/profile?tab=stats',
          label: 'My Stats',
        },
        {
          key: '/profile?tab=achievements',
          label: 'Achievements',
        },
      ],
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'My Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key.includes('?')) {
      const [path, query] = key.split('?');
      navigate(`${path}?${query}`);
    } else {
      navigate(key);
    }
  };

  const selectedKey = location.pathname;

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={250}
        style={{
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <div
          style={{
            height: 64,
            margin: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          {!collapsed ? (
            <Space>
              <PuzzleOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
              <Title level={4} style={{ margin: 0, color: token.colorTextHeading }}>
                SudokuMaster
              </Title>
            </Space>
          ) : (
            <PuzzleOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <AntLayout>
        <Header
          style={{
            background: token.colorBgContainer,
            padding: '0 24px',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              display: 'none',
              '@media (max-width: 768px)': {
                display: 'block',
              },
            }}
          />

          <div style={{ flex: 1 }} />

          <Space size="middle">
            {/* Quick actions */}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/create')}
              style={{ borderRadius: token.borderRadius }}
            >
              {!collapsed && 'Create Puzzle'}
            </Button>

            {/* User menu */}
            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button
                type="text"
                style={{
                  height: 40,
                  padding: '4px 8px',
                  borderRadius: token.borderRadius,
                }}
              >
                <Space>
                  <Avatar
                    size={32}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: token.colorPrimary }}
                  />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>
                      {user?.email?.split('@')[0] || 'User'}
                    </div>
                    <div style={{ fontSize: 12, color: token.colorTextSecondary }}>
                      View Profile
                    </div>
                  </div>
                </Space>
              </Button>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: 0,
            minHeight: 'calc(100vh - 64px)',
            background: token.colorBgLayout,
          }}
        >
          <div
            style={{
              padding: 24,
              minHeight: '100%',
            }}
          >
            <Outlet />
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;