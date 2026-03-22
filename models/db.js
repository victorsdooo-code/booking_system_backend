const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qingyiu_clinic';

const connect = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      // Mongoose 6+ options
      dbName: 'qingyiu_clinic'
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

const disconnect = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  } catch (error) {
    console.error(`MongoDB Disconnect Error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  connect,
  disconnect,
  mongoose
};
