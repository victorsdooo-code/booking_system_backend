const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Doctor title is required'],
    trim: true
  },
  specialty: {
    type: String,
    required: [true, 'Doctor specialty is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  photo: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  clinic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: [true, 'Clinic association is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
