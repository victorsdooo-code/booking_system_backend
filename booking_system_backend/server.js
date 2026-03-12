const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// VERSION
const VERSION = '0.2.0';

// Admin password (use environment variable in production)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Token']
}));
app.use(express.json());

// ============================================
// Data Models (In-Memory) - Sprint 1 Enhanced
// ============================================

// 診所 Clinics
const clinics = [
  {
    id: 1,
    name: "青苗綜合醫療診所",
    nameEn: "Ching Yiu Integrated Medical Clinic",
    address: "香港中環皇后大道中 99 號中環中心 12 樓",
    phone: "2525-1234",
    email: "info@chingyiu.com",
    services: ["中醫", "物理治療", "中醫正骨"]
  },
  {
    id: 2,
    name: "青苗中藥房",
    nameEn: "Ching Yiu Chinese Medicine Pharmacy",
    address: "香港中環皇后大道中 99 號中環中心 11 樓",
    phone: "2525-1235",
    email: "pharmacy@chingyiu.com",
    services: ["中藥配藥", "藥膳諮詢"]
  }
];

// 服務 Services with duration configuration
const services = [
  {
    id: 1,
    name: "中醫師 - 問診",
    nameEn: "TCM Doctor - Consultation",
    duration: 15,  // 15 分鐘
    price: 300,
    category: "中醫",
    description: "初步診斷及諮詢"
  },
  {
    id: 2,
    name: "中醫師 - 治療",
    nameEn: "TCM Doctor - Treatment",
    duration: 45,  // 45 分鐘
    price: 600,
    category: "中醫",
    description: "針灸、中藥治療等"
  },
  {
    id: 3,
    name: "物理治療師",
    nameEn: "Physiotherapist",
    duration: 60,  // 60 分鐘
    price: 800,
    category: "物理治療",
    description: "物理治療及復康"
  },
  {
    id: 4,
    name: "中醫正骨師",
    nameEn: "TCM Bone Setter",
    duration: 60,  // 60 分鐘
    price: 700,
    category: "中醫正骨",
    description: "正骨及關節調整"
  }
];

// 醫生 Doctors (~10 doctors with specialties)
const doctors = [
  {
    id: 1,
    name: "陳醫師",
    nameEn: "Dr. Chan",
    type: "中醫",
    specialty: "內科、婦科",
    clinicId: 1,
    serviceIds: [1, 2],
    available: true
  },
  {
    id: 2,
    name: "李醫師",
    nameEn: "Dr. Lee",
    type: "中醫",
    specialty: "兒科、皮膚科",
    clinicId: 1,
    serviceIds: [1, 2],
    available: true
  },
  {
    id: 3,
    name: "張醫師",
    nameEn: "Dr. Cheung",
    type: "中醫",
    specialty: "骨科、痛症",
    clinicId: 1,
    serviceIds: [1, 2],
    available: true
  },
  {
    id: 4,
    name: "王醫師",
    nameEn: "Dr. Wong",
    type: "中醫",
    specialty: "腸胃、呼吸系統",
    clinicId: 1,
    serviceIds: [1, 2],
    available: false
  },
  {
    id: 5,
    name: "林醫師",
    nameEn: "Dr. Lam",
    type: "中醫",
    specialty: "神經系統、失眠",
    clinicId: 2,
    serviceIds: [1, 2],
    available: true
  },
  {
    id: 6,
    name: "黃物理治療師",
    nameEn: "Wong Physiotherapist",
    type: "物理治療",
    specialty: "運動創傷、復康",
    clinicId: 1,
    serviceIds: [3],
    available: true
  },
  {
    id: 7,
    name: "周物理治療師",
    nameEn: "Chau Physiotherapist",
    type: "物理治療",
    specialty: "脊椎、關節",
    clinicId: 1,
    serviceIds: [3],
    available: true
  },
  {
    id: 8,
    name: "吳正骨師",
    nameEn: "Ng Bone Setter",
    type: "中醫正骨",
    specialty: "傳統正骨、跌打",
    clinicId: 1,
    serviceIds: [4],
    available: true
  },
  {
    id: 9,
    name: "鄭正骨師",
    nameEn: "Cheng Bone Setter",
    type: "中醫正骨",
    specialty: "頸椎、腰椎",
    clinicId: 2,
    serviceIds: [4],
    available: true
  },
  {
    id: 10,
    name: "劉醫師",
    nameEn: "Dr. Lau",
    type: "中醫",
    specialty: "調理、養生",
    clinicId: 2,
    serviceIds: [1, 2],
    available: true
  }
];

