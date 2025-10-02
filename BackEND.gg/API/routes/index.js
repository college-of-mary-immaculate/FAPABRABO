const express = require('express');
const router = express.Router();
const { validateApiKey } = require('../middlewares/auth.middleware');

// Import route modules
const searchRoutes = require('./search.routes');
const nlpRoutes = require('./nlp.routes');

// Apply API key validation to all routes
router.use(validateApiKey);

// Route definitions
router.use('/search', searchRoutes);
router.use('/nlp', nlpRoutes);

// Health check endpoint (public)
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'FAPABRABO API',
    version: '1.0.0',
    timestamp: new Date().toISOString() 
  });
});

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'API endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
