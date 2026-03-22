const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');

const {
  Clinic,
  Doctor,
  Service,
  DoctorService,
  Schedule,
  Appointment
} = require('../models');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ============================================
// CLINIC ENDPOINTS (4 endpoints)
// ============================================

// GET /api/admin/clinics - Get all clinics
router.get('/clinics', async (req, res) => {
  try {
    const clinics = await Clinic.find().sort({ createdAt: -1 });
    res.json({ success: true, data: clinics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/clinics/:id - Get clinic by ID
router.get('/clinics/:id', async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) {
      return res.status(404).json({ success: false, error: 'Clinic not found' });
    }
    res.json({ success: true, data: clinic });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/clinics - Create clinic
router.post('/clinics', [
  body('name').notEmpty().trim(),
  body('address').notEmpty().trim(),
  body('phone').notEmpty().trim(),
  body('email').isEmail().normalizeEmail()
], validate, async (req, res) => {
  try {
    const clinic = new Clinic(req.body);
    await clinic.save();
    res.status(201).json({ success: true, data: clinic });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/clinics/:id - Update clinic
router.put('/clinics/:id', async (req, res) => {
  try {
    const clinic = await Clinic.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!clinic) {
      return res.status(404).json({ success: false, error: 'Clinic not found' });
    }
    res.json({ success: true, data: clinic });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============================================
// DOCTOR ENDPOINTS (4 endpoints)
// ============================================

// GET /api/admin/doctors - Get all doctors
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('clinic', 'name address')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/doctors/:id - Get doctor by ID
router.get('/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('clinic', 'name address');
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/doctors - Create doctor
router.post('/doctors', [
  body('name').notEmpty().trim(),
  body('title').notEmpty().trim(),
  body('specialty').notEmpty().trim(),
  body('clinic').isMongoId()
], validate, async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/doctors/:id - Update doctor
router.put('/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('clinic', 'name address');
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============================================
// SERVICE ENDPOINTS (4 endpoints)
// ============================================

// GET /api/admin/services - Get all services
router.get('/services', async (req, res) => {
  try {
    const services = await Service.find()
      .populate('clinic', 'name')
      .sort({ category: 1, name: 1 });
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/services/:id - Get service by ID
router.get('/services/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('clinic', 'name');
    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }
    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/services - Create service
router.post('/services', [
  body('name').notEmpty().trim(),
  body('description').notEmpty().trim(),
  body('category').notEmpty().trim(),
  body('duration').isInt({ min: 5 }),
  body('price').isFloat({ min: 0 }),
  body('clinic').isMongoId()
], validate, async (req, res) => {
  try {
    const service = new Service(req.body);
    await service.save();
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/services/:id - Update service
router.put('/services/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('clinic', 'name');
    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }
    res.json({ success: true, data: service });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============================================
// DOCTOR-SERVICE ENDPOINTS (4 endpoints)
// ============================================

// GET /api/admin/doctor-services - Get all doctor-service mappings
router.get('/doctor-services', async (req, res) => {
  try {
    const doctorServices = await DoctorService.find()
      .populate('doctor', 'name specialty')
      .populate('service', 'name category')
      .populate('clinic', 'name');
    res.json({ success: true, data: doctorServices });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/doctor-services - Create doctor-service mapping
router.post('/doctor-services', [
  body('doctor').isMongoId(),
  body('service').isMongoId(),
  body('clinic').isMongoId()
], validate, async (req, res) => {
  try {
    const doctorService = new DoctorService(req.body);
    await doctorService.save();
    res.status(201).json({ success: true, data: doctorService });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'This doctor-service combination already exists' });
    }
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/admin/doctor-services/:id - Delete doctor-service mapping
router.delete('/doctor-services/:id', async (req, res) => {
  try {
    const doctorService = await DoctorService.findByIdAndDelete(req.params.id);
    if (!doctorService) {
      return res.status(404).json({ success: false, error: 'Mapping not found' });
    }
    res.json({ success: true, message: 'Mapping deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/doctors/:id/services - Get services for a specific doctor
router.get('/doctors/:id/services', async (req, res) => {
  try {
    const doctorServices = await DoctorService.find({ doctor: req.params.id })
      .populate('service', 'name category duration price')
      .populate('clinic', 'name');
    res.json({ success: true, data: doctorServices });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// SCHEDULE ENDPOINTS (4 endpoints)
// ============================================

// GET /api/admin/schedules - Get all schedules
router.get('/schedules', async (req, res) => {
  try {
    const { doctor, date, clinic } = req.query;
    const filter = {};
    
    if (doctor) filter.doctor = doctor;
    if (date) filter.date = new Date(date);
    if (clinic) filter.clinic = clinic;
    
    const schedules = await Schedule.find(filter)
      .populate('doctor', 'name specialty')
      .populate('clinic', 'name')
      .sort({ date: 1, startTime: 1 });
    res.json({ success: true, data: schedules });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/schedules/:id - Get schedule by ID
router.get('/schedules/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('doctor', 'name specialty')
      .populate('clinic', 'name');
    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Schedule not found' });
    }
    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/schedules - Create schedule
router.post('/schedules', [
  body('doctor').isMongoId(),
  body('date').isISO8601(),
  body('startTime').notEmpty(),
  body('endTime').notEmpty(),
  body('clinic').isMongoId()
], validate, async (req, res) => {
  try {
    const schedule = new Schedule(req.body);
    await schedule.save();
    res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/schedules/:id - Update schedule
router.put('/schedules/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('doctor', 'name specialty').populate('clinic', 'name');
    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Schedule not found' });
    }
    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============================================
// APPOINTMENT ENDPOINTS (6 endpoints)
// ============================================

// GET /api/admin/appointments - Get all appointments
router.get('/appointments', async (req, res) => {
  try {
    const { doctor, date, status, clinic, patientPhone } = req.query;
    const filter = {};
    
    if (doctor) filter.doctor = doctor;
    if (date) filter.date = new Date(date);
    if (status) filter.status = status;
    if (clinic) filter.clinic = clinic;
    if (patientPhone) filter.patientPhone = patientPhone;
    
    const appointments = await Appointment.find(filter)
      .populate('doctor', 'name specialty')
      .populate('service', 'name category')
      .populate('clinic', 'name')
      .sort({ date: 1, startTime: 1 });
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/appointments/:id - Get appointment by ID
router.get('/appointments/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor', 'name specialty')
      .populate('service', 'name category duration')
      .populate('clinic', 'name address phone');
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/appointments - Create appointment
router.post('/appointments', [
  body('patientName').notEmpty().trim(),
  body('patientPhone').notEmpty().trim(),
  body('doctor').isMongoId(),
  body('service').isMongoId(),
  body('date').isISO8601(),
  body('startTime').notEmpty(),
  body('endTime').notEmpty(),
  body('clinic').isMongoId()
], validate, async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/appointments/:id - Update appointment
router.put('/appointments/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('doctor', 'name specialty')
      .populate('service', 'name category')
      .populate('clinic', 'name');
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PATCH /api/admin/appointments/:id/status - Update appointment status
router.patch('/appointments/:id/status', [
  body('status').isIn(['pending', 'confirmed', 'completed', 'cancelled', 'no-show'])
], validate, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('doctor', 'name').populate('service', 'name').populate('clinic', 'name');
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/admin/appointments/:id - Delete appointment
router.delete('/appointments/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }
    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// STATISTICS ENDPOINTS (2 endpoints)
// ============================================

// GET /api/admin/stats/overview - Get overview statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const [
      totalClinics,
      totalDoctors,
      totalServices,
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments
    ] = await Promise.all([
      Clinic.countDocuments(),
      Doctor.countDocuments(),
      Service.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'confirmed' }),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({ status: 'cancelled' })
    ]);
    
    res.json({
      success: true,
      data: {
        clinics: totalClinics,
        doctors: totalDoctors,
        services: totalServices,
        appointments: {
          total: totalAppointments,
          pending: pendingAppointments,
          confirmed: confirmedAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/stats/today - Get today's statistics
router.get('/stats/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayAppointments = await Appointment.find({
      date: { $gte: today, $lt: tomorrow }
    })
      .populate('doctor', 'name')
      .populate('service', 'name')
      .sort({ startTime: 1 });
    
    res.json({
      success: true,
      data: {
        date: today,
        total: todayAppointments.length,
        appointments: todayAppointments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