// 醫生排班 Schedules (doctor availability)
const schedules = [
  // 陳醫師 - 週一、三、五上午
  { doctorId: 1, dayOfWeek: 1, startTime: "09:00", endTime: "13:00", available: true },
  { doctorId: 1, dayOfWeek: 3, startTime: "09:00", endTime: "13:00", available: true },
  { doctorId: 1, dayOfWeek: 5, startTime: "09:00", endTime: "13:00", available: true },
  // 李醫師 - 週二、四、六
  { doctorId: 2, dayOfWeek: 2, startTime: "09:00", endTime: "18:00", available: true },
  { doctorId: 2, dayOfWeek: 4, startTime: "09:00", endTime: "18:00", available: true },
  { doctorId: 2, dayOfWeek: 6, startTime: "09:00", endTime: "13:00", available: true },
  // 張醫師 - 週一、三、五下午
  { doctorId: 3, dayOfWeek: 1, startTime: "14:00", endTime: "18:00", available: true },
  { doctorId: 3, dayOfWeek: 3, startTime: "14:00", endTime: "18:00", available: true },
  { doctorId: 3, dayOfWeek: 5, startTime: "14:00", endTime: "18:00", available: true },
  // 王醫師 - 週二、四
  { doctorId: 4, dayOfWeek: 2, startTime: "09:00", endTime: "18:00", available: false },
  { doctorId: 4, dayOfWeek: 4, startTime: "09:00", endTime: "18:00", available: false },
  // 林醫師 - 週一至五
  { doctorId: 5, dayOfWeek: 1, startTime: "09:00", endTime: "18:00", available: true },
  { doctorId: 5, dayOfWeek: 2, startTime: "09:00", endTime: "18:00", available: true },
  { doctorId: 5, dayOfWeek: 3, startTime: "09:00", endTime: "18:00", available: true },
  { doctorId: 5, dayOfWeek: 4, startTime: "09:00", endTime: "18:00", available: true },
  { doctorId: 5, dayOfWeek: 5, startTime: "09:00", endTime: "18:00", available: true },
  // 黃物理治療師 - 週一至五
  { doctorId: 6, dayOfWeek: 1, startTime: "09:00", endTime: "18:00", available: true },
  { doctorId: 6, dayOfWeek: 2, startTime: "09:00", endTime: "18:00", available: true },
  { doctorId: 6, dayOfWeek: 3, startTime: "09:00", endTime: "18:00", available: true },
  { doctorId: 6, dayOfWeek: 4, startTime: "09:00", endTime: "18:00", available: true },
  { doctorId: 6, dayOfWeek: 5, startTime: "09:00", endTime: "18:00", available: true },
  // 周物理治療師 - 週六
  { doctorId: 7, dayOfWeek: 6, startTime: "09:00", endTime: "18:00", available: true },
  // 吳正骨師 - 週一、三、五
  { doctorId: 8, dayOfWeek: 1, startTime: "09:00", endTime: "18:00", available: true },
  { doctorId: 8, dayOfWeek: 3, startTime: "09:00", endTime: "18:00", available: true },
  { doctorId: 8, dayOfWeek: 5, startTime: "09:00", endTime: "18:00", available: true },
  // 鄭正骨師 - 週二、四、六
  { doctorId: 9, dayOfWeek: 2, startTime: "09:00", endTime: "18:00", available: true },
  { doctorId: 9, dayOfWeek: 4, startTime: "09:00", endTime: "18:00", available: true },
  { doctorId: 9, dayOfWeek: 6, startTime: "09:00", endTime: "13:00", available: true },
  // 劉醫師 - 週一至五
  { doctorId: 10, dayOfWeek: 1, startTime: "09:00", endTime: "18:00", available: true },
  { doctorId: 10, dayOfWeek: 2, startTime: "09:00", endTime: "18:00", available: true },
  { doctorId: 10, dayOfWeek: 3, startTime: "09:00", endTime: "18:00", available: true },
  { doctorId: 10, dayOfWeek: 4, startTime: "09:00", endTime: "18:00", available: true },
  { doctorId: 10, dayOfWeek: 5, startTime: "09:00", endTime: "18:00", available: true }
];

