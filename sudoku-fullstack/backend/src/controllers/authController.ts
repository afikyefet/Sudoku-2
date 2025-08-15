import { Request, Response } from 'express';
import { User } from '../models/User';
import { ApiResponse, LoginInput, RegisterInput } from '../types';

// Generate JWT token
const generateToken = (userId: string, email: string): string => {
  // This is a placeholder implementation
  // In a real app, you would use jsonwebtoken library
  return `token_${userId}_${email}_${Date.now()}`;
};

// Register new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: RegisterInput = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required'
      } as ApiResponse);
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      } as ApiResponse);
      return;
    }

    // Create new user
    const user = new User({ email, password });
    await user.save();

    // Generate token - safely access _id
    const userId = user._id?.toString() || '';
    const token = generateToken(userId, user.email);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          createdAt: user.createdAt
        },
        token
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    } as ApiResponse);
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginInput = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required'
      } as ApiResponse);
      return;
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      } as ApiResponse);
      return;
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      } as ApiResponse);
      return;
    }

    // Generate token - safely access _id
    const userId = user._id?.toString() || '';
    const token = generateToken(userId, user.email);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          createdAt: user.createdAt
        },
        token
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    } as ApiResponse);
  }
};