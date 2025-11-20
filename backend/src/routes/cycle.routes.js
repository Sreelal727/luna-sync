const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/error.middleware');
const { authenticate, requireOnboarding } = require('../middleware/auth.middleware');
const {
  logPeriod,
  updatePeriod,
  getPredictions,
  getHistory
} = require('../controllers/cycle.controller');

// All routes require authentication
router.use(authenticate);
router.use(requireOnboarding);

/**
 * @route   POST /api/v1/cycles/period
 * @desc    Log period start
 * @access  Private
 */
router.post('/period', asyncHandler(logPeriod));

/**
 * @route   PATCH /api/v1/cycles/period/:recordId
 * @desc    Update period record
 * @access  Private
 */
router.patch('/period/:recordId', asyncHandler(updatePeriod));

/**
 * @route   GET /api/v1/cycles/predictions
 * @desc    Get cycle predictions
 * @access  Private
 */
router.get('/predictions', asyncHandler(getPredictions));

/**
 * @route   GET /api/v1/cycles/history
 * @desc    Get cycle history
 * @access  Private
 */
router.get('/history', asyncHandler(getHistory));

module.exports = router;
