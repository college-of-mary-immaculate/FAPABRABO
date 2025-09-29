const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, errors } = format;

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  const logMessage = `${timestamp} [${level}]: ${stack || message}`;
  return logMessage;
});

// Development logger with colors and stack traces
const developmentLogger = () => {
  return createLogger({
    level: 'debug', // Log everything in development
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }),
      consoleFormat
    ),
    transports: [new transports.Console()]
  });
};

// Production logger (JSON format)
const productionLogger = () => {
  return createLogger({
    level: 'info', // Only log important info in production
    format: combine(
      timestamp(),
      errors({ stack: true }),
      format.json()
    ),
    defaultMeta: { service: 'fapabrabo-api' },
    transports: [
      new transports.Console(),
      new transports.File({ filename: 'logs/error.log', level: 'error' }),
      new transports.File({ filename: 'logs/combined.log' })
    ]
  });
};

// Create logger based on environment
const logger = process.env.NODE_ENV === 'production' 
  ? productionLogger() 
  : developmentLogger();

// Request logging middleware
const requestLogger = (req, res, next) => {
  const { method, originalUrl, ip } = req;
  
  // Skip logging for health checks
  if (originalUrl === '/api/health') {
    return next();
  }
  
  const start = Date.now();
  
  res.on('finish', () => {
    const { statusCode } = res;
    const responseTime = Date.now() - start;
    
    logger.info(`${method} ${originalUrl} - ${statusCode} - ${responseTime}ms - ${ip}`);
  });
  
  next();
};

module.exports = {
  logger,
  requestLogger
};
