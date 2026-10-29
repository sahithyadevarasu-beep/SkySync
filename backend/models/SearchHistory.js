import mongoose from 'mongoose';

const { Schema } = mongoose;

const SearchHistorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for search history'],
      index: true,
    },
    city: {
      type: String,
      required: [true, 'City name is required'],
      trim: true,
    },
    country: {
      type: String,
      default: '',
      trim: true,
    },
    searchedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for quick retrieval of user's latest searches
SearchHistorySchema.index({ userId: 1, searchedAt: -1 });

export const SearchHistory =
  mongoose.models.SearchHistory ||
  mongoose.model('SearchHistory', SearchHistorySchema);
