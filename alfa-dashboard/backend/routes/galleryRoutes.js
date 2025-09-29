const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../utils/fileUpload');
const galleryController = require('../controllers/galleryController');

// Upload a single gallery photo (requires auth)
router.post('/', protect, upload.single('photo'), galleryController.uploadGalleryPhoto);

// Public listing of gallery items
router.get('/', galleryController.listGallery);

module.exports = router;
