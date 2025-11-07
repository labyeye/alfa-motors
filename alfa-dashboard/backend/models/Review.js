// Backward-compat shim: re-export Sequelize Review model
try {
  module.exports = require('../models_sql/ReviewSQL').Review;
} catch (e) {
  module.exports = null;
  console.error('[models/Review] Sequelize Review model not available.');
}
