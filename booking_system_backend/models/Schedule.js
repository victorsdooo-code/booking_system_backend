const { getDB } = require('./db');
const { ObjectId } = require('mongodb');

const COLLECTION = 'schedules';

// Schema: { clinicId (ref), doctorId (ref), date, startTime, endTime, serviceId (ref), isActive, isOverride, conflictAlert }

async function getAllSchedules(filters = {}) {
  const db = getDB();
  const query = {};
  
  if (filters.clinicId) {
    query.clinicId = new ObjectId(filters.clinicId);
  }
  if (filters.doctorId) {
    query.doctorId = new ObjectId(filters.doctorId);
  }
  if (filters.date) {
    query.date = filters.date;
  }
  if (filters.month) {
    // Parse month (YYYY-MM format)
    const [year, month] = filters.month.split('-');
    const startDate = new Date(year, parseInt(month) - 1, 1);
    const endDate = new Date(year, parseInt(month), 0);
    query.date = {
      $gte: startDate.toISOString().split('T')[0],
      $lte: endDate.toISOString().split('T')[0]
    };
  }
  
  return await db.collection(COLLECTION).find(query).toArray();
}

async function getScheduleById(id) {
  const db = getDB();
  return await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
}

async function createSchedule(schedule) {
  const db = getDB();
  const insertData = {
    doctorId: new ObjectId(schedule.doctorId),
    date: schedule.date,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    isOverride: schedule.isOverride !== undefined ? schedule.isOverride : false,
    isActive: schedule.isActive !== undefined ? schedule.isActive : true,
    conflictAlert: schedule.conflictAlert || false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  if (schedule.clinicId) {
    insertData.clinicId = new ObjectId(schedule.clinicId);
  }
  if (schedule.serviceId) {
    insertData.serviceId = new ObjectId(schedule.serviceId);
  }
  
  const result = await db.collection(COLLECTION).insertOne(insertData);
  return { _id: result.insertedId, ...schedule };
}

async function updateSchedule(id, updates) {
  const db = getDB();
  const updateData = { ...updates, updatedAt: new Date() };
  if (updates.doctorId) {
    updateData.doctorId = new ObjectId(updates.doctorId);
  }
  if (updates.clinicId) {
    updateData.clinicId = new ObjectId(updates.clinicId);
  }
  if (updates.serviceId) {
    updateData.serviceId = new ObjectId(updates.serviceId);
  }
  await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
  return getScheduleById(id);
}

async function deleteSchedule(id) {
  const db = getDB();
  await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
  return true;
}

async function getDoctorScheduleForDate(doctorId, date) {
  const db = getDB();
  return await db.collection(COLLECTION).find({
    doctorId: new ObjectId(doctorId),
    date: date
  }).toArray();
}

async function deleteSchedulesByDoctor(doctorId) {
  const db = getDB();
  await db.collection(COLLECTION).deleteMany({ doctorId: new ObjectId(doctorId) });
  return true;
}

module.exports = { 
  getAllSchedules, 
  getScheduleById, 
  createSchedule, 
  updateSchedule, 
  deleteSchedule, 
  getDoctorScheduleForDate, 
  deleteSchedulesByDoctor 
};
