import { Request, Response } from 'express';
import { Sudoku } from '../models/Sudoku';
import { User } from '../models/User';
import { ApiResponse, SudokuInput } from '../types';

// Get all puzzles for authenticated user
export const getUserPuzzles = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as ApiResponse);
      return;
    }

    const puzzles = await Sudoku.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      message: 'Puzzles retrieved successfully',
      data: {
        puzzles,
        count: puzzles.length
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Get puzzles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving puzzles'
    } as ApiResponse);
  }
};

// Create new puzzle
export const createPuzzle = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as ApiResponse);
      return;
    }

    const { title, puzzleData }: SudokuInput = req.body;

    // Validate input
    if (!title || !puzzleData) {
      res.status(400).json({
        success: false,
        message: 'Title and puzzle data are required'
      } as ApiResponse);
      return;
    }

    // Check if user already has 20 puzzles
    const userPuzzleCount = await Sudoku.countDocuments({ user: req.user.userId });
    if (userPuzzleCount >= 20) {
      res.status(400).json({
        success: false,
        message: 'Maximum of 20 puzzles allowed per user. Please delete some puzzles first.'
      } as ApiResponse);
      return;
    }

    // Validate puzzle data format (9x9 grid with numbers 0-9)
    if (!Array.isArray(puzzleData) || puzzleData.length !== 9) {
      res.status(400).json({
        success: false,
        message: 'Puzzle data must be a 9x9 grid'
      } as ApiResponse);
      return;
    }

    const isValidGrid = puzzleData.every(row =>
      Array.isArray(row) &&
      row.length === 9 &&
      row.every(cell =>
        Number.isInteger(cell) && cell >= 0 && cell <= 9
      )
    );

    if (!isValidGrid) {
      res.status(400).json({
        success: false,
        message: 'Invalid puzzle format. Each cell must be a number between 0-9 (0 for empty cells)'
      } as ApiResponse);
      return;
    }

    // Create new puzzle
    const puzzle = new Sudoku({
      user: req.user.userId,
      title: title.trim(),
      puzzleData
    });

    await puzzle.save();

    res.status(201).json({
      success: true,
      message: 'Puzzle created successfully',
      data: { puzzle }
    } as ApiResponse);

  } catch (error) {
    console.error('Create puzzle error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating puzzle'
    } as ApiResponse);
  }
};

// Get single puzzle by ID
export const getPuzzleById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as ApiResponse);
      return;
    }

    const { id } = req.params;

    const puzzle = await Sudoku.findOne({
      _id: id,
      user: req.user.userId
    });

    if (!puzzle) {
      res.status(404).json({
        success: false,
        message: 'Puzzle not found'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Puzzle retrieved successfully',
      data: { puzzle }
    } as ApiResponse);

  } catch (error) {
    console.error('Get puzzle error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving puzzle'
    } as ApiResponse);
  }
};

// Delete puzzle
export const deletePuzzle = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as ApiResponse);
      return;
    }

    const { id } = req.params;

    const puzzle = await Sudoku.findOneAndDelete({
      _id: id,
      user: req.user.userId
    });

    if (!puzzle) {
      res.status(404).json({
        success: false,
        message: 'Puzzle not found'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Puzzle deleted successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Delete puzzle error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting puzzle'
    } as ApiResponse);
  }
};

