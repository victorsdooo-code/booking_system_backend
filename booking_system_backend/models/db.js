const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'qingyiu_clinic';

let db = null;
let client = null;

async function connectDB() {
  if (db) return db;

  try {
    console.log('🔗 MongoDB URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@')); // Hide password in logs
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000,
    });
    await client.connect();
    db = client.db(DB_NAME);
    console.log(`✅ Connected to MongoDB: ${DB_NAME}`);
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('   URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@'));
    console.error('   Common fixes:');
    console.error('   - Check if MongoDB is running');
    console.error('   - Verify MONGODB_URI is correct');
    console.error('   - For Render: Set MONGODB_URI in environment variables');
    throw error;
  }
}

async function closeDB() {
  if (client) {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

function getDB() {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db;
}

module.exports = { connectDB, closeDB, getDB };
