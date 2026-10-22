const mongoose = require('mongoose');

let isMongoConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventhub';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500
    });
    isMongoConnected = true;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    isMongoConnected = false;
    console.warn(`\n======================================================`);
    console.warn(`[MongoDB Warning] Could not connect to local MongoDB at: ${mongoURI}`);
    console.warn(`Reason: ${error.message}`);
    console.warn(`--> Operating in resilient In-Memory Fallback mode.`);
    console.warn(`--> All models, validations, references, and routes remain 100% active.`);
    console.warn(`--> To connect to real MongoDB, configure MONGO_URI in backend/.env`);
    console.warn(`======================================================\n`);
    return null;
  }
};

const getMongoStatus = () => isMongoConnected;

module.exports = {
  connectDB,
  getMongoStatus
};
