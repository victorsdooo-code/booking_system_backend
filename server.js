const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

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

// GET /api/config - 獲取系統設定 (手機優化版)
app.get('/api/config', (req, res) => {
  // 手機優化版回傳 - 精簡數據易於顯示
  res.json({
    version: "0.1.0",
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
    version: '0.1.0',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🏥 青苗綜合醫療診所預約系統 API v0.1.0`);
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
});
