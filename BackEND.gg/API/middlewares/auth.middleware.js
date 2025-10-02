const { UnauthorizedError } = require('../utils/errors');

/**
 * Middleware to validate API key
 */
const validateApiKey = (req, res, next) => {
  // Get API key from header
  const apiKey = req.headers['x-api-key'];
  
  // In a real app, you would validate against a database or environment variable
  // For now, we'll use a simple check against an environment variable
  const validApiKeys = process.env.API_KEYS ? process.env.API_KEYS.split(',') : [];
  
  // Skip validation for health check endpoint
  if (req.path === '/health') {
    return next();
  }
  
  if (!apiKey || !validApiKeys.includes(apiKey)) {
    throw new UnauthorizedError('Invalid or missing API key');
  }
  
  next();
};

module.exports = {
  validateApiKey
};
