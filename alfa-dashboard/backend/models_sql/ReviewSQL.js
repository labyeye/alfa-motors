const { DataTypes } = require('sequelize');
const { sequelize, Sequelize } = require('../db');

const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  car: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  userName: { type: DataTypes.STRING, allowNull: true },
  rating: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5 },
  comment: { type: DataTypes.TEXT, allowNull: true },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
}, {
  tableName: 'reviews',
  timestamps: false,
});

module.exports = { Review };
