// Database connection
const { connectDB, closeDB, getDB } = require('./db');

// Models
const Clinic = require('./Clinic');
const Doctor = require('./Doctor');
const Service = require('./Service');
const DoctorService = require('./DoctorService');
const DoctorType = require('./DoctorType');
const Schedule = require('./Schedule');
const Appointment = require('./Appointment');
const SystemConfig = require('./SystemConfig');

module.exports = {
  connectDB,
  closeDB,
  getDB,
  Clinic,
  Doctor,
  Service,
  DoctorService,
  DoctorType,
  Schedule,
  Appointment,
  SystemConfig
};
