const { getDB } = require('./db');
const { ObjectId } = require('mongodb');

const COLLECTION = 'doctor_services';

// Schema: { doctorId, serviceId }

async function getAllDoctorServices() {
  const db = getDB();
  return await db.collection(COLLECTION).find({}).toArray();
}

async function getServicesByDoctor(doctorId) {
  const db = getDB();
  const results = await db.collection(COLLECTION).find({ doctorId: new ObjectId(doctorId) }).toArray();
  return results.map(ds => ds.serviceId);
}

async function getDoctorsByService(serviceId) {
  const db = getDB();
  const results = await db.collection(COLLECTION).find({ serviceId: new ObjectId(serviceId) }).toArray();
  return results.map(ds => ds.doctorId);
}

async function addDoctorService(doctorId, serviceId) {
  const db = getDB();
  const result = await db.collection(COLLECTION).insertOne({
    doctorId: new ObjectId(doctorId),
    serviceId: new ObjectId(serviceId),
    createdAt: new Date()
  });
  return { _id: result.insertedId, doctorId, serviceId };
}

async function removeDoctorService(doctorId, serviceId) {
  const db = getDB();
  await db.collection(COLLECTION).deleteOne({
    doctorId: new ObjectId(doctorId),
    serviceId: new ObjectId(serviceId)
  });
  return true;
}

async function updateDoctorServices(doctorId, serviceIds) {
  const db = getDB();
  // Remove existing associations
  await db.collection(COLLECTION).deleteMany({ doctorId: new ObjectId(doctorId) });
  
  // Add new associations
  if (serviceIds && serviceIds.length > 0) {
    const inserts = serviceIds.map(serviceId => ({
      doctorId: new ObjectId(doctorId),
      serviceId: new ObjectId(serviceId),
      createdAt: new Date()
    }));
    await db.collection(COLLECTION).insertMany(inserts);
  }
  
  return getServicesByDoctor(doctorId);
}

async function removeDoctorServiceById(id) {
  const db = getDB();
  await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
  return true;
}

module.exports = { getAllDoctorServices, getServicesByDoctor, getDoctorsByService, addDoctorService, removeDoctorService, updateDoctorServices, removeDoctorServiceById };
