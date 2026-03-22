const { getDB } = require('./db');
const { ObjectId } = require('mongodb');

const COLLECTION = 'clinics';

// Schema: { 
//   name: String,
//   description: String,
//   image: String,
//   phone: String,
//   address: String,
//   businessHours: { open: String, close: String },
//   isActive: Boolean,
//   bookingWindowDays: Number (default 30)
// }

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
    name: clinic.name,
    description: clinic.description || '',
    image: clinic.image || '',
    phone: clinic.phone || '',
    address: clinic.address || '',
    businessHours: clinic.businessHours || { open: '09:00', close: '18:00' },
    isActive: clinic.isActive !== undefined ? clinic.isActive : true,
    bookingWindowDays: clinic.bookingWindowDays || 30,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return { _id: result.insertedId, ...clinic };
}

async function updateClinic(id, updates) {
  const db = getDB();
  const updateData = { ...updates, updatedAt: new Date() };
  await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
  return getClinicById(id);
}

async function deleteClinic(id) {
  const db = getDB();
  await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
  return true;
}

module.exports = { getAllClinics, getClinicById, createClinic, updateClinic, deleteClinic };
