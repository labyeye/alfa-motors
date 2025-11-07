const { DataTypes } = require('sequelize');
const { sequelize, Sequelize } = require('../db');

const ServiceBill = sequelize.define('ServiceBill', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  car: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  items: { type: DataTypes.JSON, allowNull: true },
  total: { type: DataTypes.DECIMAL(12,2), allowNull: true },
  createdBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
}, {
  tableName: 'service_bills',
  timestamps: false,
});

module.exports = { ServiceBill };
