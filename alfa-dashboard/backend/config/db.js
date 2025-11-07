// Deprecated: MongoDB is no longer used in this project.
// This file is kept to avoid breaking older scripts. If you see this message
// remove references to `config/db.js` and delete this file.

module.exports = async function deprecatedConnectDB() {
  console.warn('[config/db] Deprecated: MongoDB connect called but the project uses MySQL/Sequelize.');
};
