// Backward-compat shim: re-export Sequelize SellLetter model
try {
  module.exports = require('../models_sql/SellLetterSQL').SellLetter;
} catch (e) {
  module.exports = null;
  console.error('[models/SellLetter] Sequelize SellLetter model not available.');
}
