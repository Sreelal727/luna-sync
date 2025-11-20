const Joi = require('joi');

const VALID_MOODS = ['happy', 'calm', 'sad', 'anxious', 'irritable', 'energetic'];
const VALID_SYMPTOMS = [
  'cramps', 'bloating', 'headache', 'fatigue', 'breast_tenderness',
  'acne', 'backache', 'nausea', 'insomnia', 'cravings',
  'irritability', 'anxiety', 'sadness', 'mood_swings', 'increased_energy',
  'high_libido', 'low_libido', 'brain_fog', 'diarrhea', 'constipation'
];

const logMoodSchema = Joi.object({
  log_date: Joi.date()
    .iso()
    .max('now')
    .required()
    .messages({
      'date.max': 'Log date cannot be in the future',
      'any.required': 'Log date is required'
    }),
  mood: Joi.string()
    .valid(...VALID_MOODS)
    .optional()
    .allow(null)
    .messages({
      'any.only': `Mood must be one of: ${VALID_MOODS.join(', ')}`
    }),
  energy_level: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .optional()
    .allow(null)
    .messages({
      'number.min': 'Energy level must be between 1 and 10',
      'number.max': 'Energy level must be between 1 and 10'
    }),
  symptoms: Joi.array()
    .items(Joi.string().valid(...VALID_SYMPTOMS))
    .optional()
    .default([])
    .messages({
      'array.includes': `Invalid symptom. Must be one of: ${VALID_SYMPTOMS.join(', ')}`
    }),
  flow_intensity: Joi.string()
    .valid('spotting', 'light', 'medium', 'heavy', 'none')
    .optional()
    .default('none')
    .messages({
      'any.only': 'Flow intensity must be one of: spotting, light, medium, heavy, none'
    }),
  notes: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Notes cannot exceed 1000 characters'
    }),
  is_private: Joi.boolean()
    .optional()
    .default(true)
});

module.exports = {
  logMoodSchema,
  VALID_MOODS,
  VALID_SYMPTOMS
};
