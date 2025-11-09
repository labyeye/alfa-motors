const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    resource_type: 'raw',
    folder: 'alfa-motors/rcs',
    // allow only pdfs; multer-storage-cloudinary will upload as raw
    allowed_formats: ['pdf'],
    public_id: (req, file) => `rc-pdf-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
  },
});

const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });

module.exports = upload;
