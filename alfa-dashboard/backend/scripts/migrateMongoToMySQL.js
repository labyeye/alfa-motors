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

// Migration script deprecated: the Mongo -> MySQL migration was completed and the
// project now uses MySQL/Sequelize. This script is kept for reference but will
// no longer attempt to connect to MongoDB.

console.log('migrateMongoToMySQL.js is deprecated — migration already performed.');
console.log('If you need to re-run a migration, restore the original script from git history.');
process.exit(0);
