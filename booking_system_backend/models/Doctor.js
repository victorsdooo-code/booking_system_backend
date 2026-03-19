const { getDB } = require('./db');
const { ObjectId } = require('mongodb');

const COLLECTION = 'doctors';

// Schema: { name, type: 'TCM'/'Physio'/'Bone', avatar, bio, isActive }

async function getAllDoctors(filters = {}) {
  const db = getDB();
  const query = {};
  
  if (filters.clinicId) {
    query.clinicId = filters.clinicId;
  }
  if (filters.type) {
    query.type = filters.type;
  }
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }
  
  return await db.collection(COLLECTION).find(query).toArray();
}

async function getDoctorById(id) {
  const db = getDB();
  return await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
}

async function createDoctor(doctor) {
  const db = getDB();
  const result = await db.collection(COLLECTION).insertOne({
    ...doctor,
    isActive: doctor.isActive !== undefined ? doctor.isActive : true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return { _id: result.insertedId, ...doctor };
}

async function updateDoctor(id, updates) {
  const db = getDB();
  await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: new Date() } }
  );
  return getDoctorById(id);
}

async function deleteDoctor(id) {
  const db = getDB();
  await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
  return true;
}

async function getDoctorsByService(serviceId) {
  const db = getDB();
  const doctorServices = await db.collection('doctor_services').find({ serviceId: new ObjectId(serviceId) }).toArray();
  const doctorIds = doctorServices.map(ds => ds.doctorId);
  return await db.collection(COLLECTION).find({ _id: { $in: doctorIds } }).toArray();
}

module.exports = { getAllDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor, getDoctorsByService };
