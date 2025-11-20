const { query } = require('../config/database');
const { ApiError } = require('../middleware/error.middleware');
const { logPeriodSchema, updatePeriodSchema } = require('../validators/cycle.validator');
const { addDays, differenceInDays, parseISO } = require('date-fns');

/**
 * Calculate cycle prediction based on historical data
 */
const calculatePrediction = async (userId) => {
  // Get last 6 cycles
  const cycles = await query(
    `SELECT period_start_date, cycle_length
     FROM cycle_records
     WHERE user_id = $1 AND cycle_length IS NOT NULL
     ORDER BY period_start_date DESC
     LIMIT 6`,
    [userId]
  );

  // Get user's average cycle length
  const userResult = await query(
    'SELECT avg_cycle_length FROM users WHERE user_id = $1',
    [userId]
  );

  const userAvgLength = userResult.rows[0]?.avg_cycle_length || 28;

  if (cycles.rows.length === 0) {
    // No historical data, use user's avg cycle length
    return {
      avg_cycle_length: userAvgLength,
      confidence: 'low'
    };
  }

  // Calculate average from recent cycles
  const cycleLengths = cycles.rows.map(c => c.cycle_length);
  const avgLength = Math.round(
    cycleLengths.reduce((sum, len) => sum + len, 0) / cycleLengths.length
  );

  // Calculate confidence based on consistency
  const variance = cycleLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / cycleLengths.length;
  const stdDev = Math.sqrt(variance);

  let confidence = 'high';
  if (stdDev > 3) confidence = 'medium';
  if (stdDev > 5 || cycles.rows.length < 3) confidence = 'low';

  return {
    avg_cycle_length: avgLength,
    confidence,
    std_deviation: stdDev
  };
};

/**
 * Log period start
 * POST /api/v1/cycles/period
 */
