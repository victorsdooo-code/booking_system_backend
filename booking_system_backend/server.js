const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// VERSION
const VERSION = '0.3.0';

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
// Sprint 2: New Data Models
// ============================================

// SMS Verifications (in-memory storage)
const smsVerifications = [];

// Audit Logs (in-memory storage)
const auditLogs = [];

// SMS Rate Limiting (in-memory)
const smsRateLimits = new Map(); // phone -> { lastSendTime, hourlyCount, dailyCount, hourlyReset, dailyReset }

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

// Convert time string to minutes (for comparison)
function timeToMinutes(timeStr) {
  const [hour, min] = timeStr.split(':').map(Number);
  return hour * 60 + min;
}

// ============================================
// Sprint 2: Helper Functions
// ============================================

// Generate 6-digit verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Check SMS rate limit (1 per 60s, 5 per hour, 10 per day)
function canSendSMS(phone) {
  const now = Date.now();
  let limitData = smsRateLimits.get(phone);
  
  if (!limitData) {
    return { allowed: true };
  }
  
  // Check hourly reset (1 hour = 3600000ms)
  if (now >= limitData.hourlyReset) {
    limitData.hourlyCount = 0;
    limitData.hourlyReset = now + 3600000;
  }
  
  // Check daily reset (24 hours = 86400000ms)
  if (now >= limitData.dailyReset) {
    limitData.dailyCount = 0;
    limitData.dailyReset = now + 86400000;
  }
  
  // Check per-minute limit (1 per 60 seconds)
  const timeSinceLastSend = now - limitData.lastSendTime;
  if (timeSinceLastSend < 60000) {
    return { 
      allowed: false, 
      reason: 'minute',
      retryAfter: Math.ceil((60000 - timeSinceLastSend) / 1000)
    };
  }
  
  // Check hourly limit (5 per hour)
  if (limitData.hourlyCount >= 5) {
    return { 
      allowed: false, 
      reason: 'hour',
      retryAfter: Math.ceil((limitData.hourlyReset - now) / 1000)
    };
  }
  
  // Check daily limit (10 per day)
  if (limitData.dailyCount >= 10) {
    return { 
      allowed: false, 
      reason: 'day',
      retryAfter: Math.ceil((limitData.dailyReset - now) / 1000)
    };
  }
  
  return { allowed: true };
}

// Update SMS rate limit counters
function updateSMSRateLimit(phone) {
  const now = Date.now();
  let limitData = smsRateLimits.get(phone);
  
  if (!limitData) {
    limitData = {
      lastSendTime: now,
      hourlyCount: 1,
      dailyCount: 1,
      hourlyReset: now + 3600000,
      dailyReset: now + 86400000
    };
  } else {
    // Reset counters if needed
    if (now >= limitData.hourlyReset) {
      limitData.hourlyCount = 0;
      limitData.hourlyReset = now + 3600000;
    }
    if (now >= limitData.dailyReset) {
      limitData.dailyCount = 0;
      limitData.dailyReset = now + 86400000;
    }
    
    limitData.lastSendTime = now;
    limitData.hourlyCount++;
    limitData.dailyCount++;
  }
  
  smsRateLimits.set(phone, limitData);
}

// Check for double booking (time overlap detection)
function checkDoubleBooking(doctorId, date, time, duration, excludeAppointmentId = null) {
  const appointmentStart = timeToMinutes(time);
  const appointmentEnd = appointmentStart + duration;
  
  const conflicts = appointments.filter(appt => {
    // Skip if different doctor or date
    if (appt.doctorId !== parseInt(doctorId) || appt.date !== date) return false;
    
    // Skip cancelled appointments
    if (appt.status === 'cancelled') return false;
    
    // Skip self when updating
    if (excludeAppointmentId && appt.id === excludeAppointmentId) return false;
    
    const apptStart = timeToMinutes(appt.time);
    const apptEnd = apptStart + appt.duration;
    
    // Check for time overlap
    // Two intervals overlap if: start1 < end2 AND end1 > start2
    return appointmentStart < apptEnd && appointmentEnd > apptStart;
  });
  
  return {
    hasConflict: conflicts.length > 0,
    conflictingAppointments: conflicts.map(appt => {
      const apptStart = timeToMinutes(appt.time);
      return {
        id: appt.id,
        patientName: appt.name,
        phone: appt.phone,
        time: appt.time,
        duration: appt.duration,
        overlap: `${appt.time}-${timeToMinutesString(apptStart + appt.duration)}`,
        status: appt.status
      };
    })
  };
}

