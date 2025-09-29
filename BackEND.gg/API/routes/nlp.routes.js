const express = require('express');
const router = express.Router();
const nlpController = require('../controllers/nlp.controller');

// Text analysis endpoints
router.post('/analyze', nlpController.analyzeText);
router.post('/extract-entities', nlpController.extractEntities);
router.post('/sentiment', nlpController.analyzeSentiment);

// N-gram related endpoints
router.post('/ngrams/generate', nlpController.generateNgrams);
router.get('/ngrams/:text', nlpController.getNgramsForText);

// TF-IDF related endpoints
router.post('/tfidf/calculate', nlpController.calculateTfidf);
router.get('/tfidf/top-terms', nlpController.getTopTerms);

// Naive Bayes classifier endpoints
router.post('/classify', nlpController.classifyText);
router.post('/train', nlpController.trainModel);

module.exports = router;
