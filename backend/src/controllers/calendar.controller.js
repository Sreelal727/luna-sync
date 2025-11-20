const { query } = require('../config/database');
const { startOfMonth, endOfMonth, eachDayOfInterval, format, parseISO, addDays } = require('date-fns');

/**
 * Get calendar data for a specific month
 * GET /api/v1/calendar?year=2025&month=11
 */
const getCalendarData = async (req, res) => {
  const userId = req.user.user_id;
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const month = parseInt(req.query.month) || new Date().getMonth() + 1;

  // Validate month
  if (month < 1 || month > 12) {
    return res.status(400).json({
      success: false,
      message: 'Month must be between 1 and 12'
    });
  }

  // Get date range for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = endOfMonth(startDate);

  // Get cycle records for the month and surrounding periods
  const cycles = await query(
    `SELECT record_id, period_start_date, period_end_date, flow_intensity
     FROM cycle_records
     WHERE user_id = $1
       AND (period_start_date <= $2 AND (period_end_date >= $3 OR period_end_date IS NULL))
        OR (period_start_date BETWEEN $3 AND $2)
     ORDER BY period_start_date`,
    [userId, format(endDate, 'yyyy-MM-dd'), format(startDate, 'yyyy-MM-dd')]
  );

  // Get mood logs for the month
  const moodLogs = await query(
    `SELECT log_date, mood, energy_level, symptoms, flow_intensity
     FROM mood_logs
     WHERE user_id = $1 AND log_date BETWEEN $2 AND $3
     ORDER BY log_date`,
    [userId, format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')]
  );

  // Get predictions
  const lastCycle = await query(
    `SELECT period_start_date, cycle_length
     FROM cycle_records
     WHERE user_id = $1 AND cycle_length IS NOT NULL
     ORDER BY period_start_date DESC
     LIMIT 1`,
    [userId]
  );

  const userAvg = await query(
    'SELECT avg_cycle_length FROM users WHERE user_id = $1',
    [userId]
  );

  const avgLength = userAvg.rows[0]?.avg_cycle_length || 28;

  // Calculate predicted periods
  let predictions = [];
  if (lastCycle.rows.length > 0) {
    const lastDate = parseISO(lastCycle.rows[0].period_start_date);
    const cycleLength = lastCycle.rows[0].cycle_length || avgLength;

    // Predict next 3 periods
    for (let i = 1; i <= 3; i++) {
      const predictedDate = addDays(lastDate, cycleLength * i);
      const predictedEnd = addDays(predictedDate, 5); // Assume 5-day period

      predictions.push({
        start_date: format(predictedDate, 'yyyy-MM-dd'),
        end_date: format(predictedEnd, 'yyyy-MM-dd'),
        type: 'predicted'
      });
    }
  }

  // Build calendar days
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate }).map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');

    // Check if this date is in a period
    const periodRecord = cycles.rows.find(cycle => {
      const start = parseISO(cycle.period_start_date);
      const end = cycle.period_end_date ? parseISO(cycle.period_end_date) : addDays(start, 5);
      return date >= start && date <= end;
    });

    // Check if this date has a mood log
    const moodLog = moodLogs.rows.find(log => log.log_date === dateStr);

    // Check if this date is in a predicted period
    const predictedPeriod = predictions.find(pred => {
      return dateStr >= pred.start_date && dateStr <= pred.end_date;
    });

    return {
      date: dateStr,
      has_period: !!periodRecord,
      flow_intensity: periodRecord?.flow_intensity || null,
      has_mood_log: !!moodLog,
      mood: moodLog?.mood || null,
      energy_level: moodLog?.energy_level || null,
      symptoms_count: moodLog?.symptoms ? moodLog.symptoms.length : 0,
      is_predicted: !!predictedPeriod
    };
  });

  res.status(200).json({
    success: true,
    data: {
      year,
      month,
      days: calendarDays,
      predictions: predictions.filter(pred => {
        // Only include predictions that overlap with this month
        return pred.start_date <= format(endDate, 'yyyy-MM-dd') &&
               pred.end_date >= format(startDate, 'yyyy-MM-dd');
      })
    }
  });
};

/**
 * Get calendar data for multiple months
 * GET /api/v1/calendar/range?start=2025-01&end=2025-03
 */
const getCalendarRange = async (req, res) => {
  const userId = req.user.user_id;
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({
      success: false,
      message: 'Both start and end parameters are required (format: YYYY-MM)'
    });
  }

  const [startYear, startMonth] = start.split('-').map(Number);
  const [endYear, endMonth] = end.split('-').map(Number);

  const startDate = new Date(startYear, startMonth - 1, 1);
  const endDate = endOfMonth(new Date(endYear, endMonth - 1, 1));

  // Get all cycles in range
  const cycles = await query(
    `SELECT record_id, period_start_date, period_end_date, flow_intensity
     FROM cycle_records
     WHERE user_id = $1 AND period_start_date <= $2
     ORDER BY period_start_date`,
    [userId, format(endDate, 'yyyy-MM-dd')]
  );

  // Get all mood logs in range
  const moodLogs = await query(
    `SELECT log_date, mood, energy_level, symptoms
     FROM mood_logs
     WHERE user_id = $1 AND log_date BETWEEN $2 AND $3
     ORDER BY log_date`,
    [userId, format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')]
  );

  res.status(200).json({
    success: true,
    data: {
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      cycles: cycles.rows,
      mood_logs: moodLogs.rows
    }
  });
};

module.exports = {
  getCalendarData,
  getCalendarRange
};
