const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

// Always use Cloudinary storage for uploads (gallery & images)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'alfa-motors/cars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 900, crop: 'limit', quality: 'auto' }],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return 'rc-' + uniqueSuffix;
    }
  }
});

// Increase file size limit to 20MB per file to allow larger uploads from clients.
// Note: platform providers (e.g. Vercel Serverless Functions) may still enforce
// a smaller overall request body limit. If you deploy to such providers, prefer
// direct client-to-Cloudinary uploads (signed/upload presets) to avoid platform limits.
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 20 // 20MB per file
  },
  fileFilter: (req, file, cb) => {
    // Accept only common image mime types
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files (jpg, png, webp) are allowed"));
  }
});

module.exports = upload;
