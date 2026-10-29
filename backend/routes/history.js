import { Router } from 'express';
import mongoose from 'mongoose';
import { SearchHistory } from '../models/SearchHistory.js';
import { authenticateToken } from '../middleware/auth.js';
import { getMongoStatus } from '../config/db.js';

const router = Router();

// All history routes require authentication
router.use(authenticateToken);

// GET /api/history - Get recent searches for authenticated user
router.get('/', async (req, res) => {
  try {
    const mongoStatus = getMongoStatus();
    if (!mongoStatus.isConnected) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB Atlas is not connected. Search history is unavailable.',
        data: [],
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Retrieve last 15 searches for this user
    const searches = await SearchHistory.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ searchedAt: -1 })
      .limit(15)
      .lean();

    const formatted = searches.map((item) => ({
      id: item._id.toString(),
      city: item.city,
      country: item.country || '',
      searchedAt: item.searchedAt,
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error('Fetch search history error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch search history.',
    });
  }
});

// POST /api/history - Save a city search
router.post('/', async (req, res) => {
  try {
    const mongoStatus = getMongoStatus();
    if (!mongoStatus.isConnected) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB Atlas is not connected. Search could not be stored.',
      });
    }

    const userId = req.user?.id;
    const { city, country } = req.body;

    if (!city || typeof city !== 'string' || city.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'City name is required to save search history.',
      });
    }

    const trimmedCity = city.trim();
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Remove any existing identical search to keep recent list clean and unique
    await SearchHistory.deleteMany({
      userId: userObjectId,
      city: { $regex: new RegExp(`^${trimmedCity}$`, 'i') },
    });

    const newEntry = await SearchHistory.create({
      userId: userObjectId,
      city: trimmedCity,
      country: country || '',
      searchedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: 'Search history recorded.',
      data: {
        id: newEntry._id.toString(),
        city: newEntry.city,
        country: newEntry.country,
        searchedAt: newEntry.searchedAt,
      },
    });
  } catch (error) {
    console.error('Save search history error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to save search history.',
    });
  }
});

// DELETE /api/history/:id - Delete a specific search entry
router.delete('/:id', async (req, res) => {
  try {
    const mongoStatus = getMongoStatus();
    if (!mongoStatus.isConnected) {
      return res.status(503).json({ success: false, message: 'Database not connected.' });
    }

    const { id } = req.params;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid search ID.' });
    }

    await SearchHistory.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    });

    return res.status(200).json({
      success: true,
      message: 'Search entry deleted.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete search entry.',
    });
  }
});

// DELETE /api/history - Clear all search history for authenticated user
router.delete('/', async (req, res) => {
  try {
    const mongoStatus = getMongoStatus();
    if (!mongoStatus.isConnected) {
      return res.status(503).json({ success: false, message: 'Database not connected.' });
    }

    const userId = req.user?.id;
    await SearchHistory.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });

    return res.status(200).json({
      success: true,
      message: 'All search history cleared.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to clear search history.',
    });
  }
});

export default router;
