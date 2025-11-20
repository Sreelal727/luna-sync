const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(8)
    .max(128)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'any.required': 'Password is required'
    }),
  first_name: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .allow(''),
  date_of_birth: Joi.date()
    .iso()
    .max('now')
    .optional()
    .messages({
      'date.max': 'Date of birth cannot be in the future'
    }),
  avg_cycle_length: Joi.number()
    .integer()
    .min(21)
    .max(35)
    .default(28)
    .messages({
      'number.min': 'Cycle length must be at least 21 days',
      'number.max': 'Cycle length cannot exceed 35 days'
    })
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

const completeOnboardingSchema = Joi.object({
  avg_cycle_length: Joi.number()
    .integer()
    .min(21)
    .max(35)
    .required(),
  last_period_date: Joi.date()
    .iso()
    .max('now')
    .optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  completeOnboardingSchema
};
