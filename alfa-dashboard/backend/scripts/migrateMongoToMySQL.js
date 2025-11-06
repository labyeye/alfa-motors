/*
 Migration script: migrateMongoToMySQL.js

 Usage:
 - Create a `.env` in the backend folder containing MONGO_URI and DB_* vars (or set env vars)
 - Optionally set DRY_RUN=true to only print counts without inserting into MySQL
 - Optionally set SYNC=true to run `sequelize.sync({ alter: true })` before inserting (development only)

 Example:
   DRY_RUN=true node scripts/migrateMongoToMySQL.js

 This script reads Users then Cars from MongoDB and inserts them into MySQL using Sequelize models.
*/

require("dotenv").config();
const connectMongo = require("../config/db");
const mongoose = require("mongoose");

const { sequelize } = require("../db");
const UserMongo = require("../models/User");
const CarMongo = require("../models/Car");
const { User: UserSQL } = require("../models_sql/UserSQL");
const { Car: CarSQL } = require("../models_sql/CarSQL");

const DRY_RUN = String(process.env.DRY_RUN || "false").toLowerCase() === "true";
const DO_SYNC = String(process.env.SYNC || "false").toLowerCase() === "true";
const BATCH_SIZE = Number(process.env.BATCH_SIZE || 200);

async function retryAuthenticate(attempts = 3, delayMs = 1000) {
  for (let i = 1; i <= attempts; i++) {
    try {
      await sequelize.authenticate();
      console.log("MySQL connection OK");
      return;
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      if (i === attempts) {
        console.error("MySQL connection failed after retries:", msg);
        throw err;
      }
      console.warn(`MySQL connect attempt ${i} failed: ${msg}. Retrying in ${delayMs}ms...`);
      await new Promise((r) => setTimeout(r, delayMs));
      delayMs *= 2;
    }
  }
}

async function upsertUser(u) {
  // Upsert by unique email
  const email = (u.email || "").toLowerCase();
  if (!email) return null;
  const values = {
    name: u.name,
    email: email,
    password: u.password, // preserve hashed
    role: u.role || "staff",
    status: u.status || "active",
    createdAt: u.createdAt || new Date(),
  };
  const existing = await UserSQL.findOne({ where: { email } });
  if (existing) {
    await existing.update(values);
    return existing.id;
  }
  const created = await UserSQL.create(values);
  return created.id;
}

async function migrateUsers() {
  console.log("Reading users from MongoDB...");
  const users = await UserMongo.find().lean();
  console.log(`Found ${users.length} users`);
  const map = {};
  if (DRY_RUN) {
    users.forEach((u) => {
      map[u._id.toString()] = null;
    });
    return map;
  }

  // process in batches
  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);
    console.log(`Migrating users ${i + 1}-${i + batch.length}...`);
    for (const u of batch) {
      try {
        const newId = await upsertUser(u);
        map[u._id.toString()] = newId;
      } catch (err) {
        console.error("Failed to upsert user", u.email || u._id, err && err.message ? err.message : err);
      }
    }
  }
  return map;
}

async function upsertCar(c, userMap, t) {
  // Identify car by chassisNo if available, else engineNo, else null
  const chassis = c.chassisNo || null;
  const engine = c.engineNo || null;
  const where = chassis ? { chassisNo: chassis } : engine ? { engineNo: engine } : null;
  const payload = {
    make: c.make,
    model: c.model,
    variant: c.variant,
    fuelType: c.fuelType,
    modelYear: c.modelYear,
    registrationYear: c.registrationYear,
    color: c.color,
    chassisNo: chassis,
    engineNo: engine,
    kmDriven: c.kmDriven,
    ownership: c.ownership,
    daysOld: c.daysOld,
    buyingPrice: c.buyingPrice,
    quotingPrice: c.quotingPrice,
    sellingPrice: c.sellingPrice,
    photos: c.photos || [],
    soldAt: c.sold && c.sold.soldAt ? c.sold.soldAt : null,
    soldCustomerName: c.sold && c.sold.customerName ? c.sold.customerName : null,
    soldTestimonial: c.sold && c.sold.testimonial ? c.sold.testimonial : null,
    soldCustomerPhotos: c.sold && c.sold.customerPhotos ? c.sold.customerPhotos : [],
    status: c.status,
    addedBy: c.addedBy ? (userMap[c.addedBy.toString()] || null) : null,
    createdAt: c.createdAt || new Date(),
  };

  if (!where) {
    // no unique key, just create a new row
    const created = await CarSQL.create(payload, { transaction: t });
    return { action: "created", id: created.id };
  }

  const existing = await CarSQL.findOne({ where, transaction: t });
  if (existing) {
    await existing.update(payload, { transaction: t });
    return { action: "updated", id: existing.id };
  }
  const created = await CarSQL.create(payload, { transaction: t });
  return { action: "created", id: created.id };
}

async function migrateCars(userMap) {
  console.log("Reading cars from MongoDB...");
  const cars = await CarMongo.find().lean();
  console.log(`Found ${cars.length} cars`);
  let success = 0;
  let failed = 0;
  if (DRY_RUN) {
    console.log("DRY_RUN: skipping inserts. Migration would process", cars.length, "cars.");
    return { success: cars.length, failed: 0 };
  }

  for (let i = 0; i < cars.length; i += BATCH_SIZE) {
    const batch = cars.slice(i, i + BATCH_SIZE);
    console.log(`Processing cars ${i + 1}-${i + batch.length}...`);
    // Use a transaction per batch for safety
    const t = await sequelize.transaction();
    try {
      for (const c of batch) {
        try {
          const res = await upsertCar(c, userMap, t);
          success++;
        } catch (err) {
          failed++;
          console.error("Failed to upsert car", c._id, err && err.message ? err.message : err);
        }
      }
      await t.commit();
    } catch (err) {
      await t.rollback();
      console.error("Batch failed and rolled back:", err && err.message ? err.message : err);
      // count all in batch as failed
      failed += batch.length;
    }
  }
  return { success, failed };
}

async function main() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not set in environment. Aborting.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await connectMongo();

  console.log("Connecting to MySQL (Sequelize)...");
  try {
    await retryAuthenticate(4, 1000);
  } catch (err) {
    // Provide actionable guidance
    console.error();
    console.error("Access to MySQL failed. Common reasons:");
    console.error(" - Remote access is disabled for the DB user (allowlist your IP in the provider panel)");
    console.error(" - Incorrect DB_USER/DB_PASS or DB_NAME");
    console.error(" - Provider requires a different hostname, port, or SSL options");
    console.error("If you're using xozz.in, ask support to allow remote connections from your IP and ensure the user has privileges.");
    process.exit(1);
  }

  if (DO_SYNC) {
    console.log("Running sequelize.sync({ alter: true }) -- DEV ONLY");
    try {
      await sequelize.sync({ alter: true });
      console.log("Sync complete");
    } catch (err) {
      console.error("Sync failed:", err && err.message ? err.message : err);
      process.exit(1);
    }
  }

  const userMap = await migrateUsers();
  const { success, failed } = await migrateCars(userMap);

  console.log(`Migration complete. Cars success=${success}, failed=${failed}, usersMigrated=${Object.keys(userMap).length}`);

  // Close connections
  await mongoose.disconnect();
  await sequelize.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err && err.message ? err.message : err);
  process.exit(1);
});
