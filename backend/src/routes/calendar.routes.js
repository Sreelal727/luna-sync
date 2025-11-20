const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/error.middleware');
const { authenticate, requireOnboarding } = require('../middleware/auth.middleware');
const {
  getCalendarData,
  getCalendarRange
} = require('../controllers/calendar.controller');

// All routes require authentication
router.use(authenticate);
router.use(requireOnboarding);

/**
 * @route   GET /api/v1/calendar
 * @desc    Get calendar data for a specific month
 * @access  Private
 * @query   year (optional), month (optional)
 */
router.get('/', asyncHandler(getCalendarData));

/**
 * @route   GET /api/v1/calendar/range
 * @desc    Get calendar data for multiple months
 * @access  Private
 * @query   start (YYYY-MM), end (YYYY-MM)
 */
router.get('/range', asyncHandler(getCalendarRange));

module.exports = router;
