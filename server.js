
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
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB Atlas
connectDB().catch((err) => {
  console.warn('MongoDB connection error:', err?.message || err);
});

// System status API
app.get('/api/status', (_req, res) => {
  const mongo = getMongoStatus();
  const weatherKey = process.env.WEATHER_API_KEY;

  res.json({
    appName: 'SkySync',
    status: 'online',
    timestamp: new Date().toISOString(),
    mongo: {
      connected: mongo.isConnected,
      hasUri: mongo.hasUri,
    },
    weather: {
      hasKey: Boolean(
        weatherKey &&
        weatherKey.trim() !== '' &&
        weatherKey !== 'your_openweathermap_api_key_here'
      ),
    },
  });
});

// Configuration testing is allowed only locally.
// Public visitors cannot change server credentials.
if (!isProduction) {
  app.post('/api/config/test-connection', async (req, res) => {
    try {
      const { mongoUri, weatherKey } = req.body;

      if (mongoUri && typeof mongoUri === 'string' && mongoUri.trim()) {
        process.env.MONGO_URI = mongoUri.trim();

        const connected = await connectDB();

        if (!connected) {
          const status = getMongoStatus();

          return res.status(400).json({
            success: false,
            message: status.error || 'MongoDB connection failed.',
          });
        }
      }

      if (weatherKey && typeof weatherKey === 'string' && weatherKey.trim()) {
        process.env.WEATHER_API_KEY = weatherKey.trim();
      }

      const mongo = getMongoStatus();

      return res.json({
        success: true,
        message: 'Configuration updated successfully.',
        mongo: {
          connected: mongo.isConnected,
          hasUri: mongo.hasUri,
        },
        weather: {
          hasKey: Boolean(process.env.WEATHER_API_KEY),
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Configuration update failed.',
      });
    }
  });
} else {
  app.post('/api/config/test-connection', (_req, res) => {
    return res.status(403).json({
      success: false,
      message: 'Configuration changes are disabled on the public server.',
    });
  });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/history', historyRoutes);

// Frontend setup
const setupFrontend = async () => {
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
    console.log(`SkySync Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

setupFrontend().catch((err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});
