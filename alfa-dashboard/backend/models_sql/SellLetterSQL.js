const { DataTypes } = require('sequelize');
const { sequelize, Sequelize } = require('../db');

const SellLetter = sequelize.define('SellLetter', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  car: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  buyerName: { type: DataTypes.STRING, allowNull: true },
  saleDate: { type: DataTypes.DATE, allowNull: true },
  saleAmount: { type: DataTypes.DECIMAL(12,2), allowNull: true },
  paymentMethod: { type: DataTypes.STRING, allowNull: true },
  createdBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
}, {
  tableName: 'sell_letters',
  timestamps: false,
});

module.exports = { SellLetter };