// 預約 Appointments (in-memory storage)
let appointments = [];

// ============================================
// Helper Functions
// ============================================

// Get service duration by service ID
function getServiceDuration(serviceId) {
  const service = services.find(s => s.id === parseInt(serviceId));
  return service ? service.duration : 45; // default 45 minutes
}

// Get doctor's schedule for a specific date
function getDoctorSchedule(doctorId, date) {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  return schedules.filter(
    s => s.doctorId === parseInt(doctorId) && 
         s.dayOfWeek === dayOfWeek && 
         s.available
  );
}

// Generate time slots for a doctor on a given date
function generateTimeSlots(doctorId, date, serviceId = null) {
  const doctor = doctors.find(d => d.id === parseInt(doctorId));
  if (!doctor || !doctor.available) return [];

  const schedule = getDoctorSchedule(doctorId, date);
  if (schedule.length === 0) return [];

  const slots = [];
  const duration = serviceId ? getServiceDuration(serviceId) : doctor.duration || 45;
  
  schedule.forEach(slot => {
    const [startHour, startMin] = slot.startTime.split(':').map(Number);
    const [endHour, endMin] = slot.endTime.split(':').map(Number);
    
    let currentMin = startHour * 60 + startMin;
    const endMinTotal = endHour * 60 + endMin;
    
    while (currentMin + duration <= endMinTotal) {
      const hour = Math.floor(currentMin / 60);
      const min = currentMin % 60;
      const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      
      // Check if slot is already booked
      const isBooked = appointments.some(
        appt => appt.doctorId === parseInt(doctorId) && 
                appt.date === date && 
                appt.time === time &&
                appt.status !== 'cancelled'
      );
      
      if (!isBooked) {
        slots.push({
          time,
          duration,
          available: true
        });
      }
      
      currentMin += duration;
    }
  });
  
  return slots;
}

// Validate date format
function isValidDate(dateStr) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date);
}

// Validate time format
function isValidTime(timeStr) {
  const timeRegex = /^\d{2}:\d{2}$/;
  if (!timeRegex.test(timeStr)) return false;
  const [hour, min] = timeStr.split(':').map(Number);
  return hour >= 0 && hour <= 23 && min >= 0 && min <= 59;
}

// ============================================
// API Endpoints - Sprint 1 Enhanced
// ============================================

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(), 
    version: VERSION 
  });
});

// GET /api/clinics - List all clinics
app.get('/api/clinics', (req, res) => {
  console.log('📋 GET /api/clinics - Request received');
  res.json({
    success: true,
    count: clinics.length,
    clinics
  });
});

// GET /api/clinics/:id - Get clinic by ID
app.get('/api/clinics/:id', (req, res) => {
  const clinic = clinics.find(c => c.id === parseInt(req.params.id));
  if (!clinic) {
    return res.status(404).json({ 
      success: false,
      error: "診所不存在" 
    });
  }
  res.json({
    success: true,
    clinic
  });
});

// GET /api/services - List all services with duration
app.get('/api/services', (req, res) => {
  console.log('📋 GET /api/services - Request received');
  res.json({
    success: true,
    count: services.length,
    services
  });
});

// GET /api/services/:id - Get service by ID
app.get('/api/services/:id', (req, res) => {
  const service = services.find(s => s.id === parseInt(req.params.id));
  if (!service) {
    return res.status(404).json({ 
      success: false,
      error: "服務不存在" 
    });
  }
  res.json({
    success: true,
    service
  });
});

// GET /api/doctors - List all doctors
app.get('/api/doctors', (req, res) => {
  console.log('📋 GET /api/doctors - Request received');
  const { clinicId, type, available } = req.query;
  
  let filteredDoctors = [...doctors];
  
  if (clinicId) {
    filteredDoctors = filteredDoctors.filter(d => d.clinicId === parseInt(clinicId));
  }
  
  if (type) {
    filteredDoctors = filteredDoctors.filter(d => d.type === type);
  }
  
  if (available !== undefined) {
    const isAvailable = available === 'true';
    filteredDoctors = filteredDoctors.filter(d => d.available === isAvailable);
  }
  
  res.json({
    success: true,
    count: filteredDoctors.length,
    doctors: filteredDoctors
  });
});

