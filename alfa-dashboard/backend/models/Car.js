const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  make: {
    type: String,
    required: [true, 'Make is required']
  },
  model: {
    type: String,
    required: [true, 'Model is required']
  },
  variant: {
    type: String,
    required: [true, 'Variant is required']
  },
  fuelType: {
    type: String,
    required: [true, 'Fuel type is required'],
    enum: ['Petrol', 'EV', 'Diesel']
  },
  modelYear: {
    type: Number,
    min: [2000, 'Model year must be at least 2000'],
    max: [new Date().getFullYear(), `Model year cannot be in the future`],
    required: [true, 'Model year is required']
  },
  registrationYear: {
    type: Number,
    min: [2000, 'Registration year must be at least 2000'],
    max: [new Date().getFullYear(), `Registration year cannot be in the future`],
    required: [true, 'Registration year is required']
  },
  color: {
    type: String,
    required: [true, 'Color is required']
  },
  chassisNo: {
    type: String,
    required: [true, 'Chassis No is required']
  },
  engineNo: {
    type: String,
    required: [true, 'Engine No is required']
  },
  kmDriven: {
    type: Number,
    min: [0, 'KM driven cannot be negative'],
    required: [true, 'KM driven is required']
  },
  ownership: {
    type: String,
    required: [true, 'Ownership is required'],
    enum: ['1st Owner', '2nd Owner', '3rd Owner', '4th Owner or more']
  },
  daysOld: {
    type: Number,
    min: [0, 'Days old cannot be negative'],
    required: [true, 'Days old is required']
  },
  buyingPrice: {
    type: Number,
    min: [0, 'Buying price cannot be negative'],
    required: [true, 'Buying price is required']
  },
  quotingPrice: {
    type: Number,
    min: [0, 'Quoting price cannot be negative'],
    required: [true, 'Quoting price is required']
  },
  sellingPrice: {
    type: Number,
    min: [0, 'Selling price cannot be negative'],
    required: [true, 'Selling price is required']
  },
  photos: {
    type: [String], // Store file paths of uploaded images
    validate: {
      validator: function(arr) {
        return arr.length >= 1 && arr.length <= 12;
      },
      message: 'You must upload between 1 and 12 photos.'
    }
  },
  // Sold information (optional)
  sold: {
    soldAt: { type: Date },
    customerName: { type: String },
    testimonial: { type: String },
    customerPhotos: { type: [String], default: [] }
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['Available', 'Coming Soon', 'Sold Out'],
    default: 'Available'
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Car", carSchema);
