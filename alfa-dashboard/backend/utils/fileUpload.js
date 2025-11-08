const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, 'carimages');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `rc-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const fileFilter = (req, file, cb) => allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'), false);

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;