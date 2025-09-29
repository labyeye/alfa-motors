const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const upload = require('../utils/fileUpload');
const galleryController = require('../controllers/galleryController');

// Upload a single gallery photo (requires auth)
router.post('/', protect, upload.single('photo'), galleryController.uploadGalleryPhoto);

// Public listing of gallery items
router.get('/', galleryController.listGallery);

// Update gallery item (caption/testimonial)
router.put('/:id', protect, galleryController.updateGallery);

// Delete gallery item
router.delete('/:id', protect, galleryController.deleteGallery);

// Delete ALL gallery items (admin only)
router.delete('/', protect, admin, galleryController.deleteAllGallery);

module.exports = router;
