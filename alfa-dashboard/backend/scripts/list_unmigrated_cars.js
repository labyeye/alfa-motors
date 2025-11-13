require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../db');

(async function(){
  try {
    await sequelize.authenticate();
    console.log('[db] connected');

    const [rows] = await sequelize.query('SELECT id, photos FROM `cars`');
    const unmigrated = [];
    for (const r of rows) {
      const p = r.photos;
      const s = (typeof p === 'string') ? p : JSON.stringify(p || '');
      if (!s) continue;
      if (s.includes('cloudinary.com') || s.includes('res.cloudinary.com')) {
        unmigrated.push({ id: r.id, photos: s });
      }
    }

    console.log(`Found ${unmigrated.length} cars still referencing Cloudinary`);
    const outPath = path.join(__dirname, 'unmigrated_cars.csv');
    const csv = ['id,photos'];
    for (const row of unmigrated) {
      // escape double quotes
      const safe = '"' + row.photos.replace(/"/g, '""') + '"';
      csv.push(`${row.id},${safe}`);
    }
    fs.writeFileSync(outPath, csv.join('\n'));
    console.log('Wrote', outPath);
    // print first 20 entries
    unmigrated.slice(0,20).forEach(r => console.log('id=',r.id,'photos=', r.photos.slice(0,200)));
    process.exit(0);
  } catch (e) {
    console.error('Error listing unmigrated cars:', e);
    process.exit(1);
  }
})();
