const { getDB } = require('./db');
const { ObjectId } = require('mongodb');

const COLLECTION = 'appointments';

// Schema: { clinicId, doctorId, serviceId, date, time, status: 'pending'/'confirmed'/'cancelled', patientName, patientPhone, notes }

async function getAllAppointments(filters = {}, options = {}) {
  const db = getDB();
  const query = {};
  
  if (filters.doctorId) {
    query.doctorId = new ObjectId(filters.doctorId);
  }
  if (filters.clinicId) {
    query.clinicId = new ObjectId(filters.clinicId);
  }
  if (filters.date) {
    query.date = filters.date;
  }
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.patientPhone) {
    query.patientPhone = filters.patientPhone;
  }
  
  // Search functionality (NEW - Sprint 1.5)
  if (options.search) {
    const searchRegex = new RegExp(options.search, 'i');
    query.$or = [
      { patientName: searchRegex },
      { patientPhone: searchRegex },
      { notes: searchRegex }
    ];
  }
  
  // Sort functionality (NEW - Sprint 1.5)
  let sortQuery = { date: 1, time: 1 }; // default sort
  if (options.sort) {
    const sortOrder = options.order === 'desc' ? -1 : 1;
    if (options.sort === 'date') {
      sortQuery = { date: sortOrder, time: sortOrder };
    } else if (options.sort === 'status') {
      sortQuery = { status: sortOrder };
    } else if (options.sort === 'patientName') {
      sortQuery = { patientName: sortOrder };
    }
  }
  
  return await db.collection(COLLECTION).find(query).sort(sortQuery).toArray();
}

async function getAppointmentById(id) {
  const db = getDB();
  return await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
}

async function createAppointment(appointment) {
  const db = getDB();
  const result = await db.collection(COLLECTION).insertOne({
    clinicId: new ObjectId(appointment.clinicId),
    doctorId: new ObjectId(appointment.doctorId),
    serviceId: new ObjectId(appointment.serviceId),
    date: appointment.date,
    time: appointment.time,
    status: appointment.status || 'pending',
    patientName: appointment.patientName,
    patientPhone: appointment.patientPhone,
    notes: appointment.notes || '',
    duration: appointment.duration || 45,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return { _id: result.insertedId, ...appointment };
}

async function updateAppointment(id, updates) {
  const db = getDB();
  const updateData = { ...updates, updatedAt: new Date() };
  
  // Convert IDs if present
  if (updates.clinicId) updateData.clinicId = new ObjectId(updates.clinicId);
  if (updates.doctorId) updateData.doctorId = new ObjectId(updates.doctorId);
  if (updates.serviceId) updateData.serviceId = new ObjectId(updates.serviceId);
  
  await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
  return getAppointmentById(id);
}

async function updateAppointmentStatus(id, status) {
  const db = getDB();
  await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    { $set: { status, updatedAt: new Date() } }
  );
  return getAppointmentById(id);
}

async function deleteAppointment(id) {
  const db = getDB();
  await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
  return true;
}

async function checkTimeSlotAvailability(doctorId, date, time, duration, excludeId = null) {
  const db = getDB();
  const query = {
    doctorId: new ObjectId(doctorId),
    date: date,
    time: time,
    status: { $nin: ['cancelled'] }
  };
  
  if (excludeId) {
    query._id = { $ne: new ObjectId(excludeId) };
  }
  
  const existing = await db.collection(COLLECTION).findOne(query);
  return !existing;
}

async function getAppointmentsByDateRange(doctorId, startDate, endDate) {
  const db = getDB();
  return await db.collection(COLLECTION).find({
    doctorId: new ObjectId(doctorId),
    date: { $gte: startDate, $lte: endDate },
    status: { $nin: ['cancelled'] }
  }).sort({ date: 1, time: 1 }).toArray();
}

module.exports = { 
  getAllAppointments, 
  getAppointmentById, 
  createAppointment, 
  updateAppointment, 
  updateAppointmentStatus, 
  deleteAppointment,
  checkTimeSlotAvailability,
  getAppointmentsByDateRange
};
