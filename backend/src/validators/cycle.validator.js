const Joi = require('joi');

const logPeriodSchema = Joi.object({
  period_start_date: Joi.date()
    .iso()
    .max('now')
    .required()
    .messages({
      'date.max': 'Period start date cannot be in the future',
      'any.required': 'Period start date is required'
    }),
  period_end_date: Joi.date()
    .iso()
    .max('now')
    .min(Joi.ref('period_start_date'))
    .optional()
    .allow(null)
    .messages({
      'date.max': 'Period end date cannot be in the future',
      'date.min': 'Period end date must be after start date'
    }),
  flow_intensity: Joi.string()
    .valid('spotting', 'light', 'medium', 'heavy')
    .optional()
    .messages({
      'any.only': 'Flow intensity must be one of: spotting, light, medium, heavy'
    }),
  notes: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Notes cannot exceed 500 characters'
    })
});

const updatePeriodSchema = Joi.object({
  period_end_date: Joi.date()
    .iso()
    .max('now')
    .optional()
    .allow(null),
  flow_intensity: Joi.string()
    .valid('spotting', 'light', 'medium', 'heavy')
    .optional(),
  notes: Joi.string()
    .max(500)
    .optional()
    .allow('')
});

module.exports = {
  logPeriodSchema,
  updatePeriodSchema
};
