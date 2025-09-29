const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');

// Search endpoints
router.get('/', searchController.basicSearch);
router.get('/advanced', searchController.advancedSearch);

// Autocomplete suggestions
router.get('/suggest', searchController.getSuggestions);

// Similar items
router.get('/similar/:id', searchController.getSimilarItems);

// Filtering
router.post('/filter', searchController.filterResults);

module.exports = router;
