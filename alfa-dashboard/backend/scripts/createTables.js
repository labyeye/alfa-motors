#!/usr/bin/env node
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const { sequelize } = require('../db');

async function main() {
  console.log('Checking database connection...');
  try {
    await sequelize.authenticate();
    console.log('[db] MySQL connection OK');
  } catch (e) {
    console.error('Failed to connect to DB:', e.message || e);
    process.exit(1);
  }

  const qi = sequelize.getQueryInterface();
  let existing = [];
  try {
    existing = await qi.showAllTables();
    // normalize format (sequelize may return objects in some dialects)
    if (Array.isArray(existing)) {
      existing = existing.map((t) => (typeof t === 'string' ? t : (t.tableName || t.name || JSON.stringify(t))));
    }
  } catch (e) {
    console.error('Could not fetch existing tables:', e.message || e);
  }

  console.log('Existing tables in DB:', existing.join(', ') || '(none)');

  // Load model definitions so Sequelize knows about them
  const modelsDir = path.join(__dirname, '../models_sql');
  if (!fs.existsSync(modelsDir)) {
    console.error('Models directory not found:', modelsDir);
    process.exit(1);
  }

  const modelFiles = fs.readdirSync(modelsDir).filter((f) => f.endsWith('.js'));
  console.log('Found model definitions:', modelFiles.join(', '));
  modelFiles.forEach((f) => {
    try {
      require(path.join(modelsDir, f));
    } catch (e) {
      console.error('Error loading model', f, e.message || e);
    }
  });

  const apply = process.argv.includes('--apply') || process.env.APPLY === 'true';
  if (!apply) {
    console.log('\nDry run: no schema changes will be made.');
    console.log("To create/alter missing tables run: node scripts/createTables.js --apply");
    process.exit(0);
  }

  console.log('\nApplying schema changes (sequelize.sync({ alter: true })) — this may modify your database.');
  try {
    await sequelize.sync({ alter: true });
    console.log('Schema sync complete.');
    const updated = await qi.showAllTables();
    console.log('Tables now present:', (Array.isArray(updated) ? updated.join(', ') : updated));
  } catch (e) {
    console.error('Schema sync failed:', e.message || e);
    process.exit(1);
  }
}

main();
