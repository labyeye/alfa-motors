const mongoose = require('mongoose');

const RefurbishmentSchema = new mongoose.Schema({
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  items: [
    {
      description: { type: String, required: true },
      quantity: { type: Number, required: true, default: 1 },
      rate: { type: Number, required: true },
      amount: { type: Number, required: true }
    }
  ],
  totalCost: { type: Number, required: true },
  notes: { type: String },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Pre-validate calculate totals so required fields are populated before validation
RefurbishmentSchema.pre('validate', function(next) {
  if (this.items && Array.isArray(this.items)) {
    this.items = this.items.map(it => ({
      description: it.description,
      quantity: Number(it.quantity) || 0,
      rate: Number(it.rate) || 0,
      amount: (Number(it.quantity) || 0) * (Number(it.rate) || 0)
    }));
    this.totalCost = this.items.reduce((s, it) => s + (it.amount || 0), 0);
  } else {
    this.totalCost = 0;
  }
  next();
});

module.exports = mongoose.model('Refurbishment', RefurbishmentSchema);
