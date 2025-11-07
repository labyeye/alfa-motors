const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Read configuration from env
const configuredDir = process.env.CAR_IMAGES_DIR;
const fallbackLocalDir = path.join(__dirname, 'carimages');
const CAR_IMAGES_URL_BASE = process.env.CAR_IMAGES_URL_BASE || 'https://alfamotorworld.com/car-images';

let CAR_IMAGES_DIR;
if (configuredDir) {
  // Try to use configured directory. In development this may not exist or be writable
  try {
    fs.mkdirSync(configuredDir, { recursive: true });
    CAR_IMAGES_DIR = configuredDir;
  } catch (err) {
    console.warn(`Warning: cannot create configured CAR_IMAGES_DIR (${configuredDir}): ${err.message}`);
    console.warn(`Falling back to local directory: ${fallbackLocalDir}`);
    if (!fs.existsSync(fallbackLocalDir)) fs.mkdirSync(fallbackLocalDir, { recursive: true });
    CAR_IMAGES_DIR = fallbackLocalDir;
  }
} else {
  if (!fs.existsSync(fallbackLocalDir)) fs.mkdirSync(fallbackLocalDir, { recursive: true });
  CAR_IMAGES_DIR = fallbackLocalDir;
}

// Inform developer which directory is used
console.log(`Using CAR_IMAGES_DIR = ${CAR_IMAGES_DIR}`);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, CAR_IMAGES_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '';
    cb(null, `car-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'), false);
};

const uploader = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024, files: 12 }
});

// Helper to set public URL fields on uploaded files so existing code that
// expects `file.path` or `file.secure_url` continues to work.
function attachPublicUrls(req) {
  const attach = (file) => {
    if (!file) return;
    // public URL for the file
    const url = `${CAR_IMAGES_URL_BASE}/${file.filename}`;
    // Keep original filesystem path in `fullpath`
    file.fullpath = file.path;
    // Overwrite `path` to be the public URL (many routes expect this in production)
    file.path = url;
    // Also provide `secure_url` (Cloudinary parity)
    file.secure_url = url;
    // And expose `publicUrl` for clarity
    file.publicUrl = url;
  };

  if (req.file) attach(req.file);
  if (req.files && Array.isArray(req.files)) req.files.forEach(attach);
}

// Export wrapper with same API surface as multer so routes can continue to use
// upload.single(...) and upload.array(...)
module.exports = {
  single: function (field) {
    return [uploader.single(field), (req, res, next) => { attachPublicUrls(req); next(); }];
  },
  array: function (field, maxCount) {
    return [uploader.array(field, maxCount), (req, res, next) => { attachPublicUrls(req); next(); }];
  },
  fields: function (fields) {
    return [uploader.fields(fields), (req, res, next) => { attachPublicUrls(req); next(); }];
  },
  // expose underlying multer in case other helpers need it
  _multer: uploader
};
