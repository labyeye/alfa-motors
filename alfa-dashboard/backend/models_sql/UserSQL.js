const { DataTypes } = require("sequelize");
const { sequelize, Sequelize } = require("../db");

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM("admin", "staff"), allowNull: false, defaultValue: "staff" },
    status: { type: DataTypes.ENUM("active", "inactive"), allowNull: false, defaultValue: "active" },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);

module.exports = { User };
