const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const authenticateAdmin = require('../middleware/authenticateAdmin');

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
  body('email').optional().isEmail().normalizeEmail()
], validate, async (req, res) => {
  try {
    console.log('POST /clinics request body:', JSON.stringify(req.body, null, 2));
    const clinic = new Clinic({
      name: req.body.name,
      address: req.body.address || '',
      phone: req.body.phone || '',
      email: req.body.email || '',
      description: req.body.description || '',
      openingHours: req.body.openingHours || {},
      businessHours: req.body.businessHours || {},
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    });
    await clinic.save();
    console.log('POST /clinics success:', clinic._id);
    res.status(201).json({ success: true, data: clinic });
  } catch (error) {
    console.error('POST /clinics error:', error);
    console.error('Error details:', { name: error.name, message: error.message, errors: error.errors });
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/clinics/:id - Update clinic
router.put('/clinics/:id', async (req, res) => {
  try {
    console.log('PUT /clinics/:id request body:', JSON.stringify(req.body, null, 2));
    const clinic = await Clinic.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!clinic) {
      return res.status(404).json({ success: false, error: 'Clinic not found' });
    }
    console.log('PUT /clinics/:id success:', clinic._id);
    res.json({ success: true, data: clinic });
  } catch (error) {
    console.error('PUT /clinics/:id error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/admin/clinics/:id - Delete clinic (soft delete)
router.delete('/clinics/:id', async (req, res) => {
  try {
    const clinic = await Clinic.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!clinic) {
      return res.status(404).json({ success: false, error: 'Clinic not found' });
    }
    res.json({ success: true, message: 'Clinic deleted', clinic });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
  body('title').optional().trim(),
  body('specialty').optional().trim(),
  body('clinic').optional().isMongoId()
], validate, async (req, res) => {
  try {
    console.log('POST /doctors request body:', JSON.stringify(req.body, null, 2));
    const doctor = new Doctor({
      name: req.body.name,
      title: req.body.title,
      specialty: req.body.specialty,
      description: req.body.description || '',
      photo: req.body.photo || '',
      phone: req.body.phone || '',
      email: req.body.email || '',
      clinic: req.body.clinic,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    });
    await doctor.save();
    console.log('POST /doctors success:', doctor._id);
    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    console.error('POST /doctors error:', error);
    console.error('Error details:', { name: error.name, message: error.message, errors: error.errors });
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/doctors/:id - Update doctor
router.put('/doctors/:id', async (req, res) => {
  try {
    console.log('PUT /doctors/:id request body:', JSON.stringify(req.body, null, 2));
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('clinic', 'name address');
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }
    console.log('PUT /doctors/:id success:', doctor._id);
    res.json({ success: true, data: doctor });
  } catch (error) {
    console.error('PUT /doctors/:id error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/admin/doctors/:id - Delete doctor (soft delete)
router.delete('/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }
    res.json({ success: true, message: 'Doctor deleted', doctor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
  body('description').optional().trim(),
  body('category').optional().trim(),
  body('duration').optional().isInt({ min: 5 }),
  body('price').optional().isFloat({ min: 0 }),
  body('clinic').optional().isMongoId()
], validate, async (req, res) => {
  try {
    console.log('POST /services request body:', JSON.stringify(req.body, null, 2));
    const service = new Service({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      duration: req.body.duration,
      price: req.body.price,
      clinic: req.body.clinic,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    });
    await service.save();
    console.log('POST /services success:', service._id);
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    console.error('POST /services error:', error);
    console.error('Error details:', { name: error.name, message: error.message, errors: error.errors });
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/services/:id - Update service
router.put('/services/:id', async (req, res) => {
  try {
    console.log('PUT /services/:id request body:', JSON.stringify(req.body, null, 2));
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('clinic', 'name');
    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }
    console.log('PUT /services/:id success:', service._id);
    res.json({ success: true, data: service });
  } catch (error) {
    console.error('PUT /services/:id error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/admin/services/:id - Delete service (soft delete)
router.delete('/services/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }
    res.json({ success: true, message: 'Service deleted', service });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
    console.log('POST /doctor-services request body:', JSON.stringify(req.body, null, 2));
    const doctorService = new DoctorService({
      doctor: req.body.doctor,
      service: req.body.service,
      clinic: req.body.clinic,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    });
    await doctorService.save();
    console.log('POST /doctor-services success:', doctorService._id);
    res.status(201).json({ success: true, data: doctorService });
  } catch (error) {
    console.error('POST /doctor-services error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'This doctor-service combination already exists' });
    }
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/doctor-services/:id - Update doctor-service mapping
router.put('/doctor-services/:id', async (req, res) => {
  try {
    console.log('PUT /doctor-services/:id request body:', JSON.stringify(req.body, null, 2));
    const doctorService = await DoctorService.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!doctorService) {
      return res.status(404).json({ success: false, error: 'Doctor service not found' });
    }
    console.log('PUT /doctor-services/:id success:', doctorService._id);
    res.json({ success: true, message: 'Doctor service updated', doctorService });
  } catch (error) {
    console.error('PUT /doctor-services/:id error:', error);
    res.status(500).json({ success: false, error: error.message });
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
    const { doctorId, date, clinicId } = req.query;
    const filter = {};
    
    if (doctorId) filter.doctorId = doctorId;
    if (date) filter.date = new Date(date);
    if (clinicId) filter.clinicId = clinicId;
    
    const schedules = await Schedule.find(filter)
      .populate('doctorId', 'name specialty')
      .populate('clinicId', 'name')
      .sort({ date: 1, startTime: 1 });
    res.json({ success: true, data: schedules });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ SPECIFIC ROUTES MUST COME BEFORE PARAMETERIZED ROUTES

// GET /api/admin/schedules/available-slots?clinicId=&date=&doctorId=
router.get('/schedules/available-slots', authenticateAdmin, async (req, res) => {
  try {
    const { clinicId, date, doctorId } = req.query;
    
    // Get clinic business hours
    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ success: false, error: 'Clinic not found' });
    }
    
    // Get day of week
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const businessHours = clinic.businessHours[dayOfWeek];
    
    if (!businessHours || !businessHours.isOpen) {
      return res.json({ 
        success: true, 
        available: false, 
        message: 'Clinic is closed on this day',
        slots: [] 
      });
    }
    
    // Get existing schedules for this date/doctor
    const existingSchedules = await Schedule.find({
      clinicId,
      doctorId,
      date: new Date(date),
      isActive: true
    });
    
    // Generate available time slots based on business hours
    const slots = generateTimeSlots(businessHours.open, businessHours.close, existingSchedules);
    
    res.json({
      success: true,
      available: true,
      businessHours,
      slots
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/schedules/batch-copy - Batch copy schedules to new dates
router.post('/schedules/batch-copy', authenticateAdmin, async (req, res) => {
  try {
    const { sourceDate, targetDates, clinicId, doctorId } = req.body;
    
    // Get source schedules
    const sourceSchedules = await Schedule.find({
      date: new Date(sourceDate),
      clinicId,
      doctorId
    });
    
    if (sourceSchedules.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'No schedules found for source date' 
      });
    }
    
    // Create copies for target dates
    const newSchedules = [];
    for (const targetDate of targetDates) {
      for (const source of sourceSchedules) {
        const newSchedule = new Schedule({
          clinicId: source.clinicId,
          doctorId: source.doctorId,
          serviceId: source.serviceId,
          date: new Date(targetDate),
          startTime: source.startTime,
          endTime: source.endTime,
          isActive: true
        });
        await newSchedule.save();
        newSchedules.push(newSchedule);
      }
    }
    
    res.json({ 
      success: true, 
      message: `Batch copied ${newSchedules.length} schedules`,
      count: newSchedules.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ PARAMETERIZED ROUTES AFTER SPECIFIC ROUTES

// GET /api/admin/schedules/:id - Get schedule by ID
router.get('/schedules/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('doctorId', 'name specialty')
      .populate('clinicId', 'name');
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
  body('doctorId').isMongoId(),
  body('date').isISO8601(),
  body('startTime').notEmpty(),
  body('endTime').notEmpty(),
  body('clinicId').isMongoId()
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
    ).populate('doctorId', 'name specialty').populate('clinicId', 'name');
    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Schedule not found' });
    }
    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/admin/schedules/:id - Delete schedule (soft delete)
router.delete('/schedules/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Schedule not found' });
    }
    res.json({ success: true, message: 'Schedule deleted', schedule });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to generate time slots
function generateTimeSlots(openTime, closeTime, existingSchedules) {
  const slots = [];
  const slotDuration = 30; // 30-minute slots
  
  // Parse open and close times
  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);
  
  // Create booked slots set from existing schedules
  const bookedSlots = new Set();
  existingSchedules.forEach(schedule => {
    const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
    
    // Mark all slots within this schedule as booked
    let currentTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    while (currentTime < endTime) {
      bookedSlots.add(currentTime);
      currentTime += slotDuration;
    }
  });
  
  // Generate available slots
  let currentTime = openHour * 60 + openMinute;
  const closeTimeInMinutes = closeHour * 60 + closeMinute;
  
  while (currentTime + slotDuration <= closeTimeInMinutes) {
    const timeString = `${String(Math.floor(currentTime / 60)).padStart(2, '0')}:${String(currentTime % 60).padStart(2, '0')}`;
    
    if (!bookedSlots.has(currentTime)) {
      slots.push({
        startTime: timeString,
        endTime: `${String(Math.floor((currentTime + slotDuration) / 60)).padStart(2, '0')}:${String((currentTime + slotDuration) % 60).padStart(2, '0')}`,
        available: true
      });
    }
    
    currentTime += slotDuration;
  }
  
  return slots;
}

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
