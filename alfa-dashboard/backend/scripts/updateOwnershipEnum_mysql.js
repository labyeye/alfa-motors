
















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

    
    console.log('[migration] Extending enum to include new value...');
    const extendSql = `ALTER TABLE \`${table}\` MODIFY \`${column}\` ENUM('1st Owner','2nd Owner','3rd Owner','${oldVal.replace("'","\\'")}','${newVal.replace("'","\\'")}') NOT NULL`;
    await conn.execute(extendSql);
    console.log('[migration] Enum extended.');

    
    const [rowsCount] = await conn.execute(
      `SELECT COUNT(*) as cnt FROM \`${table}\` WHERE \`${column}\` = ?`,
      [oldVal]
    );
    const cnt = rowsCount[0].cnt || 0;
    console.log(`[migration] Rows with old value ('${oldVal}'):`, cnt);

    if (cnt > 0) {
      
      console.log(`[migration] Updating ${cnt} rows to '${newVal}'...`);
      const [res] = await conn.execute(
        `UPDATE \`${table}\` SET \`${column}\` = ? WHERE \`${column}\` = ?`,
        [newVal, oldVal]
      );
      console.log('[migration] Update result:', res.affectedRows, 'rows affected.');
    } else {
      console.log('[migration] No rows need updating.');
    }

    
    console.log('[migration] Removing old enum value from column definition...');
    const finalizeSql = `ALTER TABLE \`${table}\` MODIFY \`${column}\` ENUM('1st Owner','2nd Owner','3rd Owner','${newVal.replace("'","\\'")}') NOT NULL`;
    await conn.execute(finalizeSql);
    console.log('[migration] Old enum value removed. Migration complete.');

    
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
