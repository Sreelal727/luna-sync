const { query } = require('../config/database');
const { ApiError } = require('../middleware/error.middleware');
const { logMoodSchema } = require('../validators/mood.validator');

/**
 * Log mood and symptoms
 * POST /api/v1/logs/mood
 */
const logMood = async (req, res) => {
  const { error, value } = logMoodSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message, 'VALIDATION_ERROR');
  }

  const { log_date, mood, energy_level, symptoms, flow_intensity, notes, is_private } = value;
  const userId = req.user.user_id;

  // Check if log already exists for this date
  const existing = await query(
    'SELECT log_id FROM mood_logs WHERE user_id = $1 AND log_date = $2',
    [userId, log_date]
  );

  let result;
  if (existing.rows.length > 0) {
    // Update existing log
    result = await query(
      `UPDATE mood_logs
       SET mood = $1, energy_level = $2, symptoms = $3, flow_intensity = $4,
           notes = $5, is_private = $6
       WHERE user_id = $7 AND log_date = $8
       RETURNING *`,
      [mood, energy_level, JSON.stringify(symptoms), flow_intensity, notes, is_private, userId, log_date]
    );
  } else {
    // Create new log
    result = await query(
      `INSERT INTO mood_logs (user_id, log_date, mood, energy_level, symptoms, flow_intensity, notes, is_private)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, log_date, mood, energy_level, JSON.stringify(symptoms), flow_intensity, notes, is_private]
    );
  }

  res.status(201).json({
    success: true,
    message: existing.rows.length > 0 ? 'Mood log updated successfully' : 'Mood log created successfully',
    data: {
      log: result.rows[0]
    }
  });
};

/**
 * Get mood logs for a date range
 * GET /api/v1/logs/mood
 */
const getMoodLogs = async (req, res) => {
  const userId = req.user.user_id;
  const { start_date, end_date, limit = 30 } = req.query;

  let queryText;
  let params;

  if (start_date && end_date) {
    queryText = `
      SELECT log_id, log_date, mood, energy_level, symptoms, flow_intensity, notes, is_private, created_at
      FROM mood_logs
      WHERE user_id = $1 AND log_date BETWEEN $2 AND $3
      ORDER BY log_date DESC
    `;
    params = [userId, start_date, end_date];
  } else {
    queryText = `
      SELECT log_id, log_date, mood, energy_level, symptoms, flow_intensity, notes, is_private, created_at
      FROM mood_logs
      WHERE user_id = $1
      ORDER BY log_date DESC
      LIMIT $2
    `;
    params = [userId, limit];
  }

  const result = await query(queryText, params);

  res.status(200).json({
    success: true,
    data: {
      logs: result.rows,
      count: result.rows.length
    }
  });
};

/**
 * Get mood log for specific date
 * GET /api/v1/logs/mood/:date
 */
const getMoodLogByDate = async (req, res) => {
  const userId = req.user.user_id;
  const { date } = req.params;

  const result = await query(
    `SELECT log_id, log_date, mood, energy_level, symptoms, flow_intensity, notes, is_private, created_at
     FROM mood_logs
     WHERE user_id = $1 AND log_date = $2`,
    [userId, date]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No log found for this date',
      code: 'LOG_NOT_FOUND'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      log: result.rows[0]
    }
  });
};

/**
 * Delete mood log
 * DELETE /api/v1/logs/mood/:logId
 */
const deleteMoodLog = async (req, res) => {
  const userId = req.user.user_id;
  const { logId } = req.params;

  const result = await query(
    'DELETE FROM mood_logs WHERE log_id = $1 AND user_id = $2 RETURNING log_id',
    [logId, userId]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Mood log not found', 'LOG_NOT_FOUND');
  }

  res.status(200).json({
    success: true,
    message: 'Mood log deleted successfully'
  });
};

/**
 * Get mood statistics
 * GET /api/v1/logs/mood/stats
 */
const getMoodStats = async (req, res) => {
  const userId = req.user.user_id;
  const { days = 30 } = req.query;

  // Get logs from last N days
  const result = await query(
    `SELECT mood, energy_level, symptoms
     FROM mood_logs
     WHERE user_id = $1 AND log_date >= CURRENT_DATE - $2
     ORDER BY log_date DESC`,
    [userId, days]
  );

  if (result.rows.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        period_days: days,
        total_logs: 0,
        mood_breakdown: {},
        avg_energy: null,
        common_symptoms: []
      }
    });
  }

  // Calculate mood breakdown
  const moodCounts = {};
  let totalEnergy = 0;
  let energyCount = 0;
  const symptomCounts = {};

  result.rows.forEach(log => {
    if (log.mood) {
      moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
    }
    if (log.energy_level) {
      totalEnergy += log.energy_level;
      energyCount++;
    }
    if (log.symptoms && Array.isArray(log.symptoms)) {
      log.symptoms.forEach(symptom => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });
    }
  });

  // Get top 5 symptoms
  const commonSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([symptom, count]) => ({ symptom, count }));

  res.status(200).json({
    success: true,
    data: {
      period_days: days,
      total_logs: result.rows.length,
      mood_breakdown: moodCounts,
      avg_energy: energyCount > 0 ? (totalEnergy / energyCount).toFixed(1) : null,
      common_symptoms: commonSymptoms
    }
  });
};

module.exports = {
  logMood,
  getMoodLogs,
  getMoodLogByDate,
  deleteMoodLog,
  getMoodStats
};
