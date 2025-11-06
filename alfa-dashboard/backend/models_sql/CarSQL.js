const { DataTypes } = require("sequelize");
const { sequelize, Sequelize } = require("../db");

// Sequelize model mapping for `Car` converted from Mongoose schema
const Car = sequelize.define(
  "Car",
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    make: { type: DataTypes.STRING, allowNull: false },
    model: { type: DataTypes.STRING, allowNull: false },
    variant: { type: DataTypes.STRING, allowNull: false },
    fuelType: { type: DataTypes.ENUM("Petrol", "EV", "Diesel"), allowNull: false },
    modelYear: { type: DataTypes.INTEGER, allowNull: false },
    registrationYear: { type: DataTypes.INTEGER, allowNull: false },
    color: { type: DataTypes.STRING, allowNull: false },
    chassisNo: { type: DataTypes.STRING, allowNull: false },
    engineNo: { type: DataTypes.STRING, allowNull: false },
    kmDriven: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    ownership: {
      type: DataTypes.ENUM("1st Owner", "2nd Owner", "3rd Owner", "4th Owner or more"),
      allowNull: false,
    },
    daysOld: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    buyingPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    quotingPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    sellingPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    photos: { type: DataTypes.JSON, allowNull: true },
    soldAt: { type: DataTypes.DATE, allowNull: true },
    soldCustomerName: { type: DataTypes.STRING, allowNull: true },
    soldTestimonial: { type: DataTypes.TEXT, allowNull: true },
    soldCustomerPhotos: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
    status: { type: DataTypes.ENUM("Available", "Coming Soon", "Sold Out"), allowNull: false, defaultValue: "Available" },
    addedBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
  },
  {
    tableName: "cars",
    timestamps: false,
  }
);

module.exports = { Car };
