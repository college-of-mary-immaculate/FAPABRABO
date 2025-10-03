require('dotenv').config();
const express = require('express');
const { errorHandler } = require('./API/utils/errors');
const { requestLogger } = require('./API/utils/logger');
const apiRoutes = require('./API/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(requestLogger);

// API Routes
app.use('/api', apiRoutes);

// Error handling (must be last middleware)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
});

module.exports = app;
