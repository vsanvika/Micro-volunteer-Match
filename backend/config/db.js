const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('[MongoDB Error]: MONGODB_URI environment variable is not set!');
      process.exit(1);
    }
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    process.exit(1); // Exit so Render shows a clear crash and restarts
  }
};

module.exports = connectDB;
