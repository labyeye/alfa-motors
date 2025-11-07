
// Backward-compat shim: re-export Sequelize AdvancePayment model
try {
  module.exports = require('../models_sql/AdvancePaymentSQL').AdvancePayment;
} catch (e) {
  module.exports = null;
  console.error('[models/AdvancePayment] Sequelize AdvancePayment model not available.');
}
 