const logPeriod = async (req, res) => {
  const { error, value } = logPeriodSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message, 'VALIDATION_ERROR');
  }

  const { period_start_date, period_end_date, flow_intensity, notes } = value;
  const userId = req.user.user_id;

  // Get the most recent cycle to calculate cycle length
  const lastCycle = await query(
    `SELECT period_start_date, record_id
     FROM cycle_records
     WHERE user_id = $1 AND period_start_date < $2
     ORDER BY period_start_date DESC
     LIMIT 1`,
    [userId, period_start_date]
  );

  let cycleLength = null;
  if (lastCycle.rows.length > 0) {
    const lastDate = parseISO(lastCycle.rows[0].period_start_date);
    const currentDate = parseISO(period_start_date);
    cycleLength = differenceInDays(currentDate, lastDate);

    // Update the previous cycle's cycle_length
    await query(
      'UPDATE cycle_records SET cycle_length = $1 WHERE record_id = $2',
      [cycleLength, lastCycle.rows[0].record_id]
    );
  }

  // Insert new cycle record
  const result = await query(
    `INSERT INTO cycle_records (user_id, period_start_date, period_end_date, flow_intensity, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, period_start_date, period_end_date, flow_intensity, notes]
  );

  // Calculate predictions
  const prediction = await calculatePrediction(userId);
  const nextPeriodDate = addDays(parseISO(period_start_date), prediction.avg_cycle_length);
  const ovulationDate = addDays(parseISO(period_start_date), prediction.avg_cycle_length - 14);

  res.status(201).json({
    success: true,
    message: 'Period logged successfully',
    data: {
      record: result.rows[0],
      predictions: {
        next_period_date: nextPeriodDate.toISOString().split('T')[0],
        ovulation_date: ovulationDate.toISOString().split('T')[0],
        avg_cycle_length: prediction.avg_cycle_length,
        confidence: prediction.confidence
      }
    }
  });
};

/**
 * Update period record (e.g., add end date)
 * PATCH /api/v1/cycles/period/:recordId
 */
const updatePeriod = async (req, res) => {
  const { error, value } = updatePeriodSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message, 'VALIDATION_ERROR');
  }

  const { recordId } = req.params;
  const userId = req.user.user_id;

  // Check if record exists and belongs to user
  const existing = await query(
    'SELECT * FROM cycle_records WHERE record_id = $1 AND user_id = $2',
    [recordId, userId]
  );

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Cycle record not found', 'RECORD_NOT_FOUND');
  }

  // Build update query dynamically
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (value.period_end_date !== undefined) {
    updates.push(`period_end_date = $${paramCount++}`);
    values.push(value.period_end_date);
  }
  if (value.flow_intensity !== undefined) {
    updates.push(`flow_intensity = $${paramCount++}`);
    values.push(value.flow_intensity);
  }
  if (value.notes !== undefined) {
    updates.push(`notes = $${paramCount++}`);
    values.push(value.notes);
  }

  if (updates.length === 0) {
    throw new ApiError(400, 'No valid fields to update', 'NO_UPDATES');
  }

  updates.push(`updated_at = NOW()`);
  values.push(recordId, userId);

  const result = await query(
    `UPDATE cycle_records
     SET ${updates.join(', ')}
     WHERE record_id = $${paramCount++} AND user_id = $${paramCount++}
     RETURNING *`,
    values
  );

  res.status(200).json({
    success: true,
    message: 'Period record updated successfully',
    data: {
      record: result.rows[0]
    }
  });
};

/**
 * Get cycle predictions
 * GET /api/v1/cycles/predictions
 */
const getPredictions = async (req, res) => {
  const userId = req.user.user_id;

  // Get most recent period
  const lastPeriod = await query(
    `SELECT period_start_date, period_end_date
     FROM cycle_records
     WHERE user_id = $1
     ORDER BY period_start_date DESC
     LIMIT 1`,
    [userId]
  );

  if (lastPeriod.rows.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'No period data available yet',
      data: {
        has_data: false
      }
    });
  }

  const lastDate = parseISO(lastPeriod.rows[0].period_start_date);
  const prediction = await calculatePrediction(userId);

  const nextPeriodDate = addDays(lastDate, prediction.avg_cycle_length);
  const ovulationDate = addDays(lastDate, prediction.avg_cycle_length - 14);
  const fertileWindowStart = addDays(ovulationDate, -5);
  const fertileWindowEnd = ovulationDate;

  // Calculate current cycle day
  const today = new Date();
  const cycleDay = differenceInDays(today, lastDate) + 1;

  // Determine current phase
  let currentPhase = 'menstrual';
  if (cycleDay > 5 && cycleDay <= 13) currentPhase = 'follicular';
  else if (cycleDay >= 14 && cycleDay <= 16) currentPhase = 'ovulation';
  else if (cycleDay > 16) currentPhase = 'luteal';

  res.status(200).json({
    success: true,
    data: {
      has_data: true,
      current_cycle: {
        day: cycleDay > prediction.avg_cycle_length ? prediction.avg_cycle_length : cycleDay,
        phase: currentPhase,
        started_on: lastPeriod.rows[0].period_start_date
      },
      predictions: {
        next_period_date: nextPeriodDate.toISOString().split('T')[0],
        ovulation_date: ovulationDate.toISOString().split('T')[0],
        fertile_window: {
          start: fertileWindowStart.toISOString().split('T')[0],
          end: fertileWindowEnd.toISOString().split('T')[0]
        },
        avg_cycle_length: prediction.avg_cycle_length,
        confidence: prediction.confidence
      }
    }
  });
};

/**
 * Get cycle history
 * GET /api/v1/cycles/history
 */
const getHistory = async (req, res) => {
  const userId = req.user.user_id;
  const limit = parseInt(req.query.limit) || 12;

  const result = await query(
    `SELECT record_id, period_start_date, period_end_date, cycle_length,
            flow_intensity, notes, created_at
     FROM cycle_records
     WHERE user_id = $1
     ORDER BY period_start_date DESC
     LIMIT $2`,
    [userId, limit]
  );

  res.status(200).json({
    success: true,
    data: {
      cycles: result.rows,
      count: result.rows.length
    }
  });
};

module.exports = {
  logPeriod,
  updatePeriod,
  getPredictions,
  getHistory
};
