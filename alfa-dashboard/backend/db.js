require("dotenv").config();
const { Sequelize } = require("sequelize");
const mysql2 = require("mysql2");

const DB_HOST = process.env.DB_HOST ;
const DB_NAME = process.env.DB_NAME ;
const DB_USER = process.env.DB_USER ;
const DB_PASS = process.env.DB_PASS ;
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

// ─── Pool event logging ────────────────────────────────────────────────────────
// Attach pool-level hooks once so we can see exactly when connections are
// opened, reused, and released in Vercel logs.
function attachPoolHooks(pool) {
  if (!pool || pool.__hooksAttached) return;
  pool.__hooksAttached = true;

  pool.on("connect", () => {
    console.log(`[db:pool] New connection opened  → ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);
  });

  pool.on("acquire", () => {
    console.log(`[db:pool] Connection acquired     → ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);
  });

  pool.on("release", () => {
    console.log(`[db:pool] Connection released     → ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);
  });

  pool.on("destroy", () => {
    console.log(`[db:pool] Connection destroyed    → ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);
  });
}

// ─── Singleton ─────────────────────────────────────────────────────────────────
// Cache on global so Vercel warm containers reuse the same pool instead of
// creating a new one on every invocation.
if (!global.__sequelize) {
  console.log(`[db] Initialising Sequelize pool  → ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);

  global.__sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: "mysql",
    dialectModule: mysql2,
    logging: false,  // set to console.log temporarily if you need query-level logs

    pool: {
      max: 2,         // safe for shared-hosting connection limits
      min: 0,         // release all connections when idle
      acquire: 10000, // ms before throwing acquire error
      idle: 3000,     // ms before releasing an idle connection
      evict: 5000,    // ms interval to evict stale connections
    },

    dialectOptions: {
      connectTimeout: 10000, // TCP-level connect timeout (ms)
      // enableKeepAlive: true,
      // keepAliveInitialDelay: 3000,
      // ssl: { rejectUnauthorized: false },
    },

    retry: {
      max: 3,
    },
  });

  // Attach pool hooks after instance is created
  try {
    attachPoolHooks(global.__sequelize.connectionManager.pool);
  } catch (e) {
    console.warn("[db] Could not attach pool hooks:", e.message);
  }
} else {
  console.log(`[db] Reusing existing Sequelize pool → ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);
}

const sequelize = global.__sequelize;

// ─── connectDB ────────────────────────────────────────────────────────────────
// Call this at the start of every route handler that needs the DB.
// On a warm container with a healthy pool it resolves instantly.
async function connectDB() {
  const tag = `[db] connectDB  ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
  try {
    await sequelize.authenticate();
    console.log(`${tag}  ✓ authenticated`);
  } catch (err) {
    console.error(`${tag}  ✗ FAILED`);
    console.error(`[db] Error name    : ${err.name}`);
    console.error(`[db] Error message : ${err.message}`);
    if (err.original) {
      console.error(`[db] Original cause: ${err.original.message} (code: ${err.original.code})`);
    }
    throw err;
  }
}

module.exports = { sequelize, Sequelize, connectDB };