// Get all public puzzles with filtering and sorting
export const getPublicPuzzles = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const {
      difficulty,
      category,
      tags,
      author,
      sortBy = 'newest',
      search
    } = req.query;

    // Build filter object
    const filter: any = { isPublic: true };

    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagArray };
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    let sort: any = {};
    switch (sortBy) {
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'popular':
        sort = { 'stats.views': -1, createdAt: -1 };
        break;
      case 'trending':
        // Will be handled separately with aggregation
        break;
      case 'rating':
        sort = { 'stats.rating': -1, 'stats.ratingCount': -1 };
        break;
      default: // newest
        sort = { createdAt: -1 };
    }

    let puzzles;
    let total;

    if (sortBy === 'trending') {
      // Use the trending method from the model
      const trendingPuzzles = await Sudoku.findTrending(limit);
      puzzles = trendingPuzzles.slice(skip, skip + limit);
      total = trendingPuzzles.length;
    } else {
      // Add author filter if specified
      if (author) {
        const authorUser = await User.findOne({ username: author });
        if (authorUser) {
          filter.user = authorUser._id;
        } else {
          // Author not found, return empty results
          res.status(200).json({
            success: true,
            message: 'Public puzzles retrieved successfully',
            data: {
              puzzles: [],
              pagination: {
                currentPage: page,
                totalPages: 0,
                totalItems: 0,
                hasNext: false,
                hasPrev: false
              }
            }
          } as ApiResponse);
          return;
        }
      }

      puzzles = await Sudoku.find(filter)
        .populate('user', 'username displayName avatar isVerified')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      total = await Sudoku.countDocuments(filter);
    }

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: 'Public puzzles retrieved successfully',
      data: {
        puzzles,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Get public puzzles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving public puzzles'
    } as ApiResponse);
  }
};

// Get any puzzle by ID (public access)
export const getPublicPuzzleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.userId;

    const puzzle = await Sudoku.findById(id)
      .populate('user', 'username displayName avatar isVerified')
      .populate('comments.user', 'username displayName avatar')
      .populate('comments.replies.user', 'username displayName avatar');

    if (!puzzle) {
      res.status(404).json({
        success: false,
        message: 'Puzzle not found'
      } as ApiResponse);
      return;
    }

    // Increment view count (only if not the owner)
    if (!currentUserId || puzzle.user._id.toString() !== currentUserId) {
      puzzle.stats.views = (puzzle.stats.views || 0) + 1;
      await puzzle.save();
    }

    // Check if current user has liked this puzzle
    const isLiked = currentUserId ?
      puzzle.likes.some(like => like.user.toString() === currentUserId) :
      false;

    // Check if current user is following the author
    let isFollowing = false;
    if (currentUserId && currentUserId !== puzzle.user._id.toString()) {
      const currentUser = await User.findById(currentUserId);
      isFollowing = currentUser ?
        currentUser.following.includes(puzzle.user._id) :
        false;
    }

    res.status(200).json({
      success: true,
      message: 'Puzzle retrieved successfully',
      data: {
        puzzle,
        userInteractions: {
          isLiked,
          isFollowing,
          isOwner: currentUserId === puzzle.user._id.toString()
        }
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Get public puzzle error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving puzzle'
    } as ApiResponse);
  }
};

// Get user profile and their public puzzles
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as ApiResponse);
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      } as ApiResponse);
      return;
    }

    // Get user's puzzle statistics
    const totalPuzzles = await Sudoku.countDocuments({ user: req.user.userId });
    const recentPuzzles = await Sudoku.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate join date
    const joinDate = user.createdAt;
    const daysSinceJoined = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          email: user.email,
          joinDate,
          daysSinceJoined
        },
        statistics: {
          totalPuzzles,
          puzzlesRemaining: 20 - totalPuzzles,
          daysSinceJoined
        },
        recentPuzzles
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving profile'
    } as ApiResponse);
  }
};

// Get leaderboard of users by puzzle count
export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const leaderboard = await Sudoku.aggregate([
      {
        $group: {
          _id: '$user',
          puzzleCount: { $sum: 1 },
          latestPuzzle: { $max: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          email: '$userInfo.email',
          puzzleCount: 1,
          latestPuzzle: 1
        }
      },
      {
        $sort: { puzzleCount: -1, latestPuzzle: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Leaderboard retrieved successfully',
      data: { leaderboard }
    } as ApiResponse);

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving leaderboard'
    } as ApiResponse);
  }
};