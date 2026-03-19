const { getDB } = require('./db');

const COLLECTION = 'system_config';

// Schema: { bookingWindowDays: 30 }

async function getConfig(key) {
  const db = getDB();
  const config = await db.collection(COLLECTION).findOne({ key });
  return config ? config.value : null;
}

async function setConfig(key, value) {
  const db = getDB();
  await db.collection(COLLECTION).updateOne(
    { key },
    { $set: { value, updatedAt: new Date() } },
    { upsert: true }
  );
  return { key, value };
}

async function getAllConfig() {
  const db = getDB();
  const configs = await db.collection(COLLECTION).find({}).toArray();
  return configs.reduce((acc, c) => {
    acc[c.key] = c.value;
    return acc;
  }, {});
}

async function getBookingWindowDays() {
  const days = await getConfig('bookingWindowDays');
  return days !== null ? days : 30; // default 30 days
}

module.exports = { getConfig, setConfig, getAllConfig, getBookingWindowDays };
