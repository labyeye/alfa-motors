const { DataTypes } = require("sequelize");
const { sequelize, Sequelize } = require("../db");

const Rc = sequelize.define(
  "Rc",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    carId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    holderName: { type: DataTypes.STRING, allowNull: true },
    registrationNumber: { type: DataTypes.STRING, allowNull: true },
    vehicleName: { type: DataTypes.STRING, allowNull: true },
    ownerPhone: { type: DataTypes.STRING, allowNull: true },
    applicantName: { type: DataTypes.STRING, allowNull: true },
    applicantPhone: { type: DataTypes.STRING, allowNull: true },
    work: { type: DataTypes.STRING, allowNull: true },
    dealerName: { type: DataTypes.STRING, allowNull: true },
    rtoAgentName: { type: DataTypes.STRING, allowNull: true },
    remarks: { type: DataTypes.TEXT, allowNull: true },
    pdfUrl: { type: DataTypes.STRING(1024), allowNull: true },
    pdfPublicId: { type: DataTypes.STRING(512), allowNull: true },
    rcTransferred: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    rtoFeesPaid: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    returnedToDealer: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    details: { type: DataTypes.JSON, allowNull: true },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    tableName: "rcs",
    timestamps: false,
  }
);

module.exports = { Rc };
