/*
  Migration: convert Ownership labels to shortened 'Own' form.

  Steps performed by this script:
  1) Make a safe backup of your DB before running.
  2) Alter `cars`.`ownership` column to VARCHAR(50) to allow value updates.
  3) Update rows using a mapping (handles variants like '3+ Owner', '4th Owner +', etc.).
  4) Convert the column to ENUM('1st Own','2nd Own','3rd Own','4th Own').
  5) Print counts before and after for verification.

  Usage:
    cd alfa-dashboard/backend
    node scripts/updateOwnershipToOwn_mysql.js

  Environment variables used (or .env):
    DB_HOST, DB_NAME, DB_USER, DB_PASS, DB_PORT
*/

require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  const DB_HOST = process.env.DB_HOST || 'localhost';
  const DB_NAME = process.env.DB_NAME || 'database';
  const DB_USER = process.env.DB_USER || 'root';
  const DB_PASS = process.env.DB_PASS || '';
  const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

  const table = 'cars';
  const column = 'ownership';

  // Mapping of old variants -> new 'Own' labels
  const mapping = {
    '1st Owner': '1st Own',
    '2nd Owner': '2nd Own',
    '3rd Owner': '3rd Own',
    '3+ Owner': '3rd Own',
    '4th Owner': '4th Own',
    '4th Owner +': '4th Own',
    '4th Owner or more': '4th Own',
    '4th Owner +': '4th Own'
  };

  const newEnum = ['1st Own', '2nd Own', '3rd Own', '4th Own'];

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

    // Show current distinct values
    const [beforeVals] = await conn.execute(`SELECT \`${column}\`, COUNT(*) as cnt FROM \`${table}\` GROUP BY \`${column}\``);
    console.log('[migration] Ownership distinct values before:');
    beforeVals.forEach(r => console.log('  ', r[column], ':', r.cnt));

    // 1) Change column to VARCHAR temporarily (preserve NOT NULL)
    console.log('[migration] Changing column type to VARCHAR(50) to allow updates...');
    await conn.execute(`ALTER TABLE \`${table}\` MODIFY \`${column}\` VARCHAR(50) NOT NULL`);
    console.log('[migration] Column altered to VARCHAR(50).');

    // 2) Update values according to mapping
    for (const [oldVal, newVal] of Object.entries(mapping)) {
      const [countRows] = await conn.execute(
        `SELECT COUNT(*) as cnt FROM \`${table}\` WHERE \`${column}\` = ?`,
        [oldVal]
      );
      const cnt = countRows[0].cnt || 0;
      if (cnt > 0) {
        console.log(`[migration] Updating ${cnt} rows: '${oldVal}' -> '${newVal}'`);
        const [res] = await conn.execute(
          `UPDATE \`${table}\` SET \`${column}\` = ? WHERE \`${column}\` = ?`,
          [newVal, oldVal]
        );
        console.log('  affectedRows:', res.affectedRows);
      }
    }

    // 3) Also handle values that include text e.g., contains '1st' etc.
    // (Optional) If there are values like '1st Owner (verified)' we can pattern-match.
    // For now, handle entries that include '1st' -> '1st Own', etc.
    const patterns = [
      { regex: "1st", newVal: '1st Own' },
      { regex: "2nd", newVal: '2nd Own' },
      { regex: "3rd|3\\+", newVal: '3rd Own' },
      { regex: "4th", newVal: '4th Own' }
    ];

    for (const p of patterns) {
      const [rows] = await conn.execute(
        `SELECT COUNT(*) as cnt FROM \`${table}\` WHERE \`${column}\` LIKE ?`,
        ['%' + p.regex.replace('\\', '') + '%']
      );
      const cnt = rows[0].cnt || 0;
      if (cnt > 0) {
        console.log(`[migration] Pattern update: entries containing '${p.regex}' -> '${p.newVal}' (found ${cnt})`);
        await conn.execute(
          `UPDATE \`${table}\` SET \`${column}\` = ? WHERE \`${column}\` LIKE ?`,
          [p.newVal, '%' + p.regex.replace('\\', '') + '%']
        );
      }
    }

    // 4) Convert column back to ENUM with new values
    console.log('[migration] Converting column to ENUM with new values:', newEnum.join(', '));
    const enumListSql = newEnum.map(v => `'${v.replace("'","\\'")}'`).join(',');
    const alterSql = `ALTER TABLE \`${table}\` MODIFY \`${column}\` ENUM(${enumListSql}) NOT NULL`;
    await conn.execute(alterSql);
    console.log('[migration] Column converted to ENUM.');

    // 5) Show final counts
    const [afterVals] = await conn.execute(`SELECT \`${column}\`, COUNT(*) as cnt FROM \`${table}\` GROUP BY \`${column}\``);
    console.log('[migration] Ownership distinct values after:');
    afterVals.forEach(r => console.log('  ', r[column], ':', r.cnt));

    console.log('[migration] Migration complete.');

  } catch (err) {
    console.error('[migration] Error:', err.message || err);
    process.exitCode = 1;
  } finally {
    if (conn) await conn.end();
  }
})();
