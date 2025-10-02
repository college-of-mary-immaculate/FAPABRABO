const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateApiKey } = require('../middlewares/auth.middleware');

// API key validation endpoint
router.post('/validate', authController.validateApiKey);

// Generate a new API key (protected by admin key)
router.post('/generate-key', validateApiKey, authController.generateApiKey);

// Revoke an API key (protected by admin key)
router.post('/revoke-key', validateApiKey, authController.revokeApiKey);

module.exports = router;
