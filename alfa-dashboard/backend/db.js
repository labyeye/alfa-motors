require("dotenv").config();
const { Sequelize } = require("sequelize");

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_NAME = process.env.DB_NAME || "database";
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASS || "";
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

// Create Sequelize instance
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "mysql",
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  // dialectOptions: { // uncomment if your host requires SSL
  //   ssl: { rejectUnauthorized: false }
  // }
});

// optional test connection at startup
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("[db] MySQL connection has been established successfully.");
  } catch (error) {
    console.error("[db] Unable to connect to the MySQL database:", error);
  }
}
testConnection();

module.exports = { sequelize, Sequelize };
