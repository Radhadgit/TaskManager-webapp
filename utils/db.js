import mongoose from 'mongoose';

// Use the environment variable if available, else fallback to Docker MongoDB service
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://task-manager-mongodb:27017/taskmanager';

if (!MONGODB_URI) {
  console.log("MongoDB URL missing — skipping DB connection at build time");
}

// Global cache to avoid multiple connections in development
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("MongoDB connected");
      return mongoose;
    }).catch((err) => {
      console.error("MongoDB connection error:", err);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
