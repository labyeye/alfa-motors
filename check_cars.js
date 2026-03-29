require('dotenv').config({ path: './alfa-dashboard/backend/.env' });
const { Car } = require('./alfa-dashboard/backend/models_sql/CarSQL');
const { sequelize } = require('./alfa-dashboard/backend/db');

async function checkCars() {
  try {
    await sequelize.authenticate();
    const cars = await Car.findAll();
    const stats = {
      total: cars.length,
      available: cars.filter(c => c.status === 'Available').length,
      soldOut: cars.filter(c => c.status === 'Sold Out').length,
      comingSoon: cars.filter(c => c.status === 'Coming Soon').length,
      statuses: [...new Set(cars.map(c => c.status))]
    };
    console.log('Car Stats:', JSON.stringify(stats, null, 2));
    console.log('Sample Car Photos:', cars[0] ? JSON.stringify(cars[0].photos, null, 2) : 'No cars');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCars();
