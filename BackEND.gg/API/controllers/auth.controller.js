const authService = require('../services/auth.service');
const { APIError } = require('../utils/errors');

/**
 * Validate an API key
 * @route POST /auth/validate
 */
const validateApiKey = async (req, res, next) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      throw new APIError('API key is required', 400);
    }

    const isValid = await authService.validateApiKey(apiKey);
    
    if (!isValid) {
      throw new APIError('Invalid API key', 401);
    }

    res.json({
      status: 'success',
      data: { valid: true },
      meta: { action: 'validate' }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate a new API key (admin only)
 * @route POST /auth/generate-key
 */
const generateApiKey = async (req, res, next) => {
  try {
    const { name, permissions = [], expiresIn } = req.body;
    
    if (!name) {
      throw new APIError('API key name is required', 400);
    }

    const apiKey = await authService.generateApiKey({
      name,
      permissions,
      expiresIn
    });

    res.status(201).json({
      status: 'success',
      data: { apiKey },
      meta: { action: 'generate' }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Revoke an API key (admin only)
 * @route POST /auth/revoke-key
 */
const revokeApiKey = async (req, res, next) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      throw new APIError('API key is required', 400);
    }

    const result = await authService.revokeApiKey(apiKey);
    
    if (!result) {
      throw new APIError('Failed to revoke API key', 500);
    }

    res.json({
      status: 'success',
      data: { revoked: true },
      meta: { action: 'revoke' }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateApiKey,
  generateApiKey,
  revokeApiKey
};
