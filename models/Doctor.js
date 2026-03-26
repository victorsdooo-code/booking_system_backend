const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true
  },
  title: {
    type: String,
    required: false,
    default: '',
    trim: true
  },
  specialty: {
    type: String,
    required: false,
    default: '',
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Doctor type is required'],
    enum: ['TCM', 'Physio', 'Western'],
    enumTranslate: {
      'TCM': '中醫師',
      'Physio': '物理治療師',
      'Western': '西醫'
    }
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

// Index for filtering by type
doctorSchema.index({ type: 1, isActive: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
