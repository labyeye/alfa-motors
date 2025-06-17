const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: [true, 'Brand is required']
  },
  model: {
    type: String,
    required: [true, 'Model is required']
  },
  modelYear: {
    type: Number,
    min: [2000, 'Model year must be at least 2000'],
    max: [new Date().getFullYear(), `Model year cannot be in the future`],
    required: [true, 'Model year is required']
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
  fuelType: {
    type: String,
    required: [true, 'Fuel type is required'],
    enum: ['Petrol', 'EV', 'Diesel']
  },
  daysOld: {
    type: Number,
    min: [0, 'Days old cannot be negative'],
    required: [true, 'Days old is required']
  },
  price: {
    type: Number,
    min: [0, 'Price cannot be negative'],
    required: [true, 'Price is required']
  },
  downPayment: {
    type: Number,
    min: [0, 'Down payment cannot be negative'],
    required: [true, 'Down payment is required']
  },
  images: {
    type: [String],
    validate: {
      validator: function(arr) {
        return arr.length > 0;
      },
      message: 'At least one image is required'
    }
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
