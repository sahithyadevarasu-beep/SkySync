
import { Router } from 'express';
import mongoose from 'mongoose';
import { SearchHistory } from '../models/SearchHistory.js';
import { authenticateToken } from '../middleware/auth.js';
import { getMongoStatus } from '../config/db.js';

const router = Router();

// All history routes require authentication
router.use(authenticateToken);

// GET: Get recent searches
router.get('/', async (req, res) => {
  try {
    if (!getMongoStatus().isConnected) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected.',
        data: [],
      });
    }

    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized.',
      });
    }

    const searches = await SearchHistory.find({ userId })
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
    console.error('Fetch history error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch search history.',
    });
  }
});

// POST: Save a city search
router.post('/', async (req, res) => {
  try {
    if (!getMongoStatus().isConnected) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected.',
      });
    }

    const userId = req.user?.id;
    const { city, country } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized.',
      });
    }

    if (!city || typeof city !== 'string' || !city.trim()) {
      return res.status(400).json({
        success: false,
        message: 'City name is required.',
      });
    }

    const trimmedCity = city.trim();

    await SearchHistory.deleteMany({
      userId,
      city: trimmedCity
    });

    const newEntry = await SearchHistory.create({
      userId,
      city: trimmedCity,
      country: typeof country === 'string' ? country.trim() : '',
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
    console.error('Save history error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to save search history.',
    });
  }
});

// DELETE: Delete a specific search
router.delete('/:id', async (req, res) => {
  try {
    if (!getMongoStatus().isConnected) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected.',
      });
    }

    const { id } = req.params;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid search ID.',
      });
    }

    await SearchHistory.findOneAndDelete({
      _id: id,
      userId,
    });

    return res.status(200).json({
      success: true,
      message: 'Search entry deleted.',
    });

  } catch (error) {
    console.error('Delete history error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to delete search entry.',
    });
  }
});

// DELETE: Clear all search history
router.delete('/', async (req, res) => {
  try {
    if (!getMongoStatus().isConnected) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected.',
      });
    }

    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized.',
      });
    }

    await SearchHistory.deleteMany({ userId });

    return res.status(200).json({
      success: true,
      message: 'All search history cleared.',
    });

  } catch (error) {
    console.error('Clear history error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to clear search history.',
    });
  }
});

export default router;
