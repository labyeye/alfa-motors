const { DataTypes } = require('sequelize');
const { sequelize, Sequelize } = require('../db');

const SellRequest = sequelize.define('SellRequest', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  customerName: { type: DataTypes.STRING, allowNull: true },
  contact: { type: DataTypes.STRING, allowNull: true },
  vehicleDetails: { type: DataTypes.JSON, allowNull: true },
  status: { type: DataTypes.STRING, allowNull: true, defaultValue: 'pending' },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
}, {
  tableName: 'sell_requests',
  timestamps: false,
});

module.exports = { SellRequest };
