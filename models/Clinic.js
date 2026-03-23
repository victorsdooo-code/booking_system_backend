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
    trim: true,
    lowercase: true,
    default: ''
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
  businessHours: {
    monday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    tuesday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    wednesday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    thursday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    friday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    saturday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '13:00' },
      isOpen: { type: Boolean, default: true }
    },
    sunday: {
      open: { type: String, default: '00:00' },
      close: { type: String, default: '00:00' },
      isOpen: { type: Boolean, default: false }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Clinic', clinicSchema);
