const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const upload = require('../utils/fileUpload');
const galleryController = require('../controllers/galleryController');

router.post('/', protect, upload.single('photo'), galleryController.uploadGalleryPhoto);
router.get('/', galleryController.listGallery);
router.put('/:id', protect, galleryController.updateGallery);
router.delete('/:id', protect, galleryController.deleteGallery);
router.delete('/', protect, admin, galleryController.deleteAllGallery);

module.exports = router;
