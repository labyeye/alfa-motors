require('dotenv').config();
const { sequelize } = require('../db');

(async function(){
  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query('SELECT id, photos FROM `cars` LIMIT 5');
    for (const r of rows) {
      console.log('--- id=', r.id, '---');
      const photos = r.photos;
      const arr = typeof photos === 'string' ? JSON.parse(photos) : photos;
      for (let i=0;i<arr.length;i++) {
        const item = arr[i];
        console.log(`item ${i}: raw=>` + JSON.stringify(item).slice(0,400));
        const san = (item || '').replace(/\s+/g, '');
        console.log(`item ${i}: sanitized=>` + san);
        // print first 120 char codes
        const codes = Array.from(san).slice(0,120).map(c => c.charCodeAt(0));
        console.log('codes:', codes.slice(0,50).join(' '));
      }
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
