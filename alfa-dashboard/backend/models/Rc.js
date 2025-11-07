// Backward-compat shim: re-export Sequelize Rc model
try {
  module.exports = require('../models_sql/RcSQL').Rc;
} catch (e) {
  module.exports = null;
  console.error('[models/Rc] Sequelize Rc model not available.');
}
