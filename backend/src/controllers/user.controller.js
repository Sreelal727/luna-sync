const { query } = require('../config/database');
const { ApiError } = require('../middleware/error.middleware');
const Joi = require('joi');

/**
 * Update user profile
 * PATCH /api/v1/users/profile
 */
const updateProfile = async (req, res) => {
  const schema = Joi.object({
    first_name: Joi.string().min(1).max(100).optional(),
    date_of_birth: Joi.date().iso().max('now').optional(),
    avg_cycle_length: Joi.number().integer().min(21).max(35).optional()
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message, 'VALIDATION_ERROR');
  }

  const userId = req.user.user_id;

  // Build dynamic update query
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (value.first_name !== undefined) {
    updates.push(`first_name = $${paramCount++}`);
    values.push(value.first_name);
  }
  if (value.date_of_birth !== undefined) {
    updates.push(`date_of_birth = $${paramCount++}`);
    values.push(value.date_of_birth);
  }
  if (value.avg_cycle_length !== undefined) {
    updates.push(`avg_cycle_length = $${paramCount++}`);
    values.push(value.avg_cycle_length);
  }

  if (updates.length === 0) {
    throw new ApiError(400, 'No valid fields to update', 'NO_UPDATES');
  }

  updates.push(`updated_at = NOW()`);
  values.push(userId);

  const result = await query(
    `UPDATE users
     SET ${updates.join(', ')}
     WHERE user_id = $${paramCount}
     RETURNING user_id, email, first_name, date_of_birth, avg_cycle_length, subscription_tier, onboarding_completed`,
    values
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: result.rows[0]
    }
  });
};

/**
 * Get user statistics
 * GET /api/v1/users/stats
 */
const getUserStats = async (req, res) => {
  const userId = req.user.user_id;

  // Get total cycles logged
  const cyclesResult = await query(
    'SELECT COUNT(*) as total_cycles FROM cycle_records WHERE user_id = $1',
    [userId]
  );

  // Get total mood logs
  const moodLogsResult = await query(
    'SELECT COUNT(*) as total_logs FROM mood_logs WHERE user_id = $1',
    [userId]
  );

  // Get streak (consecutive days logged)
  const streakResult = await query(
    `WITH daily_logs AS (
      SELECT log_date, LAG(log_date) OVER (ORDER BY log_date DESC) as prev_date
      FROM mood_logs
      WHERE user_id = $1
      ORDER BY log_date DESC
    )
    SELECT COUNT(*) as streak
    FROM daily_logs
    WHERE prev_date IS NULL OR log_date - prev_date = 1`,
    [userId]
  );

  // Get account age
  const userResult = await query(
    'SELECT created_at FROM users WHERE user_id = $1',
    [userId]
  );

  res.status(200).json({
    success: true,
    data: {
      total_cycles: parseInt(cyclesResult.rows[0].total_cycles),
      total_mood_logs: parseInt(moodLogsResult.rows[0].total_logs),
      current_streak: parseInt(streakResult.rows[0]?.streak || 0),
      member_since: userResult.rows[0].created_at
    }
  });
};

module.exports = {
  updateProfile,
  getUserStats
};
