import mongoose from 'mongoose';

let isConnected = false;
let connectionError = null;

/**
 * Normalizes and cleans MongoDB connection strings.
 * Users frequently copy connection strings from Atlas with placeholder brackets,
 * e.g., mongodb+srv://admin:<password>@cluster0...
 * If the user replaced <password> with <Root>, the angle brackets must be stripped,
 * and capitalization mismatches should be handled gracefully.
 *
 * @param {string} rawUri
 * @returns {string[]}
 */
function getUriCandidates(rawUri) {
  const list = [];
  const trimmed = rawUri.trim();

  // Candidate 1: Stripped angle brackets if present (:<password>@ -> :password@)
  if (trimmed.includes(':<') && trimmed.includes('>@')) {
    const stripped = trimmed.replace(/:<([^>]+)>@/, ':$1@');
    list.push(stripped);

    // Also try lowercase variant if it has uppercase characters
    const lowerVariant = trimmed.replace(/:<([^>]+)>@/, (_match, p1) => `:${p1.toLowerCase()}@`);
    if (lowerVariant !== stripped) {
      list.push(lowerVariant);
    }
  }

  // Candidate 2: The exact trimmed string
  if (!list.includes(trimmed)) {
    list.push(trimmed);
  }

  // Candidate 3: Lowercase password variant of exact string
  const lowerMatch = trimmed.match(/:([^@]+)@/);
  if (lowerMatch && lowerMatch[1] !== lowerMatch[1].toLowerCase()) {
    const lowerPass = trimmed.replace(/:([^@]+)@/, `:${lowerMatch[1].toLowerCase()}@`);
    if (!list.includes(lowerPass)) {
      list.push(lowerPass);
    }
  }

  return list;
}

/**
 * Connect to MongoDB Atlas
 * @returns {Promise<boolean>}
 */
export const connectDB = async () => {
  const rawUri = process.env.MONGO_URI;

  if (!rawUri || rawUri.trim() === '') {
    console.warn('⚠️  [MongoDB] MONGO_URI is not set in environment or .env.');
    isConnected = false;
    connectionError = 'MONGO_URI is not configured in .env';
    return false;
  }

  // Prevent duplicate connections if already connected
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    connectionError = null;
    return true;
  }

  const candidates = getUriCandidates(rawUri);

  for (let i = 0; i < candidates.length; i++) {
    const candidateUri = candidates[i];
    const masked = candidateUri.replace(/:([^@]+)@/, ':*****@');

    try {
      console.log(`🔄 [MongoDB] Connecting to MongoDB Atlas (${masked})...`);
      const conn = await mongoose.connect(candidateUri, {
        serverSelectionTimeoutMS: 6000,
      });

      isConnected = true;
      connectionError = null;
      // If a candidate succeeded that wasn't the raw URI, update process.env for subsequent reconnects
      process.env.MONGO_URI = candidateUri;

      console.log(`✅ [MongoDB] Connected successfully to host: ${conn.connection.host}`);
      return true;
    } catch (error) {
      const msg = error.message || 'Connection failed';
      console.warn(`[MongoDB] Candidate ${i + 1} attempt failed: ${msg}`);

      // If this was the last candidate, save the error
      if (i === candidates.length - 1) {
        isConnected = false;
        if (msg.includes('bad auth') || msg.includes('authentication failed')) {
          connectionError =
            'Authentication failed: Please check your Atlas Database User username and password. Do not include angle brackets <>.';
        } else {
          connectionError = msg;
        }
        console.error(`❌ [MongoDB] Connection error: ${connectionError}`);
      }
    }
  }

  return false;
};

/**
 * Returns current MongoDB connection status
 */
export const getMongoStatus = () => {
  return {
    isConnected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    error: connectionError,
    hasUri: Boolean(process.env.MONGO_URI && process.env.MONGO_URI.trim().length > 0),
  };
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('⚠️  [MongoDB] Disconnected from MongoDB Atlas');
});

mongoose.connection.on('connected', () => {
  isConnected = true;
  connectionError = null;
  console.log('✅ [MongoDB] Connection established to MongoDB Atlas');
});
