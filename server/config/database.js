const mongoose = require('mongoose');

const connectDatabase = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('[MongoDB] MONGODB_URI is not configured');
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[MongoDB] Connected');
    return true;
  } catch (error) {
    console.error('[MongoDB] Connection failed:', error.message);
    return false;
  }
};

const isDatabaseReady = () => mongoose.connection.readyState === 1;

module.exports = { connectDatabase, isDatabaseReady };