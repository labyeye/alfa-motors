const multer = require('multer');
const path = require('path');
const fs = require('fs');

const configuredDir = process.env.CAR_IMAGES_DIR;
const fallbackLocalDir = path.join(__dirname, 'carimages');
const CAR_IMAGES_URL_BASE = process.env.CAR_IMAGES_URL_BASE || 'https://alfamotorworld.com/car-images';

let CAR_IMAGES_DIR;
if (configuredDir) {
  try { fs.mkdirSync(configuredDir, { recursive: true }); CAR_IMAGES_DIR = configuredDir; }
  catch (err) { if (!fs.existsSync(fallbackLocalDir)) fs.mkdirSync(fallbackLocalDir, { recursive: true }); CAR_IMAGES_DIR = fallbackLocalDir; }
} else {
  if (!fs.existsSync(fallbackLocalDir)) fs.mkdirSync(fallbackLocalDir, { recursive: true });
  CAR_IMAGES_DIR = fallbackLocalDir;
}

console.log(`Using CAR_IMAGES_DIR = ${CAR_IMAGES_DIR}`);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, CAR_IMAGES_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '';
    cb(null, `car-${uniqueSuffix}${ext}`);
  }
});

const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const fileFilter = (req, file, cb) => allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'), false);

const uploader = multer({ storage, fileFilter, limits: { fileSize: 25 * 1024 * 1024, files: 12 } });

function attachPublicUrls(req) {
  const attach = (file) => {
    if (!file) return;
    const url = `${CAR_IMAGES_URL_BASE}/${file.filename}`;
    file.fullpath = file.path;
    file.path = url;
    file.secure_url = url;
    file.publicUrl = url;
  };
  if (req.file) attach(req.file);
  if (req.files && Array.isArray(req.files)) req.files.forEach(attach);
}

module.exports = {
  single: (field) => [uploader.single(field), (req, res, next) => { attachPublicUrls(req); next(); }],
  array: (field, maxCount) => [uploader.array(field, maxCount), (req, res, next) => { attachPublicUrls(req); next(); }],
  fields: (fields) => [uploader.fields(fields), (req, res, next) => { attachPublicUrls(req); next(); }],
  _multer: uploader
};
