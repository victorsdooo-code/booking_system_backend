const express = require('express');
const router = express.Router();
const { Clinic, Doctor, Service, Schedule, Appointment, DoctorService, SystemConfig } = require('../models');

// Admin authentication middleware
function adminAuth(req, res, next) {
  const token = req.headers['x-admin-token'];
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (token === ADMIN_PASSWORD) {
    return next();
  }
  
  return res.status(401).json({ success: false, error: '未授權' });
}

// Apply admin auth to all routes
router.use(adminAuth);

// ============================================
// Doctor Management
// ============================================

// GET /api/admin/doctors - List all doctors
router.get('/doctors', async (req, res) => {
  try {
    console.log('🔧 ADMIN GET /api/admin/doctors');
    const doctors = await Doctor.getAllDoctors();
    
    // Get services for each doctor
    const doctorsWithServices = await Promise.all(
      doctors.map(async (doctor) => {
        const serviceIds = await DoctorService.getServicesByDoctor(doctor._id);
        return { ...doctor, serviceIds: serviceIds.map(id => id.toString()) };
      })
    );
    
    res.json({ success: true, count: doctorsWithServices.length, doctors: doctorsWithServices });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// POST /api/admin/doctors - Create a new doctor
router.post('/doctors', async (req, res) => {
  try {
    console.log('🔧 ADMIN POST /api/admin/doctors', req.body);
    const { name, nameEn, type, bio, avatar, serviceIds, isActive } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ success: false, error: '缺少必要欄位' });
    }
    
    const doctor = await Doctor.createDoctor({ name, nameEn, type, bio, avatar, isActive });
    
    // Associate services if provided
    if (serviceIds && serviceIds.length > 0) {
      await DoctorService.updateDoctorServices(doctor._id, serviceIds);
    }
    
    res.status(201).json({ success: true, doctor });
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// PUT /api/admin/doctors/:id - Update a doctor
router.put('/doctors/:id', async (req, res) => {
  try {
    console.log('🔧 ADMIN PUT /api/admin/doctors/:id', req.params.id, req.body);
    const { serviceIds, ...updates } = req.body;
    
    const doctor = await Doctor.updateDoctor(req.params.id, updates);
    
    // Update service associations if provided
    if (serviceIds !== undefined) {
      await DoctorService.updateDoctorServices(req.params.id, serviceIds);
    }
    
    res.json({ success: true, doctor });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// DELETE /api/admin/doctors/:id - Delete a doctor
router.delete('/doctors/:id', async (req, res) => {
  try {
    console.log('🔧 ADMIN DELETE /api/admin/doctors/:id', req.params.id);
    await Doctor.deleteDoctor(req.params.id);
    await DoctorService.updateDoctorServices(req.params.id, []); // Remove associations
    res.json({ success: true, message: '醫生已刪除' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// ============================================
// Service Management
// ============================================

// GET /api/admin/services - List all services
router.get('/services', async (req, res) => {
  try {
    console.log('🔧 ADMIN GET /api/admin/services');
    const services = await Service.getAllServices();
    res.json({ success: true, count: services.length, services });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// POST /api/admin/services - Create a new service
router.post('/services', async (req, res) => {
  try {
    console.log('🔧 ADMIN POST /api/admin/services', req.body);
    const { name, nameEn, duration, isActive } = req.body;
    
    if (!name || !duration) {
      return res.status(400).json({ success: false, error: '缺少必要欄位' });
    }
    
    const service = await Service.createService({ name, nameEn, duration, isActive });
    res.status(201).json({ success: true, service });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// PUT /api/admin/services/:id - Update a service
router.put('/services/:id', async (req, res) => {
  try {
    console.log('🔧 ADMIN PUT /api/admin/services/:id', req.params.id, req.body);
    const service = await Service.updateService(req.params.id, req.body);
    res.json({ success: true, service });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// DELETE /api/admin/services/:id - Delete a service
router.delete('/services/:id', async (req, res) => {
  try {
    console.log('🔧 ADMIN DELETE /api/admin/services/:id', req.params.id);
    await Service.deleteService(req.params.id);
    res.json({ success: true, message: '服務已刪除' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// ============================================
// Schedule Management
// ============================================

// GET /api/admin/schedules - List schedules
router.get('/schedules', async (req, res) => {
  try {
    console.log('🔧 ADMIN GET /api/admin/schedules', req.query);
    const { doctorId, date } = req.query;
    const filters = {};
    if (doctorId) filters.doctorId = doctorId;
    if (date) filters.date = date;
    
    const schedules = await Schedule.getAllSchedules(filters);
    res.json({ success: true, count: schedules.length, schedules });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// POST /api/admin/schedules - Create a schedule
router.post('/schedules', async (req, res) => {
  try {
    console.log('🔧 ADMIN POST /api/admin/schedules', req.body);
    const { doctorId, date, startTime, endTime, isOverride } = req.body;
    
    if (!doctorId || !date || !startTime || !endTime) {
      return res.status(400).json({ success: false, error: '缺少必要欄位' });
    }
    
    const schedule = await Schedule.createSchedule({ doctorId, date, startTime, endTime, isOverride });
    res.status(201).json({ success: true, schedule });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// PUT /api/admin/schedules/:id - Update a schedule
router.put('/schedules/:id', async (req, res) => {
  try {
    console.log('🔧 ADMIN PUT /api/admin/schedules/:id', req.params.id, req.body);
    const schedule = await Schedule.updateSchedule(req.params.id, req.body);
    res.json({ success: true, schedule });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// DELETE /api/admin/schedules/:id - Delete a schedule
router.delete('/schedules/:id', async (req, res) => {
  try {
    console.log('🔧 ADMIN DELETE /api/admin/schedules/:id', req.params.id);
    await Schedule.deleteSchedule(req.params.id);
    res.json({ success: true, message: '排班已刪除' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// ============================================
// Appointment Management
// ============================================

// GET /api/admin/appointments - List appointments
router.get('/appointments', async (req, res) => {
  try {
    console.log('🔧 ADMIN GET /api/admin/appointments', req.query);
    const { doctorId, clinicId, date, status } = req.query;
    const filters = {};
    if (doctorId) filters.doctorId = doctorId;
    if (clinicId) filters.clinicId = clinicId;
    if (date) filters.date = date;
    if (status) filters.status = status;
    
    const appointments = await Appointment.getAllAppointments(filters);
    res.json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// GET /api/admin/appointments/:id - Get appointment by ID
router.get('/appointments/:id', async (req, res) => {
  try {
    console.log('🔧 ADMIN GET /api/admin/appointments/:id', req.params.id);
    const appointment = await Appointment.getAppointmentById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ success: false, error: '預約不存在' });
    }
    
    res.json({ success: true, appointment });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// PUT /api/admin/appointments/:id - Update an appointment
router.put('/appointments/:id', async (req, res) => {
  try {
    console.log('🔧 ADMIN PUT /api/admin/appointments/:id', req.params.id, req.body);
    const appointment = await Appointment.updateAppointment(req.params.id, req.body);
    res.json({ success: true, appointment });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// PUT /api/admin/appointments/:id/status - Update appointment status
router.put('/appointments/:id/status', async (req, res) => {
  try {
    console.log('🔧 ADMIN PUT /api/admin/appointments/:id/status', req.params.id, req.body);
    const { status } = req.body;
    
    if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, error: '無效的狀態' });
    }
    
    const appointment = await Appointment.updateAppointmentStatus(req.params.id, status);
    res.json({ success: true, appointment });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// DELETE /api/admin/appointments/:id - Cancel/delete an appointment
router.delete('/appointments/:id', async (req, res) => {
  try {
    console.log('🔧 ADMIN DELETE /api/admin/appointments/:id', req.params.id);
    await Appointment.deleteAppointment(req.params.id);
    res.json({ success: true, message: '預約已刪除' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// ============================================
// System Config
// ============================================

// GET /api/admin/config - Get all config
router.get('/config', async (req, res) => {
  try {
    const config = await SystemConfig.getAllConfig();
    res.json({ success: true, config });
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// PUT /api/admin/config/:key - Update config
router.put('/config/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    const config = await SystemConfig.setConfig(key, value);
    res.json({ success: true, config });
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

module.exports = router;
