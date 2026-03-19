const express = require('express');
const router = express.Router();
const { Clinic, Doctor, Service, Schedule, Appointment, DoctorService, SystemConfig } = require('../models');

// GET /api/clinics - List all clinics
router.get('/clinics', async (req, res) => {
  try {
    console.log('📋 GET /api/clinics');
    const clinics = await Clinic.getAllClinics();
    res.json({ success: true, count: clinics.length, clinics });
  } catch (error) {
    console.error('Error fetching clinics:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// GET /api/doctors - List doctors with filters
router.get('/doctors', async (req, res) => {
  try {
    console.log('📋 GET /api/doctors', req.query);
    const { clinicId, type } = req.query;
    const filters = {};
    if (type) filters.type = type;
    
    const doctors = await Doctor.getAllDoctors(filters);
    
    // Get services for each doctor
    const doctorsWithServices = await Promise.all(
      doctors.map(async (doctor) => {
        const serviceIds = await DoctorService.getServicesByDoctor(doctor._id);
        return { ...doctor, serviceIds };
      })
    );
    
    res.json({ success: true, count: doctorsWithServices.length, doctors: doctorsWithServices });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// GET /api/services - List services
router.get('/services', async (req, res) => {
  try {
    console.log('📋 GET /api/services', req.query);
    const { doctorId } = req.query;
    const filters = doctorId ? { doctorId } : {};
    
    const services = await Service.getAllServices(filters);
    res.json({ success: true, count: services.length, services });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// GET /api/slots - Get available time slots for a doctor on a date
router.get('/slots', async (req, res) => {
  try {
    console.log('📋 GET /api/slots', req.query);
    const { doctorId, date, serviceId } = req.query;
    
    if (!doctorId || !date) {
      return res.status(400).json({ success: false, error: '缺少醫生 ID 或日期' });
    }
    
    // Get doctor's schedule for the date
    const schedules = await Schedule.getDoctorScheduleForDate(doctorId, date);
    
    if (schedules.length === 0) {
      return res.json({ success: true, slots: [], message: '該醫生此日期沒有排班' });
    }
    
    // Get service duration
    let duration = 45; // default
    if (serviceId) {
      const service = await Service.getServiceById(serviceId);
      if (service) duration = service.duration;
    }
    
    // Get existing appointments for this doctor on this date
    const appointments = await Appointment.getAllAppointments({ doctorId, date });
    const bookedSlots = appointments
      .filter(appt => appt.status !== 'cancelled')
      .map(appt => ({ time: appt.time, duration: appt.duration }));
    
    // Generate available slots
    const slots = [];
    for (const schedule of schedules) {
      const [startHour, startMin] = schedule.startTime.split(':').map(Number);
      const [endHour, endMin] = schedule.endTime.split(':').map(Number);
      
      let currentMin = startHour * 60 + startMin;
      const endMinTotal = endHour * 60 + endMin;
      
      while (currentMin + duration <= endMinTotal) {
        const hour = Math.floor(currentMin / 60);
        const min = currentMin % 60;
        const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        
        // Check if this slot is booked
        const isBooked = bookedSlots.some(slot => slot.time === time);
        
        if (!isBooked) {
          slots.push({ time, duration, available: true });
        }
        
        currentMin += duration;
      }
    }
    
    res.json({ success: true, count: slots.length, slots });
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// POST /api/appointments - Create a new appointment
router.post('/appointments', async (req, res) => {
  try {
    console.log('📝 POST /api/appointments', req.body);
    const { clinicId, doctorId, serviceId, date, time, patientName, patientPhone, notes } = req.body;
    
    // Validate required fields
    if (!clinicId || !doctorId || !serviceId || !date || !time || !patientName || !patientPhone) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少必要欄位',
        required: ['clinicId', 'doctorId', 'serviceId', 'date', 'time', 'patientName', 'patientPhone']
      });
    }
    
    // Check if time slot is available
    const service = await Service.getServiceById(serviceId);
    const duration = service ? service.duration : 45;
    
    const isAvailable = await Appointment.checkTimeSlotAvailability(doctorId, date, time, duration);
    if (!isAvailable) {
      return res.status(409).json({ success: false, error: '該時段已被預約' });
    }
    
    // Create appointment
    const appointment = await Appointment.createAppointment({
      clinicId,
      doctorId,
      serviceId,
      date,
      time,
      patientName,
      patientPhone,
      notes,
      duration,
      status: 'pending'
    });
    
    res.status(201).json({ success: true, appointment });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

// GET /api/config - Get system configuration
router.get('/config', async (req, res) => {
  try {
    const config = await SystemConfig.getAllConfig();
    res.json({ success: true, config });
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

module.exports = router;
