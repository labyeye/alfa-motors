const express = require('express');
const router = express.Router();
const { uploadHandler } = require('../controllers/xozzUploadController');

// POST /upload
router.post('/upload', uploadHandler);

module.exports = router;