// GET /api/doctors/:id - Get doctor by ID
app.get('/api/doctors/:id', (req, res) => {
  const doctor = doctors.find(d => d.id === parseInt(req.params.id));
  if (!doctor) {
    return res.status(404).json({ 
      success: false,
      error: "醫生不存在" 
    });
  }
  res.json({
    success: true,
    doctor
  });
});

// GET /api/doctors/:id/available-slots - Get available time slots for a doctor
app.get('/api/doctors/:id/available-slots', (req, res) => {
  console.log(`📋 GET /api/doctors/${req.params.id}/available-slots - Request received`);
  const { date, serviceId } = req.query;
  
  // Validate date
  if (!date) {
    return res.status(400).json({ 
      success: false,
      error: "請提供日期 (date)",
      required: "date=YYYY-MM-DD"
    });
  }
  
  if (!isValidDate(date)) {
    return res.status(400).json({ 
      success: false,
      error: "日期格式錯誤，請使用 YYYY-MM-DD" 
    });
  }
  
  // Validate doctor exists
  const doctor = doctors.find(d => d.id === parseInt(req.params.id));
  if (!doctor) {
    return res.status(404).json({ 
      success: false,
      error: "醫生不存在" 
    });
  }
  
  // Generate slots
  const slots = generateTimeSlots(req.params.id, date, serviceId);
  
  res.json({
    success: true,
    doctorId: parseInt(req.params.id),
    doctorName: doctor.name,
    date,
    serviceId: serviceId ? parseInt(serviceId) : null,
    duration: serviceId ? getServiceDuration(serviceId) : (doctor.duration || 45),
    slots
  });
});

// POST /api/appointments - Create booking (enhanced validation)
app.post('/api/appointments', (req, res) => {
  console.log('📋 POST /api/appointments - Request received');
  const { name, phone, doctorId, date, time, serviceId, clinicId, notes } = req.body;
  
  // Validation - Required fields
  if (!name || !phone || !doctorId || !date || !time) {
    return res.status(400).json({ 
      success: false,
      error: "缺少必要欄位",
      required: ["name", "phone", "doctorId", "date", "time"]
    });
  }
  
  // Validate doctor exists
  const doctor = doctors.find(d => d.id === parseInt(doctorId));
  if (!doctor) {
    return res.status(404).json({ 
      success: false,
      error: "醫生不存在" 
    });
  }
  
  // Validate doctor is available
  if (!doctor.available) {
    return res.status(400).json({ 
      success: false,
      error: "該醫生暫時不接受預約" 
    });
  }
  
  // Validate date format
  if (!isValidDate(date)) {
    return res.status(400).json({ 
      success: false,
      error: "日期格式錯誤，請使用 YYYY-MM-DD" 
    });
  }
  
  // Validate time format
  if (!isValidTime(time)) {
    return res.status(400).json({ 
      success: false,
      error: "時間格式錯誤，請使用 HH:MM" 
    });
  }
  
  // Validate clinic if provided
  if (clinicId) {
    const clinic = clinics.find(c => c.id === parseInt(clinicId));
    if (!clinic) {
      return res.status(404).json({ 
        success: false,
        error: "診所不存在" 
      });
    }
  }
  
  // Validate service if provided
  let duration = doctor.duration || 45;
  if (serviceId) {
    const service = services.find(s => s.id === parseInt(serviceId));
    if (!service) {
      return res.status(404).json({ 
        success: false,
        error: "服務不存在" 
      });
    }
    duration = service.duration;
  }
  
  // Check if slot is already booked
  const isBooked = appointments.some(
    appt => appt.doctorId === parseInt(doctorId) && 
            appt.date === date && 
            appt.time === time &&
            appt.status !== 'cancelled'
  );
  
  if (isBooked) {
    return res.status(409).json({ 
      success: false,
      error: "此時段已被預約" 
    });
  }
  
  // Check doctor's schedule for that day
  const schedule = getDoctorSchedule(doctorId, date);
  if (schedule.length === 0) {
    return res.status(400).json({ 
      success: false,
      error: "該醫生在指定日期沒有排班" 
    });
  }
  
  // Create appointment
  const appointment = {
    id: appointments.length + 1,
    name,
    phone,
    doctorId: parseInt(doctorId),
    doctorName: doctor.name,
    serviceId: serviceId ? parseInt(serviceId) : null,
    serviceName: serviceId ? services.find(s => s.id === parseInt(serviceId))?.name : null,
    clinicId: clinicId ? parseInt(clinicId) : doctor.clinicId,
    clinicName: clinicId ? clinics.find(c => c.id === parseInt(clinicId))?.name : doctor.clinicId ? clinics.find(c => c.id === doctor.clinicId)?.name : null,
    date,
    time,
    duration,
    status: 'confirmed',
    notes: notes || null,
    createdAt: new Date().toISOString()
  };
  
  appointments.push(appointment);
  
  console.log(`✅ Appointment created: ID ${appointment.id}, ${doctor.name}, ${date} ${time}`);
  
  res.status(201).json({
    success: true,
    message: "預約成功",
    appointment
  });
});

