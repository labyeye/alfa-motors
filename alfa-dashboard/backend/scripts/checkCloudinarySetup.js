require('dotenv').config();
const cloudinary = require('../config/cloudinary');
const { Car } = require('../models_sql/CarSQL');
const { sequelize } = require('../db');
const path = require('path');
const fs = require('fs');

console.log('🔍 Checking Cloudinary setup...\n');

// Check environment variables
console.log('1. Environment Variables:');
console.log('   ✓ CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✓ Set' : '✗ Missing');
console.log('   ✓ CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Missing');
console.log('   ✓ CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Missing');
console.log('   ✓ MONGO_URI:', process.env.MONGO_URI ? '✓ Set' : '✗ Missing');

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.log('\n❌ Cloudinary credentials are missing!');
  console.log('Please add them to your .env file:');
  console.log('   CLOUDINARY_CLOUD_NAME=your_cloud_name');
  console.log('   CLOUDINARY_API_KEY=your_api_key');
  console.log('   CLOUDINARY_API_SECRET=your_api_secret');
  process.exit(1);
}

// Test Cloudinary connection
console.log('\n2. Testing Cloudinary Connection...');
cloudinary.api.ping()
  .then(async () => {
    console.log('   ✓ Cloudinary connection successful!');
    
    // Connect to MongoDB
  console.log('\n3. Testing DB connection (MySQL/Sequelize)...');
  await sequelize.authenticate();
  console.log('   ✓ MySQL (Sequelize) connected successfully');

  // Check cars and images
  const cars = await Car.findAll({ raw: true });
    console.log(`\n4. Database Analysis:`);
    console.log(`   Total cars: ${cars.length}`);
    
    let totalImages = 0;
    let localImages = 0;
    let cloudImages = 0;
    let missingImages = 0;
    
    const carImagesDir = path.join(__dirname, '../utils/carimages');
    
    for (const car of cars) {
      if (car.photos && car.photos.length > 0) {
        for (const photo of car.photos) {
          totalImages++;
          
          if (photo.includes('cloudinary.com') || photo.startsWith('http')) {
            cloudImages++;
          } else {
            localImages++;
            const localPath = path.join(carImagesDir, photo.replace('carimages/', ''));
            if (!fs.existsSync(localPath)) {
              missingImages++;
            }
          }
        }
      }
      
      // Check sold customer photos
      if (car.sold && car.sold.customerPhotos) {
        for (const photo of car.sold.customerPhotos) {
          totalImages++;
          if (photo.includes('cloudinary.com') || photo.startsWith('http')) {
            cloudImages++;
          } else {
            localImages++;
            const localPath = path.join(carImagesDir, photo.replace('carimages/', ''));
            if (!fs.existsSync(localPath)) {
              missingImages++;
            }
          }
        }
      }
    }
    
    console.log(`   Total images: ${totalImages}`);
    console.log(`   Local images: ${localImages}`);
    console.log(`   Cloud images: ${cloudImages}`);
    console.log(`   Missing files: ${missingImages}`);
    
    console.log('\n' + '='.repeat(60));
    if (localImages > 0) {
      console.log('✅ Setup is correct! You can run the migration script.');
      console.log(`\n   ${localImages} images ready to migrate to Cloudinary.`);
      console.log('\n   Run: node scripts/migrateImagesToCloudinary.js');
    } else if (cloudImages > 0) {
      console.log('✅ All images are already on Cloudinary!');
    } else {
      console.log('⚠️  No images found in database.');
    }
    
    if (missingImages > 0) {
      console.log(`\n⚠️  Warning: ${missingImages} image(s) referenced in database but files not found.`);
    }
    console.log('='.repeat(60));
    
    process.exit(0);
  })
  .catch((error) => {
    console.log('   ✗ Cloudinary connection failed!');
    console.log('   Error:', error.message);
    console.log('\n   Please check your credentials in .env file');
    process.exit(1);
  });
