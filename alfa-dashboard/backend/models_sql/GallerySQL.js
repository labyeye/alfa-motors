const { DataTypes } = require('sequelize');
const { sequelize, Sequelize } = require('../db');

const Gallery = sequelize.define('Gallery', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  car: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  filename: { type: DataTypes.STRING, allowNull: false },
  caption: { type: DataTypes.STRING, allowNull: true },
  testimonial: { type: DataTypes.TEXT, allowNull: true },
  uploadedBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
}, {
  tableName: 'galleries',
  timestamps: false,
});

module.exports = { Gallery };
