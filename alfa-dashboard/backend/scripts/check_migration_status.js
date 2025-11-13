require('dotenv').config();
const { sequelize } = require('../db');

(async function(){
  try {
    await sequelize.authenticate();
    console.log('[db] connected');

    // galleries.filename
    const [galleries] = await sequelize.query("SELECT id, filename FROM galleries");
    const galCounts = galleries.reduce((acc, r) => {
      const v = r.filename || '';
      if (v.includes('cloudinary.com') || v.includes('res.cloudinary.com')) acc.cloud++;
      else if (v.includes('/uploads/')) acc.xozz++;
      else acc.other++;
      return acc;
    }, {cloud:0, xozz:0, other:0});

    // rcs.pdfUrl
    const [rcs] = await sequelize.query("SELECT id, pdfUrl FROM rcs");
    const rcCounts = rcs.reduce((acc, r) => {
      const v = r.pdfUrl || '';
      if (v.includes('cloudinary.com') || v.includes('res.cloudinary.com')) acc.cloud++;
      else if (v.includes('/uploads/')) acc.xozz++;
      else acc.other++;
      return acc;
    }, {cloud:0, xozz:0, other:0});

    // cars.photos (JSON or string)
    const [cars] = await sequelize.query("SELECT id, photos FROM cars");
    let carsCloud = 0, carsXozz = 0, carsOther = 0;
    for (const r of cars) {
      const p = r.photos;
      const s = (typeof p === 'string') ? p : JSON.stringify(p || '');
      if (!s) { carsOther++; continue; }
      if (s.includes('cloudinary.com') || s.includes('res.cloudinary.com')) carsCloud++;
      else if (s.includes('/uploads/')) carsXozz++;
      else carsOther++;
    }

    console.log('\nGalleries:', galCounts);
    console.log('RCs:', rcCounts);
    console.log('Cars: { cloud:', carsCloud, ', xozz:', carsXozz, ', other:', carsOther, '}');

    process.exit(0);
  } catch (e) {
    console.error('Error checking migration status:', e);
    process.exit(1);
  }
})();
