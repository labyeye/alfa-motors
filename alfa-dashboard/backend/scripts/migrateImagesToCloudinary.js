require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');
const Car = require('../models/Car');
const path = require('path');
const fs = require('fs');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Upload a single image to Cloudinary
const uploadToCloudinary = async (localPath) => {
  try {
    const result = await cloudinary.uploader.upload(localPath, {
      folder: 'alfa-motors/cars',
      transformation: [
        { width: 1200, height: 900, crop: 'limit', quality: 'auto' }
      ]
    });
    return result.secure_url;
  } catch (error) {
    console.error(`Error uploading ${localPath}:`, error.message);
    return null;
  }
};

// Main migration function
const migrateImages = async () => {
  try {
    await connectDB();

    // Get all cars from database
    const cars = await Car.find({});
    console.log(`Found ${cars.length} cars in database`);

    let totalImages = 0;
    let uploadedImages = 0;
    let failedImages = 0;
    let skippedImages = 0;

    for (const car of cars) {
      console.log(`\nProcessing car: ${car.make} ${car.model} (ID: ${car._id})`);
      
      if (!car.photos || car.photos.length === 0) {
        console.log('  No photos to migrate');
        continue;
      }

      const updatedPhotos = [];

      for (const photo of car.photos) {
        totalImages++;

        // Skip if already a Cloudinary URL
        if (photo.includes('cloudinary.com') || photo.startsWith('http')) {
          console.log(`  ✓ Already migrated: ${photo}`);
          updatedPhotos.push(photo);
          skippedImages++;
          continue;
        }

        // Construct local file path
        const localPath = path.join(__dirname, '../utils/carimages', photo.replace('carimages/', ''));

        // Check if file exists
        if (!fs.existsSync(localPath)) {
          console.log(`  ✗ File not found: ${localPath}`);
          failedImages++;
          // Keep the original path in case the file exists elsewhere
          updatedPhotos.push(photo);
          continue;
        }

        // Upload to Cloudinary
        console.log(`  ⬆ Uploading: ${photo}`);
        const cloudinaryUrl = await uploadToCloudinary(localPath);

        if (cloudinaryUrl) {
          console.log(`  ✓ Uploaded successfully: ${cloudinaryUrl}`);
          updatedPhotos.push(cloudinaryUrl);
          uploadedImages++;
        } else {
          console.log(`  ✗ Upload failed: ${photo}`);
          failedImages++;
          // Keep the original path if upload fails
          updatedPhotos.push(photo);
        }
      }

      // Update car in database with new Cloudinary URLs
      if (updatedPhotos.length > 0) {
        car.photos = updatedPhotos;
        await car.save();
        console.log(`  ✓ Database updated for car ${car._id}`);
      }

      // Handle sold car customer photos if they exist
      if (car.sold && car.sold.customerPhotos && car.sold.customerPhotos.length > 0) {
        const updatedCustomerPhotos = [];

        for (const photo of car.sold.customerPhotos) {
          totalImages++;

          // Skip if already a Cloudinary URL
          if (photo.includes('cloudinary.com') || photo.startsWith('http')) {
            updatedCustomerPhotos.push(photo);
            skippedImages++;
            continue;
          }

          const localPath = path.join(__dirname, '../utils/carimages', photo.replace('carimages/', ''));

          if (!fs.existsSync(localPath)) {
            console.log(`  ✗ Customer photo not found: ${localPath}`);
            failedImages++;
            updatedCustomerPhotos.push(photo);
            continue;
          }

          console.log(`  ⬆ Uploading customer photo: ${photo}`);
          const cloudinaryUrl = await uploadToCloudinary(localPath);

          if (cloudinaryUrl) {
            console.log(`  ✓ Customer photo uploaded: ${cloudinaryUrl}`);
            updatedCustomerPhotos.push(cloudinaryUrl);
            uploadedImages++;
          } else {
            console.log(`  ✗ Customer photo upload failed: ${photo}`);
            failedImages++;
            updatedCustomerPhotos.push(photo);
          }
        }

        car.sold.customerPhotos = updatedCustomerPhotos;
        await car.save();
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total images found:       ${totalImages}`);
    console.log(`Successfully uploaded:    ${uploadedImages}`);
    console.log(`Already migrated:         ${skippedImages}`);
    console.log(`Failed/Not found:         ${failedImages}`);
    console.log('='.repeat(60));

    console.log('\n✓ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Migration failed:', error);
    process.exit(1);
  }
};

// Run the migration
console.log('Starting image migration to Cloudinary...\n');
migrateImages();
