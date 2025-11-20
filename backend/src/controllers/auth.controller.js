const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { ApiError } = require('../middleware/error.middleware');
const { registerSchema, loginSchema, completeOnboardingSchema } = require('../validators/auth.validator');

/**
 * Generate JWT token
 */
const generateToken = (userId, expiresIn = process.env.JWT_EXPIRES_IN || '7d') => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

/**
 * Register new user
 * POST /api/v1/auth/register
 */
const register = async (req, res) => {
  // Validate request body
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message, 'VALIDATION_ERROR');
  }

  const { email, password, first_name, date_of_birth, avg_cycle_length } = value;

  // Check if user already exists
  const existingUser = await query(
    'SELECT user_id FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (existingUser.rows.length > 0) {
    throw new ApiError(409, 'Email already registered', 'EMAIL_EXISTS');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  const result = await query(
    `INSERT INTO users (email, password_hash, first_name, date_of_birth, avg_cycle_length)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING user_id, email, first_name, avg_cycle_length, onboarding_completed, subscription_tier, created_at`,
    [email.toLowerCase(), passwordHash, first_name, date_of_birth, avg_cycle_length]
  );

  const user = result.rows[0];

  // Generate tokens
  const accessToken = generateToken(user.user_id);
  const refreshToken = generateToken(user.user_id, '30d');

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        avg_cycle_length: user.avg_cycle_length,
        onboarding_completed: user.onboarding_completed,
        subscription_tier: user.subscription_tier
      },
      access_token: accessToken,
      refresh_token: refreshToken
    }
  });
};

/**
 * Login user
 * POST /api/v1/auth/login
 */
const login = async (req, res) => {
  // Validate request body
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message, 'VALIDATION_ERROR');
  }

  const { email, password } = value;

  // Get user from database
  const result = await query(
    `SELECT user_id, email, password_hash, first_name, avg_cycle_length,
            onboarding_completed, subscription_tier
     FROM users
     WHERE email = $1`,
    [email.toLowerCase()]
  );

  if (result.rows.length === 0) {
    throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const user = result.rows[0];

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  // Generate tokens
  const accessToken = generateToken(user.user_id);
  const refreshToken = generateToken(user.user_id, '30d');

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        avg_cycle_length: user.avg_cycle_length,
        onboarding_completed: user.onboarding_completed,
        subscription_tier: user.subscription_tier
      },
      access_token: accessToken,
      refresh_token: refreshToken
    }
  });
};

/**
 * Complete onboarding
 * POST /api/v1/auth/onboarding/complete
 */
const completeOnboarding = async (req, res) => {
  const { error, value } = completeOnboardingSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message, 'VALIDATION_ERROR');
  }

  const { avg_cycle_length, last_period_date } = value;
  const userId = req.user.user_id;

  // Update user onboarding status
  await query(
    `UPDATE users
     SET onboarding_completed = true, avg_cycle_length = $1, updated_at = NOW()
     WHERE user_id = $2`,
    [avg_cycle_length, userId]
  );

  // If last period date provided, create a cycle record
  if (last_period_date) {
    await query(
      `INSERT INTO cycle_records (user_id, period_start_date)
       VALUES ($1, $2)`,
      [userId, last_period_date]
    );
  }

  res.status(200).json({
    success: true,
    message: 'Onboarding completed successfully',
    data: {
      onboarding_completed: true
    }
  });
};

/**
 * Get current user
 * GET /api/v1/auth/me
 */
const getCurrentUser = async (req, res) => {
  const userId = req.user.user_id;

  const result = await query(
    `SELECT user_id, email, first_name, date_of_birth, avg_cycle_length,
            onboarding_completed, subscription_tier, created_at
     FROM users
     WHERE user_id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  }

  res.status(200).json({
    success: true,
    data: {
      user: result.rows[0]
    }
  });
};

module.exports = {
  register,
  login,
  completeOnboarding,
  getCurrentUser
};
