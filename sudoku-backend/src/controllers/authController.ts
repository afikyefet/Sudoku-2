import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { IApiResponse, IAuthResponse } from '../types';
import { mockDB } from '../utils/mockData';

/**
 * Generate JWT token for user
 */
const generateToken = (userId: string, email: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    { userId, email },
    jwtSecret,
    { expiresIn: '7d' } // Token expires in 7 days
  );
};

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required'
      } as IApiResponse);
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      } as IApiResponse);
      return;
    }

    // Try MongoDB first, fallback to mock data
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        } as IApiResponse);
        return;
      }

      // Create new user
      const user = new User({
        email: email.toLowerCase(),
        password
      });

      await user.save();

      // Generate token
      const token = generateToken(user._id as string, user.email);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          token,
          user: {
            id: user._id,
            email: user.email
          }
        } as IAuthResponse
      } as IApiResponse<IAuthResponse>);
      
    } catch (dbError) {
      console.log('MongoDB not available, using mock database');
      
      // Fallback to mock database
      const existingUser = await mockDB.findUserByEmail(email);
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        } as IApiResponse);
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Create user in mock DB
      const user = await mockDB.createUser(email, hashedPassword);

      // Generate token
      const token = generateToken(user.id, user.email);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email
          }
        } as IAuthResponse
      } as IApiResponse<IAuthResponse>);
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as IApiResponse);
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required'
      } as IApiResponse);
      return;
    }

    // Try MongoDB first, fallback to mock data
    try {
      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        } as IApiResponse);
        return;
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        } as IApiResponse);
        return;
      }

      // Generate token
      const token = generateToken(user._id as string, user.email);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user._id,
            email: user.email
          }
        } as IAuthResponse
      } as IApiResponse<IAuthResponse>);
      
    } catch (dbError) {
      console.log('MongoDB not available, using mock database');
      
      // Fallback to mock database
      const user = await mockDB.findUserByEmail(email);
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        } as IApiResponse);
        return;
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        } as IApiResponse);
        return;
      }

      // Generate token
      const token = generateToken(user.id, user.email);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email
          }
        } as IAuthResponse
      } as IApiResponse<IAuthResponse>);
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as IApiResponse);
  }
};