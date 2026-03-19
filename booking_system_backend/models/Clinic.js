const { getDB } = require('./db');
const { ObjectId } = require('mongodb');

const COLLECTION = 'clinics';

// Schema: { name, address, phone, isActive }

async function getAllClinics() {
  const db = getDB();
  return await db.collection(COLLECTION).find({}).toArray();
}

async function getClinicById(id) {
  const db = getDB();
  return await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
}

async function createClinic(clinic) {
  const db = getDB();
  const result = await db.collection(COLLECTION).insertOne({
    ...clinic,
    isActive: clinic.isActive !== undefined ? clinic.isActive : true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return { _id: result.insertedId, ...clinic };
}

async function updateClinic(id, updates) {
  const db = getDB();
  await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: new Date() } }
  );
  return getClinicById(id);
}

async function deleteClinic(id) {
  const db = getDB();
  await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
  return true;
}

module.exports = { getAllClinics, getClinicById, createClinic, updateClinic, deleteClinic };