// GET /api/appointments - List all appointments (for admin)
app.get('/api/appointments', (req, res) => {
  console.log('📋 GET /api/appointments - Request received');
  const { date, doctorId, status, clinicId } = req.query;
  
  let filtered = [...appointments];
  
  if (date) {
    filtered = filtered.filter(appt => appt.date === date);
  }
  
  if (doctorId) {
    filtered = filtered.filter(appt => appt.doctorId === parseInt(doctorId));
  }
  
  if (status) {
    filtered = filtered.filter(appt => appt.status === status);
  }
  
  if (clinicId) {
    filtered = filtered.filter(appt => appt.clinicId === parseInt(clinicId));
  }
  
  res.json({
    success: true,
    total: filtered.length,
    appointments: filtered
  });
});

// GET /api/appointments/:id - Get appointment by ID
app.get('/api/appointments/:id', (req, res) => {
  const appointment = appointments.find(a => a.id === parseInt(req.params.id));
  if (!appointment) {
    return res.status(404).json({ 
      success: false,
      error: "預約不存在" 
    });
  }
  res.json({
    success: true,
    appointment
  });
});

// DELETE /api/appointments/:id - Cancel appointment
app.delete('/api/appointments/:id', (req, res) => {
  const appointment = appointments.find(a => a.id === parseInt(req.params.id));
  if (!appointment) {
    return res.status(404).json({ 
      success: false,
      error: "預約不存在" 
    });
  }
  
  appointment.status = 'cancelled';
  appointment.cancelledAt = new Date().toISOString();
  
  console.log(`❌ Appointment cancelled: ID ${appointment.id}`);
  
  res.json({
    success: true,
    message: "預約已取消",
    appointment
  });
});

// ============================================
// Admin API Endpoints
// ============================================

// Admin authentication middleware
function adminAuth(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token;
  
  if (!token || token !== ADMIN_PASSWORD) {
    return res.status(401).json({ 
      success: false,
      error: "未授權",
      message: "請提供有效的管理員權杖"
    });
  }
  
  req.adminAuthenticated = true;
  next();
}

// POST /api/admin/login - Employee login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ 
      success: false,
      error: "請提供密碼" 
    });
  }
  
  if (password === ADMIN_PASSWORD) {
    res.json({
      success: true,
      message: "登入成功",
      token: ADMIN_PASSWORD,
      expiresIn: '24h'
    });
  } else {
    res.status(401).json({ 
      success: false,
      error: "密碼錯誤" 
    });
  }
});

// GET /api/admin/appointments - All appointments (with filters) - Admin only
app.get('/api/admin/appointments', adminAuth, (req, res) => {
  const { date, doctorId, status, startDate, endDate, search, clinicId } = req.query;
  
  let filtered = [...appointments];
  
  // Filter by date
  if (date) {
    filtered = filtered.filter(appt => appt.date === date);
  }
  
  // Filter by date range
  if (startDate && endDate) {
    filtered = filtered.filter(appt => appt.date >= startDate && appt.date <= endDate);
  }
  
  // Filter by doctor
  if (doctorId) {
    filtered = filtered.filter(appt => appt.doctorId === parseInt(doctorId));
  }
  
  // Filter by clinic
  if (clinicId) {
    filtered = filtered.filter(appt => appt.clinicId === parseInt(clinicId));
  }
  
  // Filter by status
  if (status) {
    filtered = filtered.filter(appt => appt.status === status);
  }
  
  // Search by name or phone
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(appt => 
      appt.name.toLowerCase().includes(searchLower) || 
      appt.phone.includes(search)
    );
  }
  
  // Sort by date and time (newest first)
  filtered.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return b.time.localeCompare(a.time);
  });
  
  res.json({
    success: true,
    total: filtered.length,
    appointments: filtered
  });
});

