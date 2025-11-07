require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../db');
const { User } = require('../models_sql/UserSQL');

const createAdmin = async () => {
  try {
    // Ensure DB connection
    await sequelize.authenticate();

    // Ensure table exists in dev (no-op in prod if migrations used)
    await sequelize.sync();

    const adminExists = await User.findOne({ where: { role: 'admin' } });

    if (!adminExists) {
      const password = process.env.ADMIN_PASSWORD || 'admin123';
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      const admin = await User.create({
        name: process.env.ADMIN_NAME || 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: hashed,
        role: 'admin'
      });
      console.log('Admin user created successfully:', admin.email);
    } else {
      console.log('Admin user already exists:', adminExists.email);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();