const { sequelize } = require('../db');

async function fetchRowsWithCloudinary(table, urlColumn = 'image_url') {
  const sql = `SELECT * FROM \`${table}\` WHERE \`${urlColumn}\` LIKE '%cloudinary.com%' OR \`${urlColumn}\` LIKE '%res.cloudinary.com%';`;
  const [rows] = await sequelize.query(sql);
  return rows;
}

async function updateUrlById(table, idColumn, idValue, urlColumn, newUrl) {
  const sql = `UPDATE \`${table}\` SET \`${urlColumn}\` = ? WHERE \`${idColumn}\` = ?`;
  return sequelize.query(sql, { replacements: [newUrl, idValue] });
}

async function insertUrlRow(table, dataObject) {
  // dataObject should be a plain object with column: value pairs
  const cols = Object.keys(dataObject).map(c => `\`${c}\``).join(', ');
  const placeholders = Object.keys(dataObject).map(() => '?').join(', ');
  const values = Object.keys(dataObject).map(k => dataObject[k]);
  const sql = `INSERT INTO \`${table}\` (${cols}) VALUES (${placeholders})`;
  return sequelize.query(sql, { replacements: values });
}

module.exports = { fetchRowsWithCloudinary, updateUrlById, insertUrlRow };
