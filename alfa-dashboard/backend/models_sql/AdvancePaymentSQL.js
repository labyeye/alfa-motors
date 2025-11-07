const { DataTypes } = require('sequelize');
const { sequelize, Sequelize } = require('../db');

const AdvancePayment = sequelize.define('AdvancePayment', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  sellLetterId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  amount: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  paidBy: { type: DataTypes.STRING, allowNull: true },
  paymentMethod: { type: DataTypes.STRING, allowNull: true },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
}, {
  tableName: 'advance_payments',
  timestamps: false,
});

module.exports = { AdvancePayment };
