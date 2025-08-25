const express = require('express');
const router = express.Router();
const { createReview } = require('../controllers/reviewController');
const { getReviews } = require('../controllers/reviewController');

// Public endpoint to submit a review
router.post('/', createReview);
router.get('/', getReviews);

module.exports = router;
