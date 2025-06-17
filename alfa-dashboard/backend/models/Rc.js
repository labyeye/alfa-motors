const mongoose = require('mongoose');

const rcSchema = new mongoose.Schema({
  vehicleName: {
    type: String,
    required: true
  },
  vehicleRegNo: {
    type: String,
    required: true,
    unique: true
  },
  ownerName: {
    type: String,
    required: true
  },
  ownerPhone: {
    type: String,
    required: true
  },
  applicantName: {
    type: String,
    required: true
  },
  applicantPhone: {
    type: String,
    required: true
  },
  work: {
    type: String,
    required: true
  },
  dealerName: {
    type: String
  },
  rtoAgentName: {
    type: String
  },
  remarks: {
    type: String
  },
  status: {
    rcTransferred: {
      type: Boolean,
      default: false
    },
    rtoFeesPaid: {
      type: Boolean,
      default: false
    },
      returnedToDealer: {
      type: Boolean,
      default: false
    }
  },
  pdfUrl: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Rc', rcSchema);