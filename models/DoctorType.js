const { getDB } = require('./db');
const { ObjectId } = require('mongodb');

const COLLECTION = 'doctor_types';

// Schema: { name, nameEn, description, isActive }
// Examples: 'TCM' (中醫), 'Physio' (物理治療), 'Bone' (跌打)

async function getAllDoctorTypes(filters = {}) {
  const db = getDB();
  const query = {};
  
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }
  
  return await db.collection(COLLECTION).find(query).toArray();
}

async function getDoctorTypeById(id) {
  const db = getDB();
  return await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
}

async function createDoctorType(doctorType) {
  const db = getDB();
  const result = await db.collection(COLLECTION).insertOne({
    ...doctorType,
    isActive: doctorType.isActive !== undefined ? doctorType.isActive : true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return { _id: result.insertedId, ...doctorType };
}

async function updateDoctorType(id, updates) {
  const db = getDB();
  await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: new Date() } }
  );
  return getDoctorTypeById(id);
}

async function deleteDoctorType(id) {
  const db = getDB();
  await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
  return true;
}

module.exports = { getAllDoctorTypes, getDoctorTypeById, createDoctorType, updateDoctorType, deleteDoctorType };
