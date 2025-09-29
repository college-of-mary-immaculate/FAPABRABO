/**
 * Custom API Error class
 */
class APIError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request Error
 */
class BadRequestError extends APIError {
  constructor(message = 'Bad Request', details = null) {
    super(message, 400, details);
  }
}

/**
 * 401 Unauthorized Error
 */
class UnauthorizedError extends APIError {
  constructor(message = 'Unauthorized', details = null) {
    super(message, 401, details);
  }
}

/**
 * 403 Forbidden Error
 */
class ForbiddenError extends APIError {
  constructor(message = 'Forbidden', details = null) {
    super(message, 403, details);
  }
}

/**
 * 404 Not Found Error
 */
class NotFoundError extends APIError {
  constructor(message = 'Resource not found', details = null) {
    super(message, 404, details);
  }
}

/**
 * 409 Conflict Error
 */
class ConflictError extends APIError {
  constructor(message = 'Conflict', details = null) {
    super(message, 409, details);
  }
}

/**
 * 500 Internal Server Error
 */
class InternalServerError extends APIError {
  constructor(message = 'Internal Server Error', details = null) {
    super(message, 500, details);
  }
}

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err);
  
  // Default to 500 if status code not set
  const statusCode = err.statusCode || 500;
  
  // In production, don't leak error details
  const response = {
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && {
      stack: err.stack,
      details: err.details
    })
  };
  
  res.status(statusCode).json(response);
};

module.exports = {
  APIError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
  errorHandler
};
