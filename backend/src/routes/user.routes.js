const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/error.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const {
  updateProfile,
  getUserStats
} = require('../controllers/user.controller');

// All routes require authentication
router.use(authenticate);

/**
 * @route   PATCH /api/v1/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.patch('/profile', asyncHandler(updateProfile));

/**
 * @route   GET /api/v1/users/stats
 * @desc    Get user statistics
 * @access  Private
 */
router.get('/stats', asyncHandler(getUserStats));

module.exports = router;
