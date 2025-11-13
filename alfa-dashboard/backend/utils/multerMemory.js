const multer = require('multer');

// Memory storage for serverless environments (Vercel)
const storage = multer.memoryStorage();

const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    return cb(new Error('INVALID_FILE_TYPE'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

module.exports = { upload, ALLOWED_MIMES };
