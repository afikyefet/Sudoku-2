import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Input,
} from '@heroui/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!username) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await register(email, username, password);
      navigate('/dashboard');
    } catch (error) {
      // Error handling is done in the auth context
    }
  };

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="max-w-md w-full">
        <CardHeader className="flex flex-col gap-3 items-center">
          <div className="bg-primary text-primary-foreground rounded-lg p-3">
            <span className="text-2xl">🧩</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="text-default-500">Join Sudoku Pro and start solving puzzles</p>
          </div>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="email"
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isRequired
              variant="bordered"
              autoComplete="email"
              isInvalid={!!errors.email}
              errorMessage={errors.email}
            />

            <Input
              type="text"
              label="Username"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              isRequired
              variant="bordered"
              autoComplete="username"
              isInvalid={!!errors.username}
              errorMessage={errors.username}
            />

            <Input
              type={isVisible ? "text" : "password"}
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isRequired
              variant="bordered"
              autoComplete="new-password"
              isInvalid={!!errors.password}
              errorMessage={errors.password}
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibility}
                >
                  {isVisible ? '👁️' : '🙈'}
                </button>
              }
            />

            <Input
              type={isVisible ? "text" : "password"}
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              isRequired
              variant="bordered"
              autoComplete="new-password"
              isInvalid={!!errors.confirmPassword}
              errorMessage={errors.confirmPassword}
            />

            <Button
              type="submit"
              color="primary"
              size="lg"
              isLoading={isLoading}
              disabled={!email || !username || !password || !confirmPassword || isLoading}
              className="w-full"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </CardBody>

        <CardFooter className="flex flex-col gap-3">
          <Divider />
          <p className="text-center text-small text-default-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary hover:text-primary-600 font-medium"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage;