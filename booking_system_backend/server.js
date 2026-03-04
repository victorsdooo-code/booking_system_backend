const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// VERSION
const VERSION = '0.2.0';

// Simple admin password (in production, use proper hashing/env)
const ADMIN_PASSWORD = 'admin123';

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// Data Models (In-Memory)
// ============================================

// 診所 Clinic
const clinic = {
  name: "青苗綜合醫療診所",
  address: "香港中環皇后大道中99號中環中心12樓",
  phone: "2525-1234"

// Health check endpoint for self-ping
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), version: VERSION });
});
};

// 醫生 Doctors
const doctors = [
  {
    id: 1,
    name: "陳醫師",
    type: "中醫",
    duration: 45  // minutes
  },
  {
    id: 2,
    name: "李醫師",
    type: "中醫",
    duration: 30
  },
  {
    id: 3,
    name: "張物理治療師",
    type: "物理治療",
    duration: 60
  },
  {
    id: 4,
    name: "王正骨師",
    type: "正骨",
    duration: 15
  }
];

// 預約 Appointments (in-memory storage)
let appointments = [];

// ============================================
// Helper Functions
// ============================================

// Generate time slots for a doctor on a given date
function generateTimeSlots(doctorId, date) {
  const doctor = doctors.find(d => d.id === parseInt(doctorId));
  if (!doctor) return [];

  const slots = [];
  const duration = doctor.duration;
  
  // Clinic hours: 9:00 AM - 6:00 PM
  const startHour = 9;
  const endHour = 18;
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let min = 0; min < 60; min += duration) {
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
    }
  }
  
  return slots;
}

// ============================================
// API Endpoints
// ============================================

// GET /api/clinic - Get clinic info
app.get('/api/clinic', (req, res) => {
  res.json(clinic);
});

// GET /api/doctors - Get all doctors
app.get('/api/doctors', (req, res) => {
  res.json(doctors);
});

// GET /api/doctors/:id - Get doctor by ID
app.get('/api/doctors/:id', (req, res) => {
  const doctor = doctors.find(d => d.id === parseInt(req.params.id));
  if (!doctor) {
    return res.status(404).json({ error: "醫生不存在" });
  }
  res.json(doctor);
});

// GET /api/slots?date=YYYY-MM-DD&doctorId=optional
app.get('/api/slots', (req, res) => {
  const { date, doctorId } = req.query;
  
  if (!date) {
    return res.status(400).json({ error: "請提供日期 (date)" });
  }
  
  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({ error: "日期格式錯誤，請使用 YYYY-MM-DD" });
  }
  
  if (doctorId) {
    // Return slots for specific doctor
    const doctor = doctors.find(d => d.id === parseInt(doctorId));
    if (!doctor) {
      return res.status(404).json({ error: "醫生不存在" });
    }
    const slots = generateTimeSlots(doctorId, date);
    res.json({
      date,
      doctorId: parseInt(doctorId),
      doctorName: doctor.name,
      slots
    });
  } else {
    // Return slots for all doctors
    const allSlots = doctors.map(doctor => ({
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorType: doctor.type,
      slots: generateTimeSlots(doctor.id, date)
    }));
    res.json({
      date,
      doctors: allSlots
    });
  }
});

// POST /api/appointments - Create new appointment
app.post('/api/appointments', (req, res) => {
  const { name, phone, doctorId, date, time } = req.body;
  
  // Validation
  if (!name || !phone || !doctorId || !date || !time) {
    return res.status(400).json({ 
      error: "缺少必要欄位",
      required: ["name", "phone", "doctorId", "date", "time"]
    });
  }
  
  // Validate doctor exists
  const doctor = doctors.find(d => d.id === parseInt(doctorId));
  if (!doctor) {
    return res.status(404).json({ error: "醫生不存在" });
  }
  
  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({ error: "日期格式錯誤，請使用 YYYY-MM-DD" });
  }
  
  // Validate time format
  const timeRegex = /^\d{2}:\d{2}$/;
  if (!timeRegex.test(time)) {
    return res.status(400).json({ error: "時間格式錯誤，請使用 HH:MM" });
  }
  
  // Check if slot is already booked
  const isBooked = appointments.some(
    appt => appt.doctorId === parseInt(doctorId) && 
            appt.date === date && 
            appt.time === time &&
            appt.status !== 'cancelled'
  );
  
  if (isBooked) {
    return res.status(409).json({ error: "此時段已被預約" });
  }
  
  // Create appointment
  const appointment = {
    id: appointments.length + 1,
    name,
    phone,
    doctorId: parseInt(doctorId),
    doctorName: doctor.name,
    date,
    time,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };
  
  appointments.push(appointment);
  
  res.status(201).json({
    message: "預約成功",
    appointment
  });
});

// GET /api/appointments - Get all appointments (with optional filters)
app.get('/api/appointments', (req, res) => {
  const { date, doctorId, status } = req.query;
  
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
  
  res.json(filtered);
});

// GET /api/appointments/:id - Get appointment by ID
app.get('/api/appointments/:id', (req, res) => {
  const appointment = appointments.find(a => a.id === parseInt(req.params.id));
  if (!appointment) {
    return res.status(404).json({ error: "預約不存在" });
  }
  res.json(appointment);
});

// DELETE /api/appointments/:id - Cancel appointment
app.delete('/api/appointments/:id', (req, res) => {
  const appointment = appointments.find(a => a.id === parseInt(req.params.id));
  if (!appointment) {
    return res.status(404).json({ error: "預約不存在" });
  }
  
  appointment.status = 'cancelled';
  appointment.cancelledAt = new Date().toISOString();
  
  res.json({
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
      error: "密碼錯誤" 
    });
  }
});

// GET /api/admin/appointments - All appointments (with filters) - Admin only
app.get('/api/admin/appointments', adminAuth, (req, res) => {
  const { date, doctorId, status, startDate, endDate, search } = req.query;
  
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
    total: filtered.length,
    appointments: filtered
  });
});

// PUT /api/admin/appointments/:id - Update appointment - Admin only
app.put('/api/admin/appointments/:id', adminAuth, (req, res) => {
  const appointment = appointments.find(a => a.id === parseInt(req.params.id));
  if (!appointment) {
    return res.status(404).json({ error: "預約不存在" });
  }
  
  const { name, phone, doctorId, date, time, status, notes } = req.body;
  
  // Update fields if provided
  if (name) appointment.name = name;
  if (phone) appointment.phone = phone;
  if (notes) appointment.notes = notes;
  
  // If changing doctor/date/time, validate availability
  const newDoctorId = doctorId ? parseInt(doctorId) : appointment.doctorId;
  const newDate = date || appointment.date;
  const newTime = time || appointment.time;
  
  if (doctorId || date || time) {
    // Validate doctor exists
    const doctor = doctors.find(d => d.id === newDoctorId);
    if (!doctor) {
      return res.status(404).json({ error: "醫生不存在" });
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
      return res.status(409).json({ error: "此時段已被預約" });
    }
    
    appointment.doctorId = newDoctorId;
    appointment.doctorName = doctor.name;
    appointment.date = newDate;
    appointment.time = newTime;
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
    message: "預約已更新",
    appointment
  });
});

// DELETE /api/admin/appointments/:id - Cancel appointment - Admin only
app.delete('/api/admin/appointments/:id', adminAuth, (req, res) => {
  const appointment = appointments.find(a => a.id === parseInt(req.params.id));
  if (!appointment) {
    return res.status(404).json({ error: "預約不存在" });
  }
  
  appointment.status = 'cancelled';
  appointment.cancelledAt = new Date().toISOString();
  appointment.cancelledBy = 'admin';
  
  res.json({
    message: "預約已取消",
    appointment
  });
});

