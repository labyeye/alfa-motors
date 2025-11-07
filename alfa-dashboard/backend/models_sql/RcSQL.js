const { DataTypes } = require('sequelize');
const { sequelize, Sequelize } = require('../db');

const Rc = sequelize.define('Rc', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  carId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  holderName: { type: DataTypes.STRING, allowNull: true },
  registrationNumber: { type: DataTypes.STRING, allowNull: true },
  details: { type: DataTypes.JSON, allowNull: true },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
}, {
  tableName: 'rcs',
  timestamps: false,
});

module.exports = { Rc };
