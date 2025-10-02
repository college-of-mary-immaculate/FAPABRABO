const Joi = require('joi');
const { BadRequestError } = require('./errors');

/**
 * Validate request data against a Joi schema
 * @param {Object} data - Data to validate
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Object} Validated data
 * @throws {BadRequestError} If validation fails
 */
const validate = (data, schema) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message.replace(/["']/g, '')
    }));
    
    throw new BadRequestError('Validation failed', { errors });
  }

  return value;
};

/**
 * Middleware to validate request data
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} [source='body'] - Request property to validate ('body', 'query', 'params')
 */
const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const data = req[source];
      const validatedData = validate(data, schema);
      req[source] = validatedData;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Common validation schemas
const schemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  }),
  
  searchQuery: Joi.object({
    q: Joi.string().trim().min(1).required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  }),
  
  apiKey: Joi.object({
    apiKey: Joi.string().required()
  })
};

module.exports = {
  validate,
  validateRequest,
  schemas
};
