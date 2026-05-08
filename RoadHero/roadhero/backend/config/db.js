const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
    try {
        let mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/roadhero';

        console.log(`⏳ Attempting to connect to: ${mongoUri}`);

        try {
            // Attempt to connect to the configured (local) DB first
            const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
            console.log(`✅ MongoDB Connected (Local): ${conn.connection.host}`);
        } catch (localError) {
            // If local connection fails, fallback to in-memory
            console.log(`⚠️  Connection Error: ${localError.message}`);
            console.log("⚠️  Could not connect to MongoDB. Switching to fallback...");
            console.log("🔄 Starting temporary in-memory database instead...");

            const mongod = await MongoMemoryServer.create();
            const memoryUri = mongod.getUri();

            const conn = await mongoose.connect(memoryUri);
            console.log(`✨ Temporary Database running at: ${memoryUri}`);
            console.log("⚠️  NOTE: Data will be lost when server stops.");
        }

    } catch (error) {
        console.error(`❌ Critical Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
