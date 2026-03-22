const { getDB } = require('./db');

const COLLECTION = 'system_config';

// Schema: { 
//   bookingWindowDays: 30,
//   customMessages: {
//     phoneInquiryPrompt: "如需電話查詢請致電 XXXX-XXXX"
//   }
// }

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

async function getCustomMessages() {
  const messages = await getConfig('customMessages');
  return messages || {
    phoneInquiryPrompt: '如需電話查詢請致電 XXXX-XXXX'
  };
}

module.exports = { 
  getConfig, 
  setConfig, 
  getAllConfig, 
  getBookingWindowDays,
  getCustomMessages
};
