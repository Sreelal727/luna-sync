/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let code = err.code || 'INTERNAL_ERROR';

  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      message: err.message,
      stack: err.stack,
      statusCode,
      path: req.path,
      method: req.method
    });
  }

  // PostgreSQL errors
  if (err.code && err.code.startsWith('23')) {
    // Database constraint violations
    if (err.code === '23505') {
      // Unique violation
      statusCode = 409;
      message = 'Resource already exists';
      code = 'DUPLICATE_ENTRY';

      // Extract field name from error message
      const match = err.detail?.match(/Key \((.*?)\)=/);
      if (match) {
        message = `${match[1]} already exists`;
      }
    } else if (err.code === '23503') {
      // Foreign key violation
      statusCode = 400;
      message = 'Referenced resource not found';
      code = 'INVALID_REFERENCE';
    } else if (err.code === '23514') {
      // Check constraint violation
      statusCode = 400;
      message = 'Invalid data provided';
      code = 'CONSTRAINT_VIOLATION';
    }
  }

  // Joi validation errors
  if (err.isJoi) {
    statusCode = 400;
    message = err.details[0].message;
    code = 'VALIDATION_ERROR';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      originalError: err.message
    })
  });
};

/**
 * Async error wrapper to catch async errors in route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  ApiError,
  errorHandler,
  asyncHandler
};
