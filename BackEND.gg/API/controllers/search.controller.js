const searchService = require('../services/search.service');
const { APIError } = require('../utils/errors');

/**
 * Basic search functionality
 * @route GET /search
 * @query {string} q - Search query
 * @query {number} [page=1] - Page number for pagination
 * @query {number} [limit=10] - Number of results per page
 */
const basicSearch = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      throw new APIError('Search query is required', 400);
    }

    const results = await searchService.basicSearch({
      query: q,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      status: 'success',
      data: results,
      meta: {
        query: q,
        page: parseInt(page),
        limit: parseInt(limit),
        total: results.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Advanced search with filters
 * @route GET /search/advanced
 */
const advancedSearch = async (req, res, next) => {
  try {
    const { q, filters, sort, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      throw new APIError('Search query is required', 400);
    }

    const results = await searchService.advancedSearch({
      query: q,
      filters: filters ? JSON.parse(filters) : {},
      sort: sort || 'relevance',
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      status: 'success',
      data: results,
      meta: {
        query: q,
        filters: filters ? JSON.parse(filters) : {},
        sort,
        page: parseInt(page),
        limit: parseInt(limit),
        total: results.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get search suggestions
 * @route GET /search/suggest
 * @query {string} q - Partial search query
 */
const getSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.json({
        status: 'success',
        data: [],
        meta: { query: q }
      });
    }

    const suggestions = await searchService.getSuggestions(q);
    
    res.json({
      status: 'success',
      data: suggestions,
      meta: { query: q }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Find similar items
 * @route GET /search/similar/:id
 * @param {string} id - Item ID to find similar items for
 */
const getSimilarItems = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 5 } = req.query;

    const similarItems = await searchService.findSimilarItems({
      itemId: id,
      limit: parseInt(limit)
    });

    res.json({
      status: 'success',
      data: similarItems,
      meta: { itemId: id, limit: parseInt(limit) }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Filter search results
 * @route POST /search/filter
 */
const filterResults = async (req, res, next) => {
  try {
    const { query, filters, sort, page = 1, limit = 10 } = req.body;

    const results = await searchService.filterResults({
      query,
      filters: filters || {},
      sort: sort || 'relevance',
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      status: 'success',
      data: results,
      meta: {
        query,
        filters,
        sort,
        page: parseInt(page),
        limit: parseInt(limit),
        total: results.length
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  basicSearch,
  advancedSearch,
  getSuggestions,
  getSimilarItems,
  filterResults
};
