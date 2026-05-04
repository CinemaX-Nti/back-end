const mongoose = require("mongoose");

// Pagination limits - used across the movie module
const PAGINATION_LIMITS = {
  MIN_LIMIT: 1,
  MAX_LIMIT: 100,
  DEFAULT_LIMIT: 10,
};

// Parse and validate pagination params from query string
// Returns { skip, limit, page } ready for mongoose queries
const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(
    PAGINATION_LIMITS.MAX_LIMIT,
    Math.max(
      PAGINATION_LIMITS.MIN_LIMIT,
      parseInt(query.limit) || PAGINATION_LIMITS.DEFAULT_LIMIT,
    ),
  );
  const skip = (page - 1) * limit;
  return { skip, limit, page };
};

// Format response for paginated endpoints
// Keeps response structure consistent across the API
const formatPaginatedResponse = (data, total, page, limit) => {
  return {
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

// Quick check if a string is a valid MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.isValidObjectId(id);
};

// Build a mongoose filter object from query params
// Handles genre, status, language, rating range, and duration range
const buildMovieFilter = ({
  genre,
  status,
  language,
  minRating,
  maxRating,
  minDuration,
  maxDuration,
} = {}) => {
  const filter = { isDeleted: false };

  if (genre) {
    filter.genre = genre.toLowerCase().trim();
  }

  if (status && ["now_showing", "coming_soon", "archived"].includes(status)) {
    filter.status = status;
  }

  if (language) {
    filter.language = language.trim();
  }

  // Rating range filter (0-10)
  if (minRating !== undefined || maxRating !== undefined) {
    filter.rating = {};
    if (minRating !== undefined) {
      const min = parseFloat(minRating);
      if (!isNaN(min) && min >= 0 && min <= 10) {
        filter.rating.$gte = min;
      }
    }
    if (maxRating !== undefined) {
      const max = parseFloat(maxRating);
      if (!isNaN(max) && max >= 0 && max <= 10) {
        filter.rating.$lte = max;
      }
    }
    // Clean up empty rating filter
    if (Object.keys(filter.rating).length === 0) {
      delete filter.rating;
    }
  }

  // Duration range filter (in minutes)
  if (minDuration !== undefined || maxDuration !== undefined) {
    filter.duration = {};
    if (minDuration !== undefined) {
      const min = parseInt(minDuration);
      if (!isNaN(min) && min > 0) {
        filter.duration.$gte = min;
      }
    }
    if (maxDuration !== undefined) {
      const max = parseInt(maxDuration);
      if (!isNaN(max) && max > 0) {
        filter.duration.$lte = max;
      }
    }
    // Clean up empty duration filter
    if (Object.keys(filter.duration).length === 0) {
      delete filter.duration;
    }
  }

  return filter;
};

module.exports = {
  PAGINATION_LIMITS,
  getPaginationParams,
  formatPaginatedResponse,
  isValidObjectId,
  buildMovieFilter,
  GENRES,
};
