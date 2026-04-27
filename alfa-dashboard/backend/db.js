require("dotenv").config();
const { Sequelize } = require("sequelize");
const mysql2 = require("mysql2");

const DB_HOST = process.env.DB_HOST ;
const DB_NAME = process.env.DB_NAME ;
const DB_USER = process.env.DB_USER ;
const DB_PASS = process.env.DB_PASS ;
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;




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




if (!global.__sequelize) {
  console.log(`[db] Initialising Sequelize pool  → ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);

  global.__sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: "mysql",
    dialectModule: mysql2,
    logging: false,  

    pool: {
      max: 2,         
      min: 0,         
      acquire: 10000, 
      idle: 3000,     
      evict: 5000,    
    },

    dialectOptions: {
      connectTimeout: 10000, 
      
      
      
    },

    retry: {
      max: 3,
    },
  });

  
  try {
    attachPoolHooks(global.__sequelize.connectionManager.pool);
  } catch (e) {
    console.warn("[db] Could not attach pool hooks:", e.message);
  }
} else {
  console.log(`[db] Reusing existing Sequelize pool → ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);
}

const sequelize = global.__sequelize;




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
