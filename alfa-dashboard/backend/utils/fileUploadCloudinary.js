const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'alfa-motors/cars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 900, crop: 'limit', quality: 'auto' }],
    public_id: (req, file) => `rc-${Date.now()}-${Math.round(Math.random() * 1e9)}`
  }
});

const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024, files: 12 } });

module.exports = upload;