// Backward-compat shim: re-export Sequelize ServiceBill model
try {
  module.exports = require('../models_sql/ServiceBillSQL').ServiceBill;
} catch (e) {
  module.exports = null;
  console.error('[models/ServiceBill] Sequelize ServiceBill model not available.');
}
