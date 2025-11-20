const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/error.middleware');
const { authenticate, requireOnboarding } = require('../middleware/auth.middleware');
const {
  logMood,
  getMoodLogs,
  getMoodLogByDate,
  deleteMoodLog,
  getMoodStats
} = require('../controllers/mood.controller');

// All routes require authentication
router.use(authenticate);
router.use(requireOnboarding);

/**
 * @route   POST /api/v1/logs/mood
 * @desc    Log mood and symptoms
 * @access  Private
 */
router.post('/mood', asyncHandler(logMood));

/**
 * @route   GET /api/v1/logs/mood
 * @desc    Get mood logs (with optional date range)
 * @access  Private
 */
router.get('/mood', asyncHandler(getMoodLogs));

/**
 * @route   GET /api/v1/logs/mood/stats
 * @desc    Get mood statistics
 * @access  Private
 */
router.get('/mood/stats', asyncHandler(getMoodStats));

/**
 * @route   GET /api/v1/logs/mood/:date
 * @desc    Get mood log for specific date
 * @access  Private
 */
router.get('/mood/:date', asyncHandler(getMoodLogByDate));

/**
 * @route   DELETE /api/v1/logs/mood/:logId
 * @desc    Delete mood log
 * @access  Private
 */
router.delete('/mood/:logId', asyncHandler(deleteMoodLog));

module.exports = router;
