const asyncHandler = require('express-async-handler');
const { Review } = require('../models_sql/ReviewSQL');

const createReview = asyncHandler(async (req, res) => {
  if (!Review) return res.status(500).json({ success: false, message: 'Review model not available' });
  const { name, email, message, rating } = req.body;
  if (!name || !email || !message) return res.status(400).json({ success: false, message: 'Name, email and message are required' });
  const review = await Review.create({ userName: name, comment: message, rating: rating || 5 });
  return res.status(201).json({ success: true, data: review });
});

const getReviews = asyncHandler(async (req, res) => {
  if (!Review) return res.status(500).json({ success: false, message: 'Review model not available' });
  const reviews = await Review.findAll({ order: [['createdAt', 'DESC']], limit: 20, raw: true });
  return res.json({ success: true, data: reviews });
});

module.exports = { createReview, getReviews };