// GET /api/admin/doctors/schedule - Doctor schedule - Admin only
app.get('/api/admin/doctors/schedule', adminAuth, (req, res) => {
  const { date, startDate, endDate } = req.query;
  
  if (!date && !startDate && !endDate) {
    return res.status(400).json({ 
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
    
    return {
      date: dateStr,
      dayOfWeek: new Date(dateStr).toLocaleDateString('zh-HK', { weekday: 'long' }),
      totalAppointments: dayAppointments.length,
      doctors: doctors.map(doctor => {
        const doctorAppointments = dayAppointments.filter(
          appt => appt.doctorId === doctor.id
        );
        return {
          doctorId: doctor.id,
          doctorName: doctor.name,
          doctorType: doctor.type,
          appointmentCount: doctorAppointments.length,
          appointments: doctorAppointments.map(appt => ({
            id: appt.id,
            time: appt.time,
            patientName: appt.name,
            phone: appt.phone,
            status: appt.status
          }))
        };
      })
    };
  });
  
  res.json({
    startDate: dates[0],
    endDate: dates[dates.length - 1],
    totalDays: dates.length,
    schedule
  });
});

// GET /api/config - 獲取系統設定 (手機優化版)
app.get('/api/config', (req, res) => {
  // 手機優化版回傳 - 精簡數據易於顯示
  res.json({
    version: VERSION,
    clinic: {
      name: clinic.name,
      address: clinic.address,
      phone: clinic.phone
    },
    doctors: doctors.map(d => ({
      id: d.id,
      name: d.name,
      type: d.type,
      duration: d.duration
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

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    version: VERSION,
    timestamp: new Date().toISOString()
  });
});

// Start server

// Self-ping to keep Render free tier awake
setInterval(() => {
  const https = require('https');
  https.get('https://booking-system-backend-2t8v.onrender.com/api/config', (res) => {
    console.log('Self-ping: ' + res.statusCode);
  }).on('error', (e) => console.log('Self-ping error: ' + e.message));
}, 10 * 60 * 1000); // Every 10 minutes


app.listen(PORT, () => {
  console.log(`🏥 青苗綜合醫療診所預約系統 API v${VERSION}`);
  console.log(`   Server running on http://localhost:${PORT}`);
  console.log(`\n📋 Available Endpoints:`);
  console.log(`   GET  /api/config        - 系統設定 (手機優化)`);
  console.log(`   GET  /api/clinic       - 診所資訊`);
  console.log(`   GET  /api/doctors      - 醫生列表`);
  console.log(`   GET  /api/doctors/:id  - 醫生詳情`);
  console.log(`   GET  /api/slots        - 可用時段 (?date=YYYY-MM-DD&doctorId=1)`);
  console.log(`   POST /api/appointments - 建立預約`);
  console.log(`   GET  /api/appointments - 預約列表`);
  console.log(`   GET  /api/appointments/:id - 預約詳情`);
  console.log(`   DELETE /api/appointments/:id - 取消預約`);
  console.log(`\n🔐 Admin Endpoints:`);
  console.log(`   POST /api/admin/login              - 員工登入`);
  console.log(`   GET  /api/admin/appointments      - 所有預約 (需token)`);
  console.log(`   PUT  /api/admin/appointments/:id  - 更新預約 (需token)`);
  console.log(`   DELETE /api/admin/appointments/:id - 取消預約 (需token)`);
  console.log(`   GET  /api/admin/doctors/schedule  - 醫生Schedule (需token)`);
});

// ============================================
// Self-Ping to prevent Render from sleeping
// ============================================
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes

function startSelfPing() {
  const selfUrl = process.env.SELF_URL || `https://booking-system-backend-2t8v.onrender.com`;
  
  console.log(`🔔 Starting self-ping every ${PING_INTERVAL/60000} minutes...`);
  
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
