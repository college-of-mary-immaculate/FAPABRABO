/**
 * Success response formatter
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {Object} meta - Metadata (pagination, etc.)
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (res, data = null, meta = {}, statusCode = 200) => {
  const response = {
    status: 'success',
    ...(data !== null && { data }),
    ...(Object.keys(meta).length > 0 && { meta })
  };
  
  return res.status(statusCode).json(response);
};

/**
 * Error response formatter
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {*} details - Additional error details
 */
const errorResponse = (res, message, statusCode = 500, details = null) => {
  const response = {
    status: 'error',
    message,
    ...(process.env.NODE_ENV !== 'production' && details && { details })
  };
  
  return res.status(statusCode).json(response);
};

/**
 * Pagination helper
 * @param {Array} items - Array of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} Paginated result
 */
const paginate = (items, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const paginatedItems = items.slice(startIndex, endIndex);
  
  return {
    items: paginatedItems,
    currentPage: page,
    totalPages: Math.ceil(items.length / limit),
    totalItems: items.length,
    itemsPerPage: limit
  };
};

module.exports = {
  successResponse,
  errorResponse,
  paginate
};
