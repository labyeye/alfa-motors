// Backward-compat shim: re-export Sequelize Car model
try {
  module.exports = require('../models_sql/CarSQL').Car;
} catch (e) {
  // If models_sql is missing, export null and log a helpful message
  module.exports = null;
  console.error('[models/Car] Sequelize Car model not available. Please ensure models_sql/CarSQL.js exists.');
}
