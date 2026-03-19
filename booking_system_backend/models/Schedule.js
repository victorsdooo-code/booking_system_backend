const { getDB } = require('./db');
const { ObjectId } = require('mongodb');

const COLLECTION = 'schedules';

// Schema: { doctorId, date, startTime, endTime, isOverride }

async function getAllSchedules(filters = {}) {
  const db = getDB();
  const query = {};
  
  if (filters.doctorId) {
    query.doctorId = new ObjectId(filters.doctorId);
  }
  if (filters.date) {
    query.date = filters.date;
  }
  
  return await db.collection(COLLECTION).find(query).toArray();
}

async function getScheduleById(id) {
  const db = getDB();
  return await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
}

async function createSchedule(schedule) {
  const db = getDB();
  const result = await db.collection(COLLECTION).insertOne({
    ...schedule,
    doctorId: new ObjectId(schedule.doctorId),
    isOverride: schedule.isOverride !== undefined ? schedule.isOverride : false,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return { _id: result.insertedId, ...schedule };
}

async function updateSchedule(id, updates) {
  const db = getDB();
  const updateData = { ...updates, updatedAt: new Date() };
  if (updates.doctorId) {
    updateData.doctorId = new ObjectId(updates.doctorId);
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

module.exports = { getAllSchedules, getScheduleById, createSchedule, updateSchedule, deleteSchedule, getDoctorScheduleForDate, deleteSchedulesByDoctor };
