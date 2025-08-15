import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Alert,
  Divider,
  theme
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  PuzzleOutlined,
  LoginOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError('');

    try {
      await login(values.email, values.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${token.colorPrimary}15 0%, ${token.colorPrimaryBg} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          borderRadius: 16,
          border: 'none',
        }}
        bodyStyle={{ padding: '40px' }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Space direction="vertical" size="middle">
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}
            >
              <PuzzleOutlined style={{ fontSize: 32, color: 'white' }} />
            </div>
            <div>
              <Title level={2} style={{ margin: 0, color: token.colorTextHeading }}>
                Welcome Back
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Sign in to your SudokuMaster account
              </Text>
            </div>
          </Space>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            type="error"
            message={error}
            style={{ marginBottom: 24, borderRadius: 8 }}
            showIcon
          />
        )}

        {/* Login Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: token.colorTextSecondary }} />}
              placeholder="Enter your email"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: token.colorTextSecondary }} />}
              placeholder="Enter your password"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<LoginOutlined />}
              block
              style={{
                height: 48,
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 500,
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ margin: '32px 0' }}>
          <Text type="secondary">Don't have an account?</Text>
        </Divider>

        {/* Register Link */}
        <div style={{ textAlign: 'center' }}>
          <Button
            type="link"
            size="large"
            onClick={() => navigate('/register')}
            style={{
              padding: 0,
              height: 'auto',
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            Create New Account
          </Button>
        </div>

        {/* Demo Account Info */}
        <Card
          size="small"
          style={{
            marginTop: 24,
            background: token.colorInfoBg,
            border: `1px solid ${token.colorInfoBorder}`,
            borderRadius: 8,
          }}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>
            <strong>Demo:</strong> Use any email and password to try the app with mock data
          </Text>
        </Card>
      </Card>
    </div>
  );
};

export default Login;