// Convert minutes back to time string
function timeToMinutesString(totalMinutes) {
  const hour = Math.floor(totalMinutes / 60);
  const min = totalMinutes % 60;
  return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
}

// Log audit trail
function logAudit(action, entityType, entityId, details, adminId = 'system') {
  const log = {
    id: auditLogs.length + 1,
    timestamp: new Date().toISOString(),
    action,
    entityType,
    entityId,
    details,
    adminId
  };
  auditLogs.push(log);
  console.log(`🔍 AUDIT: ${action} - ${entityType}#${entityId} by ${adminId}`);
  return log;
}

// Clean up expired SMS codes (call periodically)
function cleanupExpiredSMSCodes() {
  const now = new Date();
  const expiredCount = smsVerifications.filter(sms => new Date(sms.expiresAt) < now).length;
  
  // Keep only unexpired and recently verified codes
  const validVerifications = smsVerifications.filter(sms => {
    const expiresAt = new Date(sms.expiresAt);
    const isExpired = expiresAt < now;
    const isRecentlyVerified = sms.verified && (now - new Date(sms.verifiedAt)) < 3600000; // 1 hour
    return !isExpired || isRecentlyVerified;
  });
  
  // Replace array contents
  smsVerifications.length = 0;
  smsVerifications.push(...validVerifications);
  
  if (expiredCount > 0) {
    console.log(`🧹 Cleaned up ${expiredCount} expired SMS codes`);
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredSMSCodes, 5 * 60 * 1000);

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
  
  // Check for double booking (with overlap detection)
  const doubleBookingCheck = checkDoubleBooking(doctorId, date, time, duration);
  
  if (doubleBookingCheck.hasConflict) {
    return res.status(409).json({ 
      success: false,
      error: "此時段與現有預約衝突",
      conflicts: doubleBookingCheck.conflictingAppointments
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
// Sprint 2: SMS Verification API
// ============================================

// POST /api/sms/send - Send verification code
app.post('/api/sms/send', (req, res) => {
  console.log('📱 POST /api/sms/send - Request received');
  const { phone } = req.body;
  
  // Validate phone number
  if (!phone) {
    return res.status(400).json({ 
      success: false,
      error: "請提供電話號碼" 
    });
  }
  
  // Simple phone validation (Hong Kong format: 8 digits)
  const phoneRegex = /^[5-9]\d{7}$/;
  if (!phoneRegex.test(phone.replace(/[-\s]/g, ''))) {
    return res.status(400).json({ 
      success: false,
      error: "電話號碼格式錯誤，請使用 8 位數字 (e.g. 91234567)" 
    });
  }
  
  const cleanPhone = phone.replace(/[-\s]/g, '');
  
  // Check rate limit
  const rateLimitCheck = canSendSMS(cleanPhone);
  if (!rateLimitCheck.allowed) {
    let errorMessage, retryAfter;
    
    if (rateLimitCheck.reason === 'minute') {
      errorMessage = "請求太頻密，請 60 秒後再試";
    } else if (rateLimitCheck.reason === 'hour') {
      errorMessage = "每小時最多發送 5 個驗證碼，請稍後再試";
    } else { // daily
      errorMessage = "每日最多發送 10 個驗證碼，請明天再試";
    }
    
    return res.status(429).json({ 
      success: false,
      error: errorMessage,
      retryAfter: rateLimitCheck.retryAfter
    });
  }
  
  // Generate verification code
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  
  // Store verification (remove any existing unverified codes for this phone)
  const existingIndex = smsVerifications.findIndex(
    sms => sms.phone === cleanPhone && !sms.verified
  );
  if (existingIndex !== -1) {
    smsVerifications.splice(existingIndex, 1);
  }
  
  const verification = {
    id: smsVerifications.length + 1,
    phone: cleanPhone,
    code,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    verified: false,
    verifiedAt: null
  };
  
  smsVerifications.push(verification);
  
  // Update rate limit counters
  updateSMSRateLimit(cleanPhone);
  
  // Mock SMS sending (in production, integrate with SMS provider)
  console.log(`📱 SMS sent to ${cleanPhone}: Code ${code} (expires at ${expiresAt.toISOString()})`);
  
  // Log audit
  logAudit('sms_sent', 'sms_verification', verification.id, { phone: cleanPhone }, 'system');
  
  res.json({
    success: true,
    message: "驗證碼已發送",
    expiresInSeconds: 300,
    phone: cleanPhone
  });
});

// POST /api/sms/verify - Verify code
app.post('/api/sms/verify', (req, res) => {
  console.log('📱 POST /api/sms/verify - Request received');
  const { phone, code } = req.body;
  
  // Validate inputs
  if (!phone || !code) {
    return res.status(400).json({ 
      success: false,
      error: "請提供電話號碼和驗證碼",
      required: ["phone", "code"]
    });
  }
  
  const cleanPhone = phone.replace(/[-\s]/g, '');
  
  // Find verification record
  const verification = smsVerifications.find(
    sms => sms.phone === cleanPhone && !sms.verified
  );
  
  if (!verification) {
    return res.status(404).json({ 
      success: false,
      error: "找不到驗證記錄，請重新發送驗證碼" 
    });
  }
  
  // Check expiry
  const expiresAt = new Date(verification.expiresAt);
  if (expiresAt < new Date()) {
    // Remove expired verification
    const index = smsVerifications.indexOf(verification);
    if (index !== -1) {
      smsVerifications.splice(index, 1);
    }
    
    return res.status(410).json({ 
      success: false,
      error: "驗證碼已過期，請重新發送",
      expired: true
    });
  }
  
  // Verify code
  if (verification.code !== code) {
    return res.status(400).json({ 
      success: false,
      error: "驗證碼錯誤" 
    });
  }
  
  // Mark as verified
  verification.verified = true;
  verification.verifiedAt = new Date().toISOString();
  
  // Log audit
  logAudit('sms_verified', 'sms_verification', verification.id, { phone: cleanPhone }, 'system');
  
  console.log(`✅ SMS verified for ${cleanPhone}`);
  
  res.json({
    success: true,
    message: "驗證成功",
    phone: cleanPhone,
    verifiedAt: verification.verifiedAt
  });
});

// GET /api/sms/status - Check verification status (optional helper)
app.get('/api/sms/status', (req, res) => {
  const { phone } = req.query;
  
  if (!phone) {
    return res.status(400).json({ 
      success: false,
      error: "請提供電話號碼" 
    });
  }
  
  const cleanPhone = phone.replace(/[-\s]/g, '');
  const verification = smsVerifications.find(
    sms => sms.phone === cleanPhone && !sms.verified
  );
  
  if (!verification) {
    return res.json({
      success: true,
      hasPendingVerification: false
    });
  }
  
  const expiresAt = new Date(verification.expiresAt);
  const isExpired = expiresAt < new Date();
  const secondsUntilExpiry = Math.max(0, Math.floor((expiresAt - new Date()) / 1000));
  
  res.json({
    success: true,
    hasPendingVerification: true,
    expiresInSeconds: isExpired ? 0 : secondsUntilExpiry,
    expired: isExpired
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

// POST /api/admin/appointments - Manual appointment creation (Admin only)
app.post('/api/admin/appointments', adminAuth, (req, res) => {
  console.log('📋 POST /api/admin/appointments - Admin manual creation');
  const { name, phone, doctorId, date, time, serviceId, clinicId, notes, status, overrideSchedule } = req.body;
  
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
  
  // Validate service and get duration
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
  
  // Check for double booking (with overlap detection)
  const doubleBookingCheck = checkDoubleBooking(doctorId, date, time, duration);
  
  if (doubleBookingCheck.hasConflict) {
    // Admin can override if overrideSchedule is true
    if (!overrideSchedule) {
      return res.status(409).json({ 
        success: false,
        error: "此時段與現有預約衝突",
        conflicts: doubleBookingCheck.conflictingAppointments,
        hint: "設置 overrideSchedule=true 可強制建立"
      });
    }
    console.log(`⚠️ Admin override: Creating appointment despite conflict`);
  }
  
  // Check doctor's schedule (admin can override)
  let scheduleWarning = null;
  if (!overrideSchedule) {
    const schedule = getDoctorSchedule(doctorId, date);
    if (schedule.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "該醫生在指定日期沒有排班",
        hint: "設置 overrideSchedule=true 可強制建立"
      });
    }
  } else {
    scheduleWarning = "醫生在該日期無排班，已強制建立";
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
    status: status || 'confirmed',
    notes: notes || null,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    scheduleWarning: scheduleWarning || null
  };
  
  appointments.push(appointment);
  
  // Log audit
  logAudit('appointment_created', 'appointment', appointment.id, {
    doctorName: doctor.name,
    date,
    time,
    patientName: name,
    overrideSchedule: overrideSchedule || false
  }, 'admin');
  
  console.log(`✅ Admin appointment created: ID ${appointment.id}, ${doctor.name}, ${date} ${time}`);
  
  res.status(201).json({
    success: true,
    message: "預約已成功建立",
    appointment
  });
});

// POST /api/admin/appointments/:id/status - Change appointment status (Admin only)
app.post('/api/admin/appointments/:id/status', adminAuth, (req, res) => {
  console.log('📋 POST /api/admin/appointments/:id/status - Change status');
  const appointment = appointments.find(a => a.id === parseInt(req.params.id));
  
  if (!appointment) {
    return res.status(404).json({ 
      success: false,
      error: "預約不存在" 
    });
  }
  
  const { status, reason } = req.body;
  
  // Valid statuses
  const validStatuses = ['confirmed', 'pending', 'cancelled', 'completed', 'no-show'];
  
  if (!status) {
    return res.status(400).json({ 
      success: false,
      error: "請提供狀態",
      validStatuses
    });
  }
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      success: false,
      error: "無效的狀態",
      validStatuses
    });
  }
  
  // Validate status transitions
  const statusTransitions = {
    'confirmed': ['pending', 'cancelled', 'completed', 'no-show'],
    'pending': ['confirmed', 'cancelled'],
    'cancelled': ['confirmed'], // Can reactivate
    'completed': [], // Terminal state
    'no-show': ['confirmed'] // Can reactivate
  };
  
  const currentStatus = appointment.status;
  const allowedTransitions = statusTransitions[currentStatus] || [];
  
  if (status !== currentStatus && !allowedTransitions.includes(status)) {
    return res.status(400).json({ 
      success: false,
      error: `不允許的狀態轉換：${currentStatus} -> ${status}`,
      allowedTransitions,
      currentStatus
    });
  }
  
  // Store old status for audit
  const oldStatus = appointment.status;
  
  // Update status
  appointment.status = status;
  appointment.statusChangedAt = new Date().toISOString();
  appointment.statusChangedBy = 'admin';
  
  // Add status history
  if (!appointment.statusHistory) {
    appointment.statusHistory = [];
  }
  appointment.statusHistory.push({
    from: oldStatus,
    to: status,
    changedAt: appointment.statusChangedAt,
    changedBy: 'admin',
    reason: reason || null
  });
  
  // Add cancelledAt if cancelled
  if (status === 'cancelled') {
    appointment.cancelledAt = appointment.statusChangedAt;
    appointment.cancelledBy = 'admin';
  }
  
  // Log audit
  logAudit('appointment_status_changed', 'appointment', appointment.id, {
    from: oldStatus,
    to: status,
    reason: reason || null
  }, 'admin');
  
  console.log(`✅ Appointment status changed: ID ${appointment.id}, ${oldStatus} -> ${status}`);
  
  res.json({
    success: true,
    message: "預約狀態已更新",
    appointment,
    previousStatus: oldStatus,
    newStatus: status
  });
});

// GET /api/admin/appointments/export - Export appointments as CSV - Admin only
app.get('/api/admin/appointments/export', adminAuth, (req, res) => {
  console.log('📊 GET /api/admin/appointments/export - CSV export requested');
  const { date, doctorId, status, startDate, endDate, clinicId } = req.query;
  
  let filtered = [...appointments];
  
  // Apply same filters as list endpoint
  if (date) {
    filtered = filtered.filter(appt => appt.date === date);
  }
  
  if (startDate && endDate) {
    filtered = filtered.filter(appt => appt.date >= startDate && appt.date <= endDate);
  }
  
  if (doctorId) {
    filtered = filtered.filter(appt => appt.doctorId === parseInt(doctorId));
  }
  
  if (clinicId) {
    filtered = filtered.filter(appt => appt.clinicId === parseInt(clinicId));
  }
  
  if (status) {
    filtered = filtered.filter(appt => appt.status === status);
  }
  
  // Sort by date and time
  filtered.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });
  
  // Generate CSV
  const headers = [
    '預約 ID',
    '病人姓名',
    '電話',
    '醫生',
    '診所',
    '服務',
    '日期',
    '時間',
    '時長 (分鐘)',
    '狀態',
    '備註',
    '建立時間'
  ];
  
  const rows = filtered.map(appt => [
    appt.id,
    appt.name,
    appt.phone,
    appt.doctorName,
    appt.clinicName || 'N/A',
    appt.serviceName || 'N/A',
    appt.date,
    appt.time,
    appt.duration,
    appt.status,
    appt.notes || '',
    appt.createdAt
  ]);
  
  // Convert to CSV format with proper escaping
  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n');
  
  // Log audit
  logAudit('appointments_exported', 'export', 'csv', {
    count: filtered.length,
    filters: { date, doctorId, status, startDate, endDate, clinicId }
  }, 'admin');
  
  console.log(`📊 CSV export: ${filtered.length} appointments`);
  
  // Set headers for file download
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="appointments_${new Date().toISOString().split('T')[0]}.csv"`);
  
  res.send(csvContent);
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

// GET /api/admin/audit-logs - View audit trail - Admin only
app.get('/api/admin/audit-logs', adminAuth, (req, res) => {
  const { entityType, entityId, action, limit = 100 } = req.query;
  
  let filtered = [...auditLogs];
  
  if (entityType) {
    filtered = filtered.filter(log => log.entityType === entityType);
  }
  
  if (entityId) {
    filtered = filtered.filter(log => log.entityId === parseInt(entityId));
  }
  
  if (action) {
    filtered = filtered.filter(log => log.action === action);
  }
  
  // Sort by timestamp (newest first)
  filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Apply limit
  const limited = filtered.slice(0, parseInt(limit));
  
  res.json({
    success: true,
    total: filtered.length,
    returned: limited.length,
    auditLogs: limited
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
  console.log(`\n📱 Sprint 2: SMS Verification:`);
  console.log(`   POST /api/sms/send                    - 發送驗證碼`);
  console.log(`   POST /api/sms/verify                  - 驗證碼驗證`);
  console.log(`   GET  /api/sms/status                  - 驗證狀態`);
  console.log(`\n🔐 Sprint 2: Admin Enhanced:`);
  console.log(`   POST /api/admin/login                 - 員工登入`);
  console.log(`   POST /api/admin/appointments          - 手動建立預約 (需 token)`);
  console.log(`   GET  /api/admin/appointments          - 所有預約 (需 token)`);
  console.log(`   GET  /api/admin/appointments/export   - CSV 匯出 (需 token)`);
  console.log(`   PUT  /api/admin/appointments/:id      - 更新預約 (需 token)`);
  console.log(`   POST /api/admin/appointments/:id/status - 更改狀態 (需 token)`);
  console.log(`   DELETE /api/admin/appointments/:id    - 取消預約 (需 token)`);
  console.log(`   GET  /api/admin/doctors/schedule      - 醫生排班 (需 token)`);
  console.log(`   GET  /api/admin/audit-logs            - 審核日誌 (需 token)`);
  console.log(`\n📋 Legacy Endpoints (maintained):`);
  console.log(`   GET  /api/clinic        - 診所資訊 (舊)`);
  console.log(`   GET  /api/slots         - 可用時段 (舊)`);
  console.log(`\n⚙️  Configuration:`);
  console.log(`   PORT: ${PORT}`);
  console.log(`   CORS: ${process.env.CORS_ORIGIN || '*'}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n✨ Sprint 2 Features:`);
  console.log(`   ✅ Double booking detection (overlap check)`);
  console.log(`   ✅ SMS verification (6-digit, 5min expiry, rate limit: 1/min, 5/hour, 10/day)`);
  console.log(`   ✅ Admin manual appointment creation`);
  console.log(`   ✅ Admin status change with audit trail`);
  console.log(`   ✅ Audit logging system`);
  console.log(`   ✅ CSV export for appointments`);
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
