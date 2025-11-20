const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

/**
 * Middleware to verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization header must be in format: Bearer <token>'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired. Please login again.',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
        code: 'INVALID_TOKEN'
      });
    }

    // Get user from database
    const result = await query(
      'SELECT user_id, email, first_name, subscription_tier, onboarding_completed FROM users WHERE user_id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token may be invalid.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Attach user to request object
    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Middleware to check if user has completed onboarding
 */
const requireOnboarding = (req, res, next) => {
  if (!req.user.onboarding_completed) {
    return res.status(403).json({
      success: false,
      message: 'Please complete onboarding first',
      code: 'ONBOARDING_REQUIRED'
    });
  }
  next();
};

/**
 * Middleware to check subscription tier
 */
const requireSubscription = (minTier = 'premium') => {
  const tierLevels = {
    free: 0,
    premium: 1,
    partner_pro: 2
  };

  return (req, res, next) => {
    const userTier = req.user.subscription_tier || 'free';

    if (tierLevels[userTier] < tierLevels[minTier]) {
      return res.status(403).json({
        success: false,
        message: `This feature requires ${minTier} subscription`,
        code: 'SUBSCRIPTION_REQUIRED',
        current_tier: userTier,
        required_tier: minTier
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  requireOnboarding,
  requireSubscription
};