// PUT /api/admin/appointments/:id - Update appointment - Admin only
app.put('/api/admin/appointments/:id', adminAuth, (req, res) => {
  const appointment = appointments.find(a => a.id === parseInt(req.params.id));
  if (!appointment) {
    return res.status(404).json({ 
      success: false,
      error: "預約不存在" 
    });
  }
  
  const { name, phone, doctorId, date, time, serviceId, status, notes } = req.body;
  
  // Update fields if provided
  if (name) appointment.name = name;
  if (phone) appointment.phone = phone;
  if (notes !== undefined) appointment.notes = notes;
  
  // If changing doctor/date/time, validate availability
  const newDoctorId = doctorId ? parseInt(doctorId) : appointment.doctorId;
  const newDate = date || appointment.date;
  const newTime = time || appointment.time;
  
  if (doctorId || date || time) {
    // Validate doctor exists
    const doctor = doctors.find(d => d.id === newDoctorId);
    if (!doctor) {
      return res.status(404).json({ 
        success: false,
        error: "醫生不存在" 
      });
    }
    
    // Check if slot is available (excluding current appointment)
    const isBooked = appointments.some(
      appt => appt.id !== appointment.id &&
              appt.doctorId === newDoctorId && 
              appt.date === newDate && 
              appt.time === newTime &&
              appt.status !== 'cancelled'
    );
    
    if (isBooked) {
      return res.status(409).json({ 
        success: false,
        error: "此時段已被預約" 
      });
    }
    
    appointment.doctorId = newDoctorId;
    appointment.doctorName = doctor.name;
    appointment.date = newDate;
    appointment.time = newTime;
  }
  
  // Update service if provided
  if (serviceId) {
    const service = services.find(s => s.id === parseInt(serviceId));
    if (!service) {
      return res.status(404).json({ 
        success: false,
        error: "服務不存在" 
      });
    }
    appointment.serviceId = parseInt(serviceId);
    appointment.serviceName = service.name;
    appointment.duration = service.duration;
  }
  
  // Update status if provided
  if (status) {
    appointment.status = status;
    if (status === 'cancelled') {
      appointment.cancelledAt = new Date().toISOString();
    }
  }
  
  appointment.updatedAt = new Date().toISOString();
  
  res.json({
    success: true,
    message: "預約已更新",
    appointment
  });
});

// DELETE /api/admin/appointments/:id - Cancel appointment - Admin only
app.delete('/api/admin/appointments/:id', adminAuth, (req, res) => {
  const appointment = appointments.find(a => a.id === parseInt(req.params.id));
  if (!appointment) {
    return res.status(404).json({ 
      success: false,
      error: "預約不存在" 
    });
  }
  
  appointment.status = 'cancelled';
  appointment.cancelledAt = new Date().toISOString();
  appointment.cancelledBy = 'admin';
  
  res.json({
    success: true,
    message: "預約已取消",
    appointment
  });
});

// GET /api/admin/doctors/schedule - Doctor schedule - Admin only
app.get('/api/admin/doctors/schedule', adminAuth, (req, res) => {
  const { date, startDate, endDate, doctorId } = req.query;
  
  if (!date && !startDate && !endDate) {
    return res.status(400).json({ 
      success: false,
      error: "請提供日期",
      required: "date 或 startDate + endDate"
    });
  }
  
  let dates = [];
  
  if (date) {
    dates = [date];
  } else if (startDate && endDate) {
    // Generate date range
    let current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
  }
  
  const schedule = dates.map(dateStr => {
    const dayAppointments = appointments.filter(
      appt => appt.date === dateStr && appt.status !== 'cancelled'
    );
    
    let filteredDoctors = doctors;
    if (doctorId) {
      filteredDoctors = doctors.filter(d => d.id === parseInt(doctorId));
    }
    
    return {
      date: dateStr,
      dayOfWeek: new Date(dateStr).toLocaleDateString('zh-HK', { weekday: 'long' }),
      totalAppointments: dayAppointments.length,
      doctors: filteredDoctors.map(doctor => {
        const doctorAppointments = dayAppointments.filter(
          appt => appt.doctorId === doctor.id
        );
        return {
          doctorId: doctor.id,
          doctorName: doctor.name,
          doctorType: doctor.type,
          specialty: doctor.specialty,
          appointmentCount: doctorAppointments.length,
          appointments: doctorAppointments.map(appt => ({
            id: appt.id,
            time: appt.time,
            patientName: appt.name,
            phone: appt.phone,
            serviceName: appt.serviceName,
            status: appt.status
          }))
        };
      })
    };
  });
  
  res.json({
    success: true,
    startDate: dates[0],
    endDate: dates[dates.length - 1],
    totalDays: dates.length,
    schedule
  });
});

