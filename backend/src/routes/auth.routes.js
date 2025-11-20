const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/error.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const {
  register,
  login,
  completeOnboarding,
  getCurrentUser
} = require('../controllers/auth.controller');

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', asyncHandler(register));

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', asyncHandler(login));

/**
 * @route   POST /api/v1/auth/onboarding/complete
 * @desc    Complete onboarding process
 * @access  Private
 */
router.post('/onboarding/complete', authenticate, asyncHandler(completeOnboarding));

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, asyncHandler(getCurrentUser));

module.exports = router;
