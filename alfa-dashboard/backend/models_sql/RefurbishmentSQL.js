const { DataTypes } = require('sequelize');
const { sequelize, Sequelize } = require('../db');

const Refurbishment = sequelize.define('Refurbishment', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  car: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  items: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
  notes: { type: DataTypes.TEXT, allowNull: true },
  totalCost: { type: DataTypes.DECIMAL(12,2), allowNull: true },
  createdBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
}, {
  tableName: 'refurbishments',
  timestamps: false,
});

module.exports = { Refurbishment };
