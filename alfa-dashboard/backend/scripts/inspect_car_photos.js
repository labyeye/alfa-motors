require('dotenv').config();
const { sequelize } = require('../db');

(async function(){
  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query('SELECT id, photos FROM `cars` LIMIT 10');
    console.log('Sample cars.photos:');
    rows.forEach(r => {
      console.log('id=', r.id, 'photos=', typeof r.photos === 'string' ? r.photos.slice(0,300) : JSON.stringify(r.photos).slice(0,300));
    });
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
