const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Clinic name is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Clinic address is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Clinic phone is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Clinic email is required'],
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  openingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Clinic', clinicSchema);
