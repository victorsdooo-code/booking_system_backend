const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  description: {
    type: String,
    required: false,
    default: '',
    trim: true
  },
  category: {
    type: String,
    required: false,
    default: '',
    trim: true
  },
  duration: {
    type: Number,
    required: false,
    min: [5, 'Duration must be at least 5 minutes'],
    default: 30
  },
  price: {
    type: Number,
    required: false,
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  clinic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: false,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
