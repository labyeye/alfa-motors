require("dotenv").config();
const { Sequelize } = require("sequelize");
const mysql2 = require("mysql2");

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_NAME = process.env.DB_NAME || "database";
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASS || "";
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

/**
 * Singleton Sequelize instance.
 *
 * Vercel serverless functions share the global scope across invocations
 * within the same warm container, so we cache the instance on `global`
 * to avoid opening a new pool on every cold-start / warm invocation.
 *
 * Shared-hosting MariaDB typically allows only 10-20 simultaneous
 * connections total, so pool.max is intentionally kept very small.
 */
if (!global.__sequelize) {
  global.__sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: "mysql",
    dialectModule: mysql2,
    logging: false,

    pool: {
      max: 2,         // stay well under shared-hosting connection limits
      min: 0,         // release all connections when idle
      acquire: 10000, // ms to wait before throwing an acquire error
      idle: 3000,     // ms a connection can sit idle before being released
      evict: 5000,    // ms interval for evicting stale idle connections
    },

    dialectOptions: {
      connectTimeout: 10000, // TCP-level connect timeout (ms)
      // Some shared hosts drop idle TCP connections -- uncomment if needed:
      // enableKeepAlive: true,
      // keepAliveInitialDelay: 3000,

      // Uncomment if your host enforces SSL:
      // ssl: { rejectUnauthorized: false },
    },

    retry: {
      max: 3, // retry failed queries up to 3 times automatically
    },
  });
}

const sequelize = global.__sequelize;

/**
 * Lazily authenticate the connection.
 * Call this at the top of any route handler that needs the DB.
 *
 * Usage in a route:
 *   const { connectDB, sequelize } = require('../db');
 *   router.get('/', async (req, res) => {
 *     await connectDB();
 *     const rows = await SomeModel.findAll();
 *     res.json(rows);
 *   });
 *
 * @returns {Promise<void>}
 */
async function connectDB() {
  try {
    await sequelize.authenticate();
  } catch (err) {
    console.error("[db] Connection failed:", err.message);
    throw err;
  }
}

module.exports = { sequelize, Sequelize, connectDB };
