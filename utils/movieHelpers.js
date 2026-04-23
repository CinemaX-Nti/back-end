const mongoose = require("mongoose");

const GENRES = [
  "Action",
  "Comedy",
  "Drama",
  "Horror",
  "Sci-Fi",
  "Romance",
  "Thriller",
  "Animation",
  "Documentary",
];

// Pagination constants
const PAGINATION_LIMITS = {
  MIN_LIMIT: 1,
  MAX_LIMIT: 100,
  DEFAULT_LIMIT: 10,
};

/**
 * Helper function to check if user is authorized to modify a resource
 * @param {Object} createdBy - The creator's ID from the resource
 * @param {Object} userId - The current user's ID
 * @param {String} userRole - The current user's role
 * @returns {Boolean} true if authorized, false otherwise
 */
const isAuthorizedToModify = (createdBy, userId, userRole) => {
  return createdBy.toString() === userId.toString() || userRole === "admin";
};

/**
 * Helper function to validate and parse pagination parameters
 * @param {Object} query - Request query object
 * @returns {Object} {skip, limit, page}
 */
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

/**
 * Helper function to format pagination response
 * @param {Array} data - The data to return
 * @param {Number} total - Total count of documents
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @returns {Object} Formatted pagination object
 */
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

/**
 * Helper function to validate MongoDB ObjectId
 * @param {String} id - The ID to validate
 * @returns {Boolean} true if valid, false otherwise
 */
const isValidObjectId = (id) => {
  return mongoose.isValidObjectId(id);
};

/**
 * Helper function to build filter object with common validations
 * @param {Object} filterParams - Filter parameters
 * @returns {Object} Validated filter object
 */
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
    filter.genre = genre;
  }

  if (status && ["now_showing", "coming_soon", "archived"].includes(status)) {
    filter.status = status;
  }

  if (language) {
    filter.language = language;
  }

  // Rating filter
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
    if (Object.keys(filter.rating).length === 0) {
      delete filter.rating;
    }
  }

  // Duration filter
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
    if (Object.keys(filter.duration).length === 0) {
      delete filter.duration;
    }
  }

  return filter;
};

module.exports = {
  PAGINATION_LIMITS,
  isAuthorizedToModify,
  getPaginationParams,
  formatPaginatedResponse,
  isValidObjectId,
  buildMovieFilter,
  GENRES,
};
