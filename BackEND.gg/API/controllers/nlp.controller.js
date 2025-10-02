const nlpService = require('../services/nlp.service');
const { APIError } = require('../utils/errors');

/**
 * Analyze text using various NLP techniques
 * @route POST /nlp/analyze
 */
const analyzeText = async (req, res, next) => {
  try {
    const { text, options = {} } = req.body;
    
    if (!text) {
      throw new APIError('Text is required for analysis', 400);
    }

    const analysis = await nlpService.analyzeText(text, options);
    
    res.json({
      status: 'success',
      data: analysis,
      meta: {
        textLength: text.length,
        analysisTypes: Object.keys(options).filter(k => options[k])
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Extract named entities from text
 * @route POST /nlp/extract-entities
 */
const extractEntities = async (req, res, next) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      throw new APIError('Text is required for entity extraction', 400);
    }

    const entities = await nlpService.extractEntities(text);
    
    res.json({
      status: 'success',
      data: entities,
      meta: { textLength: text.length }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Analyze sentiment of the provided text
 * @route POST /nlp/sentiment
 */
const analyzeSentiment = async (req, res, next) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      throw new APIError('Text is required for sentiment analysis', 400);
    }

    const sentiment = await nlpService.analyzeSentiment(text);
    
    res.json({
      status: 'success',
      data: sentiment,
      meta: { textLength: text.length }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate n-grams from text
 * @route POST /nlp/ngrams/generate
 */
const generateNgrams = async (req, res, next) => {
  try {
    const { text, n = 2 } = req.body;
    
    if (!text) {
      throw new APIError('Text is required for n-gram generation', 400);
    }

    const ngrams = await nlpService.generateNgrams(text, parseInt(n));
    
    res.json({
      status: 'success',
      data: ngrams,
      meta: { n: parseInt(n), textLength: text.length }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get n-grams for a specific text
 * @route GET /nlp/ngrams/:text
 */
const getNgramsForText = async (req, res, next) => {
  try {
    const { text } = req.params;
    const { n = 2 } = req.query;
    
    if (!text) {
      throw new APIError('Text parameter is required', 400);
    }

    const ngrams = await nlpService.getNgramsForText(text, parseInt(n));
    
    res.json({
      status: 'success',
      data: ngrams,
      meta: { n: parseInt(n), textLength: text.length }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate TF-IDF for terms in a document collection
 * @route POST /nlp/tfidf/calculate
 */
const calculateTfidf = async (req, res, next) => {
  try {
    const { documents } = req.body;
    
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      throw new APIError('Documents array is required', 400);
    }

    const tfidf = await nlpService.calculateTfidf(documents);
    
    res.json({
      status: 'success',
      data: tfidf,
      meta: { documentCount: documents.length }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get top terms by TF-IDF score
 * @route GET /nlp/tfidf/top-terms
 */
const getTopTerms = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    
    const topTerms = await nlpService.getTopTerms(parseInt(limit));
    
    res.json({
      status: 'success',
      data: topTerms,
      meta: { limit: parseInt(limit) }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Classify text using Naive Bayes
 * @route POST /nlp/classify
 */
const classifyText = async (req, res, next) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      throw new APIError('Text is required for classification', 400);
    }

    const classification = await nlpService.classifyText(text);
    
    res.json({
      status: 'success',
      data: classification,
      meta: { textLength: text.length }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Train the Naive Bayes model
 * @route POST /nlp/train
 */
const trainModel = async (req, res, next) => {
  try {
    const { trainingData } = req.body;
    
    if (!trainingData || !Array.isArray(trainingData) || trainingData.length === 0) {
      throw new APIError('Training data array is required', 400);
    }

    const result = await nlpService.trainModel(trainingData);
    
    res.json({
      status: 'success',
      data: result,
      meta: { trainingSamples: trainingData.length }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeText,
  extractEntities,
  analyzeSentiment,
  generateNgrams,
  getNgramsForText,
  calculateTfidf,
  getTopTerms,
  classifyText,
  trainModel
};
