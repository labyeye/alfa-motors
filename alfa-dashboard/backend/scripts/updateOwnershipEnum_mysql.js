/*
  Migration script to rename ownership enum value:
  - Adds new enum value '4th Owner' to the `ownership` column
  - Updates existing rows from '4th Owner or more' -> '4th Owner+'
  - Removes the old enum value from the column definition

  Usage:
    1) Backup your DB (highly recommended):
       mysqldump -u $DB_USER -p -h $DB_HOST $DB_NAME > backup.sql

    2) From the `alfa-dashboard/backend` folder run:
       node scripts/updateOwnershipEnum_mysql.js

  The script reads DB credentials from environment variables (or .env):
    DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT
*/

require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  const DB_HOST = process.env.DB_HOST || 'localhost';
  const DB_NAME = process.env.DB_NAME || 'database';
  const DB_USER = process.env.DB_USER || 'root';
  const DB_PASS = process.env.DB_PASS || '';
  const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

  const oldVal = '4th Owner +';
  const newVal = '4th Own';
  const table = 'cars';
  const column = 'ownership';

  let conn;
  try {
    conn = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASS,
      database: DB_NAME,
      port: DB_PORT,
    });

    console.log('[migration] Connected to DB', DB_HOST, DB_NAME);

    // 1) Add new enum value alongside old value (extend enum)
    console.log('[migration] Extending enum to include new value...');
    const extendSql = `ALTER TABLE \`${table}\` MODIFY \`${column}\` ENUM('1st Owner','2nd Owner','3rd Owner','${oldVal.replace("'","\\'")}','${newVal.replace("'","\\'")}') NOT NULL`;
    await conn.execute(extendSql);
    console.log('[migration] Enum extended.');

    // 2) Count rows that will be updated
    const [rowsCount] = await conn.execute(
      `SELECT COUNT(*) as cnt FROM \`${table}\` WHERE \`${column}\` = ?`,
      [oldVal]
    );
    const cnt = rowsCount[0].cnt || 0;
    console.log(`[migration] Rows with old value ('${oldVal}'):`, cnt);

    if (cnt > 0) {
      // 3) Update rows to new value
      console.log(`[migration] Updating ${cnt} rows to '${newVal}'...`);
      const [res] = await conn.execute(
        `UPDATE \`${table}\` SET \`${column}\` = ? WHERE \`${column}\` = ?`,
        [newVal, oldVal]
      );
      console.log('[migration] Update result:', res.affectedRows, 'rows affected.');
    } else {
      console.log('[migration] No rows need updating.');
    }

    // 4) Remove old enum value from column definition
    console.log('[migration] Removing old enum value from column definition...');
    const finalizeSql = `ALTER TABLE \`${table}\` MODIFY \`${column}\` ENUM('1st Owner','2nd Owner','3rd Owner','${newVal.replace("'","\\'")}') NOT NULL`;
    await conn.execute(finalizeSql);
    console.log('[migration] Old enum value removed. Migration complete.');

    // 5) Show counts for verification
    const [rowsAfter] = await conn.execute(
      `SELECT \`${column}\`, COUNT(*) as cnt FROM \`${table}\` GROUP BY \`${column}\``
    );
    console.log('[migration] Ownership value counts after migration:');
    rowsAfter.forEach(r => console.log('  ', r[column], ':', r.cnt));

  } catch (err) {
    console.error('[migration] Error:', err.message || err);
    console.error(err);
    process.exitCode = 1;
  } finally {
    if (conn) await conn.end();
  }
})();
