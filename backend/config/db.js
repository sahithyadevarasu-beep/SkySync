
import mongoose from 'mongoose';

let connectionError = null;

/**
 * Connect to MongoDB Atlas using the MONGO_URI
 * environment variable.
 */
export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri || !mongoUri.trim()) {
    connectionError = 'MONGO_URI is not configured.';
    console.warn('[MongoDB] Connection URI is missing.');
    return false;
  }

  // Reuse an existing connection
  if (mongoose.connection.readyState === 1) {
    connectionError = null;
    return true;
  }

  try {
    console.log('[MongoDB] Connecting to MongoDB Atlas...');

    await mongoose.connect(mongoUri.trim(), {
      serverSelectionTimeoutMS: 10000,
    });

    connectionError = null;

    console.log('[MongoDB] Connected successfully.');

    return true;
  } catch (error) {
    connectionError = error.message || 'MongoDB connection failed.';

    console.error('[MongoDB] Connection failed:', connectionError);

    return false;
  }
};

/**
 * Return current MongoDB connection status.
 */
export const getMongoStatus = () => {
  return {
    isConnected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    error: connectionError,
    hasUri: Boolean(
      process.env.MONGO_URI && process.env.MONGO_URI.trim()
    ),
  };
};

// Monitor MongoDB connection
mongoose.connection.on('connected', () => {
  connectionError = null;
  console.log('[MongoDB] Connection established.');
});

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Disconnected from Atlas.');
});

mongoose.connection.on('error', (error) => {
  connectionError = error.message || 'MongoDB connection error.';
  console.error('[MongoDB] Connection error:', connectionError);
});
