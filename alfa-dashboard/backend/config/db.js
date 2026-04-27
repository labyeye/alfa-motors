



module.exports = async function deprecatedConnectDB() {
  console.warn(
    "[config/db] Deprecated: MongoDB connect called but the project uses MySQL/Sequelize."
  );
};
