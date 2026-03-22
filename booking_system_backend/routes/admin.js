const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Clinic, Doctor, Service, Schedule, Appointment, DoctorService, DoctorType, SystemConfig } = require('../models');

// Configure multer for avatar upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'avatars');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('只接受圖片檔案'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

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
// Clinic Management (NEW - Sprint 1.5)
// ============================================

// GET /api/admin/clinics - List all clinics
router.get('/clinics', async (req, res) => {
  try {
    console.log('🔧 ADMIN GET /api/admin/clinics');
    const clinics = await Clinic.getAllClinics();
    res.json({ success: true, count: clinics.length, clinics });
  } catch (error) {
    console.error('Error fetching clinics:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// POST /api/admin/clinics - Create a new clinic
router.post('/clinics', async (req, res) => {
  try {
    console.log('🔧 ADMIN POST /api/admin/clinics', req.body);
    const { name, description, phone, address, businessHours, isActive } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, error: '缺少必要欄位：診所名稱' });
    }
    
    const clinic = await Clinic.createClinic({ 
      name, 
      description, 
      phone, 
      address, 
      businessHours, 
      isActive 
    });
    res.status(201).json({ success: true, clinic });
  } catch (error) {
    console.error('Error creating clinic:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// PUT /api/admin/clinics/:id - Update a clinic
router.put('/clinics/:id', async (req, res) => {
  try {
    console.log('🔧 ADMIN PUT /api/admin/clinics/:id', req.params.id, req.body);
    const clinic = await Clinic.updateClinic(req.params.id, req.body);
    res.json({ success: true, clinic });
  } catch (error) {
    console.error('Error updating clinic:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// DELETE /api/admin/clinics/:id - Delete a clinic
router.delete('/clinics/:id', async (req, res) => {
  try {
    console.log('🔧 ADMIN DELETE /api/admin/clinics/:id', req.params.id);
    await Clinic.deleteClinic(req.params.id);
    res.json({ success: true, message: '診所已刪除' });
  } catch (error) {
    console.error('Error deleting clinic:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// ============================================
// Doctor Avatar Upload (NEW - Sprint 1.5)
// ============================================

// POST /api/admin/upload/avatar - Upload doctor avatar
router.post('/upload/avatar', upload.single('avatar'), async (req, res) => {
  try {
    console.log('🔧 ADMIN POST /api/admin/upload/avatar');
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: '未上傳檔案' });
    }
    
    // Return the URL path to the uploaded file
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    res.json({ 
      success: true, 
      avatarUrl,
      message: '頭像上傳成功'
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ success: false, error: '上傳失敗' });
  }
});

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

// POST /api/admin/doctors - Create a new doctor (with avatar upload)
router.post('/doctors', upload.single('avatar'), async (req, res) => {
  try {
    console.log('🔧 ADMIN POST /api/admin/doctors', req.body);
    const { name, nameEn, type, bio, serviceIds, isActive } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ success: false, error: '缺少必要欄位' });
    }
    
    // Handle avatar upload
    let avatar = req.body.avatar;
    if (req.file) {
      avatar = `/uploads/avatars/${req.file.filename}`;
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

// PUT /api/admin/doctors/:id - Update a doctor (with avatar upload)
router.put('/doctors/:id', upload.single('avatar'), async (req, res) => {
  try {
    console.log('🔧 ADMIN PUT /api/admin/doctors/:id', req.params.id, req.body);
    const { serviceIds, avatar, ...updates } = req.body;
    
    // Handle avatar upload
    if (req.file) {
      updates.avatar = `/uploads/avatars/${req.file.filename}`;
    } else if (avatar) {
      updates.avatar = avatar;
    }
    
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

// GET /api/admin/schedules - List schedules with filters
router.get('/schedules', async (req, res) => {
  try {
    console.log('🔧 ADMIN GET /api/admin/schedules', req.query);
    const { clinicId, doctorId, month, date } = req.query;
    const filters = {};
    if (clinicId) filters.clinicId = clinicId;
    if (doctorId) filters.doctorId = doctorId;
    if (month) filters.month = month;
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
    const { clinicId, doctorId, date, startTime, endTime, serviceId, isActive, isOverride, conflictAlert } = req.body;
    
    if (!doctorId || !date || !startTime || !endTime) {
      return res.status(400).json({ success: false, error: '缺少必要欄位：醫生、日期、開始時間、結束時間' });
    }
    
    const schedule = await Schedule.createSchedule({ 
      clinicId, 
      doctorId, 
      date, 
      startTime, 
      endTime, 
      serviceId, 
      isActive, 
      isOverride, 
      conflictAlert 
    });
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
// Batch Schedule Copy (NEW - Sprint 1.5)
// ============================================

// POST /api/admin/schedules/batch-copy - Copy schedules from source date to target dates
router.post('/schedules/batch-copy', async (req, res) => {
  try {
    console.log('🔧 ADMIN POST /api/admin/schedules/batch-copy', req.body);
    const { sourceDate, targetDates, doctorId } = req.body;
    
    if (!sourceDate || !targetDates || !Array.isArray(targetDates)) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少必要欄位：sourceDate 和 targetDates 陣列' 
      });
    }
    
    // Get schedules from source date
    const sourceFilters = { date: sourceDate };
    if (doctorId) {
      sourceFilters.doctorId = doctorId;
    }
    
    const sourceSchedules = await Schedule.getAllSchedules(sourceFilters);
    
    if (sourceSchedules.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: '來源日期沒有找到排班' 
      });
    }
    
    // Copy to each target date
    const copiedSchedules = [];
    for (const targetDate of targetDates) {
      for (const sourceSchedule of sourceSchedules) {
        const newSchedule = await Schedule.createSchedule({
          doctorId: sourceSchedule.doctorId,
          date: targetDate,
          startTime: sourceSchedule.startTime,
          endTime: sourceSchedule.endTime,
          isOverride: false
        });
        copiedSchedules.push(newSchedule);
      }
    }
    
    res.json({ 
      success: true, 
      message: `成功複製 ${copiedSchedules.length} 個排班`,
      count: copiedSchedules.length,
      schedules: copiedSchedules
    });
  } catch (error) {
    console.error('Error batch copying schedules:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// ============================================
// Appointment Management
// ============================================

// GET /api/admin/appointments - List appointments with search & sort
router.get('/appointments', async (req, res) => {
  try {
    console.log('🔧 ADMIN GET /api/admin/appointments', req.query);
    const { doctorId, clinicId, date, status, search, sort, order } = req.query;
    const filters = {};
    if (doctorId) filters.doctorId = doctorId;
    if (clinicId) filters.clinicId = clinicId;
    if (date) filters.date = date;
    if (status) filters.status = status;
    
    const appointments = await Appointment.getAllAppointments(filters, { search, sort, order });
    res.json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// POST /api/admin/appointments - Create a new appointment
router.post('/appointments', async (req, res) => {
  try {
    console.log('🔧 ADMIN POST /api/admin/appointments', req.body);
    const { clinicId, doctorId, serviceId, patientName, patientTitle, phone, date, time, status, notes, source } = req.body;
    
    if (!clinicId || !doctorId || !serviceId || !patientName || !phone || !date || !time) {
      return res.status(400).json({ success: false, error: '缺少必要欄位' });
    }
    
    const appointment = await Appointment.createAppointment({
      clinicId,
      doctorId,
      serviceId,
      patientName,
      patientTitle,
      phone,
      date,
      time,
      status,
      notes,
      source
    });
    res.status(201).json({ success: true, appointment });
  } catch (error) {
    console.error('Error creating appointment:', error);
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
// Doctor Types Management (NEW - Sprint 1.5)
// ============================================

// GET /api/admin/doctor-types - List all doctor types
router.get('/doctor-types', async (req, res) => {
  try {
    console.log('🔧 ADMIN GET /api/admin/doctor-types');
    const doctorTypes = await DoctorType.getAllDoctorTypes();
    res.json({ success: true, count: doctorTypes.length, doctorTypes });
  } catch (error) {
    console.error('Error fetching doctor types:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// POST /api/admin/doctor-types - Create a new doctor type
router.post('/doctor-types', async (req, res) => {
  try {
    console.log('🔧 ADMIN POST /api/admin/doctor-types', req.body);
    const { name, nameEn, description, isActive } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, error: '缺少必要欄位：名稱' });
    }
    
    const doctorType = await DoctorType.createDoctorType({ name, nameEn, description, isActive });
    res.status(201).json({ success: true, doctorType });
  } catch (error) {
    console.error('Error creating doctor type:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// PUT /api/admin/doctor-types/:id - Update a doctor type
router.put('/doctor-types/:id', async (req, res) => {
  try {
    console.log('🔧 ADMIN PUT /api/admin/doctor-types/:id', req.params.id, req.body);
    const doctorType = await DoctorType.updateDoctorType(req.params.id, req.body);
    res.json({ success: true, doctorType });
  } catch (error) {
    console.error('Error updating doctor type:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// DELETE /api/admin/doctor-types/:id - Delete a doctor type
router.delete('/doctor-types/:id', async (req, res) => {
  try {
    console.log('🔧 ADMIN DELETE /api/admin/doctor-types/:id', req.params.id);
    await DoctorType.deleteDoctorType(req.params.id);
    res.json({ success: true, message: '醫生類型已刪除' });
  } catch (error) {
    console.error('Error deleting doctor type:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// ============================================
// Doctor Services Management (NEW - Sprint 1.5)
// ============================================

// GET /api/admin/doctor-services - List all doctor-service associations
router.get('/doctor-services', async (req, res) => {
  try {
    console.log('🔧 ADMIN GET /api/admin/doctor-services');
    const doctorServices = await DoctorService.getAllDoctorServices();
    res.json({ success: true, count: doctorServices.length, doctorServices });
  } catch (error) {
    console.error('Error fetching doctor services:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// POST /api/admin/doctor-services - Create a doctor-service association
router.post('/doctor-services', async (req, res) => {
  try {
    console.log('🔧 ADMIN POST /api/admin/doctor-services', req.body);
    const { doctorId, serviceId } = req.body;
    
    if (!doctorId || !serviceId) {
      return res.status(400).json({ success: false, error: '缺少必要欄位：醫生 ID 和服務 ID' });
    }
    
    const doctorService = await DoctorService.addDoctorService(doctorId, serviceId);
    res.status(201).json({ success: true, doctorService });
  } catch (error) {
    console.error('Error creating doctor service association:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// DELETE /api/admin/doctor-services/:id - Delete a doctor-service association
router.delete('/doctor-services/:id', async (req, res) => {
  try {
    console.log('🔧 ADMIN DELETE /api/admin/doctor-services/:id', req.params.id);
    await DoctorService.removeDoctorServiceById(req.params.id);
    res.json({ success: true, message: '醫生服務關聯已刪除' });
  } catch (error) {
    console.error('Error deleting doctor service association:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// ============================================
// System Config
// ============================================

// GET /api/admin/system-config - Get all config
router.get('/system-config', async (req, res) => {
  try {
    console.log('🔧 ADMIN GET /api/admin/system-config');
    const config = await SystemConfig.getAllConfig();
    res.json({ success: true, config });
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// PUT /api/admin/system-config - Update system config
router.put('/system-config', async (req, res) => {
  try {
    console.log('🔧 ADMIN PUT /api/admin/system-config', req.body);
    const updates = req.body;
    
    // Update each config key provided
    const results = {};
    for (const [key, value] of Object.entries(updates)) {
      const config = await SystemConfig.setConfig(key, value);
      results[key] = config;
    }
    
    res.json({ 
      success: true, 
      message: '系統配置已更新',
      config: results
    });
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// Legacy routes (deprecated - kept for backward compatibility)
// GET /api/admin/config - Get all config (deprecated, use /system-config)
router.get('/config', async (req, res) => {
  try {
    const config = await SystemConfig.getAllConfig();
    res.json({ success: true, config });
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// PUT /api/admin/config/:key - Update single config key (deprecated, use /system-config)
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
