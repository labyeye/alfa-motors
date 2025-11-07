// Backward-compat shim: re-export Sequelize SellRequest model
try {
  module.exports = require('../models_sql/SellRequestSQL').SellRequest;
} catch (e) {
  module.exports = null;
  console.error('[models/SellRequest] Sequelize SellRequest model not available.');
}
