let Review;
try {
  ({ Review } = require('../models_sql/ReviewSQL'));
} catch (e) {
  Review = require("../models/Review");
}
const asyncHandler = require("express-async-handler");

const createReview = asyncHandler(async (req, res) => {
  const { name, email, message, rating } = req.body;
  if (!name || !email || !message) {
    res.status(400);
    throw new Error("Name, email and message are required");
  }
  const review = await Review.create({
    name,
    email,
    message,
    rating: rating || 5,
  });
  res.status(201).json({ success: true, data: review });
});

const getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({})
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
  res.json({ success: true, data: reviews });
});

module.exports = { createReview, getReviews };
