import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Card, CardBody, CardHeader, Spinner } from '@heroui/react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Login Page Component
 */
const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🧩</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sudoku Master
          </h1>
          <p className="text-lg text-gray-600">
            Sign in to your account
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="flex flex-col gap-3 pb-6">
            <h2 className="text-2xl font-semibold text-center">Welcome Back</h2>
          </CardHeader>
          <CardBody>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <Card className="bg-danger-50 border-danger-200">
                  <CardBody className="py-3">
                    <p className="text-danger text-sm">{error}</p>
                  </CardBody>
                </Card>
              )}

              <Input
                type="email"
                label="Email address"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                variant="bordered"
                size="lg"
                classNames={{
                  input: "text-base",
                  inputWrapper: "h-12"
                }}
              />

              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                variant="bordered"
                size="lg"
                classNames={{
                  input: "text-base",
                  inputWrapper: "h-12"
                }}
              />

              <Button
                type="submit"
                color="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
                spinner={<Spinner size="sm" color="white" />}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-medium text-primary hover:text-primary-600 transition-colors"
                  >
                    Sign up here
                  </Link>
                </p>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Create and solve beautiful Sudoku puzzles online
        </p>
      </div>
    </div>
  );
};

export default Login;