"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const User_1 = require("../models/User");
// Generate JWT token
const generateToken = (userId, email) => {
    // This is a placeholder implementation
    // In a real app, you would use jsonwebtoken library
    return `token_${userId}_${email}_${Date.now()}`;
};
// Register new user
const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
            return;
        }
        // Check if user already exists
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
            return;
        }
        // Create new user
        const user = new User_1.User({ email, password });
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
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
};
exports.register = register;
// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
            return;
        }
        // Find user by email
        const user = await User_1.User.findOne({ email });
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
            return;
        }
        // Check password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
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
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
};
exports.login = login;
//# sourceMappingURL=authController.js.map