// Backward-compat shim: re-export Sequelize Refurbishment model
try {
  module.exports = require('../models_sql/RefurbishmentSQL').Refurbishment;
} catch (e) {
  module.exports = null;
  console.error('[models/Refurbishment] Sequelize Refurbishment model not available.');
}
