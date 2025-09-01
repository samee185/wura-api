// config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL.replace("<password>", process.env.MONGO_PASSWORD), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // increase timeout
    });

    console.log(`✅ Database connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("❌ An error occurred while connecting to the database:", error.message);
    throw error;
  }
};

module.exports = connectDB;
