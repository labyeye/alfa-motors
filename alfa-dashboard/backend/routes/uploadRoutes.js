const express = require('express');
const router = express.Router();
const { uploadHandler } = require('../controllers/xozzUploadController');


router.post('/upload', uploadHandler);

module.exports = router;
