// Backward-compat shim: re-export Sequelize User model
try {
  module.exports = require('../models_sql/UserSQL').User;
} catch (e) {
  module.exports = null;
  console.error('[models/User] Sequelize User model not available.');
}
