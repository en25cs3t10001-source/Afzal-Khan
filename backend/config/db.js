import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

let mongoServer = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    if (!uri || uri.includes('your_mongodb_connection_string') || uri.includes('localhost')) {
      try {
        if (uri && uri.includes('localhost')) {
          await mongoose.connect(uri, { serverSelectionTimeoutMS: 1500 });
          console.log(`[MongoDB] Connected to external instance at ${uri}`);
          return;
        }
      } catch (err) {
        console.log('[MongoDB] Localhost not reachable, falling back to embedded MongoMemoryServer...');
      }

      // Start embedded MongoMemoryServer for reliable, zero-config out-of-the-box execution
      if (!mongoServer) {
        mongoServer = await MongoMemoryServer.create({
          instance: {
            dbName: 'staffsync_db',
          },
        });
      }
      uri = mongoServer.getUri();
      console.log(`[MongoDB] Embedded MongoDB started at: ${uri}`);
    }

    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