// GET /api/config - 獲取系統設定 (手機優化版)
app.get('/api/config', (req, res) => {
  res.json({
    version: VERSION,
    clinics: clinics.map(c => ({
      id: c.id,
      name: c.name,
      nameEn: c.nameEn,
      address: c.address,
      phone: c.phone
    })),
    services: services.map(s => ({
      id: s.id,
      name: s.name,
      nameEn: s.nameEn,
      duration: s.duration,
      price: s.price,
      category: s.category
    })),
    doctors: doctors.map(d => ({
      id: d.id,
      name: d.name,
      nameEn: d.nameEn,
      type: d.type,
      specialty: d.specialty,
      clinicId: d.clinicId,
      available: d.available
    })),
    settings: {
      bookingDaysAhead: 30,
      minAdvanceHours: 2,
      clinicHours: {
        open: "09:00",
        close: "18:00"
      }
    }
  });
});

// ============================================
// Error Handling Middleware
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "找不到該資源",
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({
    success: false,
    error: "伺服器內部錯誤",
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================
// Start Server
// ============================================

app.listen(PORT, () => {
  console.log(`\n🏥 青苗綜合醫療診所預約系統 API v${VERSION}`);
  console.log(`   Server running on http://localhost:${PORT}`);
  console.log(`\n📋 Sprint 1 API Endpoints:`);
  console.log(`   GET  /api/clinics                     - 診所列表`);
  console.log(`   GET  /api/services                    - 服務列表`);
  console.log(`   GET  /api/doctors                     - 醫生列表`);
  console.log(`   GET  /api/doctors/:id/available-slots - 醫生可用時段`);
  console.log(`   POST /api/appointments                - 建立預約`);
  console.log(`   GET  /api/appointments                - 預約列表`);
  console.log(`\n📋 Legacy Endpoints (maintained):`);
  console.log(`   GET  /api/clinic        - 診所資訊 (舊)`);
  console.log(`   GET  /api/slots         - 可用時段 (舊)`);
  console.log(`\n🔐 Admin Endpoints:`);
  console.log(`   POST /api/admin/login              - 員工登入`);
  console.log(`   GET  /api/admin/appointments      - 所有預約 (需 token)`);
  console.log(`   PUT  /api/admin/appointments/:id  - 更新預約 (需 token)`);
  console.log(`   DELETE /api/admin/appointments/:id - 取消預約 (需 token)`);
  console.log(`   GET  /api/admin/doctors/schedule  - 醫生排班 (需 token)`);
  console.log(`\n⚙️  Configuration:`);
  console.log(`   PORT: ${PORT}`);
  console.log(`   CORS: ${process.env.CORS_ORIGIN || '*'}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
});

// ============================================
// Self-Ping to prevent Render from sleeping
// ============================================

const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes

function startSelfPing() {
  const selfUrl = process.env.SELF_URL || `https://booking-system-backend-2t8v.onrender.com`;
  
  console.log(`\n🔔 Starting self-ping every ${PING_INTERVAL/60000} minutes...`);
  
  setInterval(async () => {
    try {
      const response = await fetch(selfUrl + '/api/health');
      console.log(`🔔 Self-ping at ${new Date().toISOString()}: ${response.status}`);
    } catch (error) {
      console.log(`🔔 Self-ping failed: ${error.message}`);
    }
  }, PING_INTERVAL);
}

// Start ping if not in development
if (process.env.NODE_ENV !== 'development') {
  startSelfPing();
}

module.exports = app;
