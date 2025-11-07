// Backward-compat shim: re-export Sequelize Gallery model
try {
  module.exports = require('../models_sql/GallerySQL').Gallery;
} catch (e) {
  module.exports = null;
  console.error('[models/Gallery] Sequelize Gallery model not available.');
}
