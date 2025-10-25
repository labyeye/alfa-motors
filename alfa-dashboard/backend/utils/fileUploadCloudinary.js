const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

// Check if we're in production (Vercel) or development
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

let upload;

if (isProduction) {
  // Use Cloudinary for production (Vercel)
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

  upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5 // 5MB per file
    }
  });
} else {
  // Use local storage for development
  const uploadDir = path.join(__dirname, './carimages');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'rc-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'), false);
    }
  };

  upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 1024 * 1024 * 5 // 5MB per file
    }
  });
}

module.exports = upload;
