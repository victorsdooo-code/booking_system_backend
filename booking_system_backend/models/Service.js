const { getDB } = require('./db');
const { ObjectId } = require('mongodb');

const COLLECTION = 'services';

// Schema: { name, duration: 15/45/60, isActive }

async function getAllServices(filters = {}) {
  const db = getDB();
  const query = {};
  
  if (filters.doctorId) {
    const doctorServices = await db.collection('doctor_services').find({ doctorId: new ObjectId(filters.doctorId) }).toArray();
    const serviceIds = doctorServices.map(ds => ds.serviceId);
    query._id = { $in: serviceIds };
  }
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }
  
  return await db.collection(COLLECTION).find(query).toArray();
}

async function getServiceById(id) {
  const db = getDB();
  return await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
}

async function createService(service) {
  const db = getDB();
  const result = await db.collection(COLLECTION).insertOne({
    ...service,
    isActive: service.isActive !== undefined ? service.isActive : true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return { _id: result.insertedId, ...service };
}

async function updateService(id, updates) {
  const db = getDB();
  await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: new Date() } }
  );
  return getServiceById(id);
}

async function deleteService(id) {
  const db = getDB();
  await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
  return true;
}

module.exports = { getAllServices, getServiceById, createService, updateService, deleteService };
