import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, getMongoStatus } from './backend/config/db.js';
import authRoutes from './backend/routes/auth.js';
import weatherRoutes from './backend/routes/weather.js';
import historyRoutes from './backend/routes/history.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB Atlas
connectDB().catch((err) => {
  console.warn('Initial MongoDB connection attempt error:', err?.message || err);
});

// System Status and Configuration API
app.get('/api/status', (_req, res) => {
  const mongo = getMongoStatus();
  const weatherKey = process.env.WEATHER_API_KEY;
  const hasWeatherKey = Boolean(
    weatherKey && weatherKey.trim() !== '' && weatherKey !== 'your_openweathermap_api_key_here'
  );

  res.json({
    appName: 'SkySync',
    status: 'online',
    timestamp: new Date().toISOString(),
    mongo: {
      connected: mongo.isConnected,
      hasUri: mongo.hasUri,
      error: mongo.error,
    },
    weather: {
      hasKey: hasWeatherKey,
    },
  });
});

// Endpoint allowing student to test/update environment values in dev runtime
app.post('/api/config/test-connection', async (req, res) => {
  const { mongoUri, weatherKey } = req.body;

  if (mongoUri && typeof mongoUri === 'string' && mongoUri.trim() !== '') {
    process.env.MONGO_URI = mongoUri.trim();
    const connected = await connectDB();
    if (!connected) {
      const status = getMongoStatus();
      return res.status(400).json({
        success: false,
        message: status.error || 'Failed to connect to MongoDB Atlas with provided URI.',
      });
    }
  }

  if (weatherKey && typeof weatherKey === 'string' && weatherKey.trim() !== '') {
    process.env.WEATHER_API_KEY = weatherKey.trim();
  }

  const mongo = getMongoStatus();
  return res.json({
    success: true,
    message: 'Configuration applied to runtime successfully.',
    mongo: {
      connected: mongo.isConnected,
      hasUri: mongo.hasUri,
    },
    weather: {
      hasKey: Boolean(process.env.WEATHER_API_KEY && process.env.WEATHER_API_KEY.trim() !== ''),
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/history', historyRoutes);

// Setup Frontend serving (Vite middleware in dev, static dist in production)
const setupFrontend = async () => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SkySync Server running at http://localhost:${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

setupFrontend().catch((err) => {
  console.error('Fatal error setting up server:', err);
  process.exit(1);
});
