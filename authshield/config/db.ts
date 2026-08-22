import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (mongoUri) {
      console.log(`[Database] Connecting to configured MongoDB URI (${mongoUri.replace(/:([^@]+)@/, ':****@')})...`);
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
      return;
    }

    console.log('[Database] MONGODB_URI not set. Initializing MongoMemoryServer fallback...');
    mongoMemoryServer = await MongoMemoryServer.create();
    const uri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`[Database] In-Memory MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error: any) {
    console.warn(`[Database] MongoDB connection attempt error: ${error.message}`);
    if (!mongoMemoryServer) {
      try {
        console.log('[Database] Falling back to In-Memory MongoMemoryServer...');
        mongoMemoryServer = await MongoMemoryServer.create();
        const uri = mongoMemoryServer.getUri();
        const conn = await mongoose.connect(uri);
        console.log(`[Database] Fallback In-Memory MongoDB Connected at ${uri}`);
        return;
      } catch (memErr: any) {
        console.error(`[Database] MongoMemoryServer launch failed: ${memErr.message}`);
      }
    }
    console.error(`[Database] Fatal database connection error: ${error.message}`);
  }
};
