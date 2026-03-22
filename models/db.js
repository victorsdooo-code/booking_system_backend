const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

// Validate MONGODB_URI is set
if (!MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI environment variable is not set!');
  console.error('Please set MONGODB_URI in Render Dashboard → Environment Variables');
  console.error('Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>');
  process.exit(1);
}

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
