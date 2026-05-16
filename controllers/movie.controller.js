const { Movie, ShowTime, Booking } = require("../models");
const {
  getPaginationParams,
  formatPaginatedResponse,
  isValidObjectId,
  buildMovieFilter,
} = require("../utils/movieHelpers");

// Fields that are allowed when creating/updating a movie
const ALLOWED_MOVIE_FIELDS = [
  "title",
  "description",
  "duration",
  "genre",
  "language",
  "releaseDate",
  "trailerUrl",
  "posterUrl",
  "rating",
  "ageRating",
  "status",
];

// Sanitize request body to only allow specific fields
const sanitizeMovieBody = (body) => {
  const sanitized = {};
  ALLOWED_MOVIE_FIELDS.forEach((field) => {
    if (body[field] !== undefined) {
      sanitized[field] = body[field];
    }
  });
  return sanitized;
};

// Helper for consistent error responses
const errorResponse = (res, status, message) => {
  return res.status(status).json({ success: false, message });
};

// POST /api/movies - Create a new movie (Admin only)
const createMovie = async (req, res, next) => {
  try {
    // Sanitize body to prevent injection of protected fields
    const movieData = sanitizeMovieBody(req.body);
    const movie = await Movie.create({
      ...movieData,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Movie created successfully",
      data: movie,
    });
  } catch (error) {
    // Handle duplicate title error from our pre-save hook
    if (error.message === "Movie title already exists" || error.code === 11000) {
      return errorResponse(res, 409, "Movie title already exists (titles must be unique, case-insensitive)");
    }
    next(error);
  }
};

// GET /api/movies - Get all movies with filters and pagination
const getMovies = async (req, res, next) => {
  try {
    const { skip, limit, page } = getPaginationParams(req.query);
    const { search, popular } = req.query;

    // Build base filter using helper (handles genre, status, language, rating, duration)
    let filter = buildMovieFilter(req.query);

    // Add text search if provided (searches title and description)
    if (search?.trim()) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Sort by rating or newest first
    const sort = popular === "true"
      ? { rating: -1, createdAt: -1 }
      : { createdAt: -1 };

    // Fetch movies with pagination
    const [movies, total] = await Promise.all([
      Movie.find(filter)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .populate("createdBy", "name email")
        .lean(),
      Movie.countDocuments(filter),
    ]);

    res.status(200).json(formatPaginatedResponse(movies, total, page, limit));
  } catch (error) {
    next(error);
  }
};

// GET /api/movies/:id - Get single movie by ID
const getMovieById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, "Invalid movie ID");
    }

    const movie = await Movie.findOne({ _id: id, isDeleted: false })
      .populate("createdBy", "name email")
      .lean();

    if (!movie) {
      return errorResponse(res, 404, "Movie not found");
    }

    res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/movies/:id - Update movie (Admin only)
// Uses save() instead of findByIdAndUpdate to trigger pre-save hook for title uniqueness
const updateMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, "Invalid movie ID");
    }

    // Find the movie first to ensure it exists
    const movie = await Movie.findOne({ _id: id, isDeleted: false });

    if (!movie) {
      return errorResponse(res, 404, "Movie not found");
    }

    // Only apply allowed fields - prevents injection of protected fields
    const updates = sanitizeMovieBody(req.body);
    Object.keys(updates).forEach((field) => {
      movie[field] = updates[field];
    });

    // Save to trigger pre-save hook (handles title uniqueness)
    await movie.save();

    // Re-fetch with populated createdBy
    const updatedMovie = await Movie.findById(id)
      .populate("createdBy", "name email")
      .lean();

    res.status(200).json({
      success: true,
      message: "Movie updated successfully",
      data: updatedMovie,
    });
  } catch (error) {
    // Handle duplicate title error from our pre-save hook
    if (error.message === "Movie title already exists" || error.code === 11000) {
      return errorResponse(res, 409, "Movie title already exists (titles must be unique, case-insensitive)");
    }
    next(error);
  }
};

// DELETE /api/movies/:id - Soft delete movie (Admin only)
const deleteMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, "Invalid movie ID");
    }

    const movie = await Movie.findOne({ _id: id, isDeleted: false });

    if (!movie) {
      return errorResponse(res, 404, "Movie not found");
    }

    // Soft delete - we keep the record but mark it as deleted
    movie.isDeleted = true;
    await movie.save();

    res.status(200).json({
      success: true,
      message: "Movie deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/movies/:id/showtimes - Get all showtimes for a movie
const getMovieShowTimes = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, "Invalid movie ID");
    }

    // Check if movie exists and is not deleted
    const movie = await Movie.findOne({ _id: id, isDeleted: false }).lean();

    if (!movie) {
      return errorResponse(res, 404, "Movie not found");
    }

    // Get all showtimes for this movie, sorted by start time
    const showTimes = await ShowTime.find({ movieId: id })
      .sort({ startTime: 1 })
      .populate("hallId", "name")
      .lean();

    res.status(200).json({
      success: true,
      data: { movie, showTimes },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/movies/:id/stats - Get booking stats for a movie
const getMovieStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, "Invalid movie ID");
    }

    // Check if movie exists and is not deleted
    const movie = await Movie.findOne({ _id: id, isDeleted: false }).lean();

    if (!movie) {
      return errorResponse(res, 404, "Movie not found");
    }

    // Get all showtimes for this movie
    const showTimes = await ShowTime.find({ movieId: id }).lean();
    const showTimeIds = showTimes.map((st) => st._id);

    // Get all bookings for those showtimes
    const bookings = await Booking.find({ showTimeId: { $in: showTimeIds } }).lean();

    // Calculate total revenue
    const totalRevenue = bookings.reduce(
      (sum, booking) => sum + (booking.totalAmount || 0),
      0,
    );

    res.status(200).json({
      success: true,
      data: {
        movie,
        totalShowTimes: showTimes.length,
        totalBookings: bookings.length,
        totalRevenue,
        averageBookingsPerShow: Math.round(bookings.length / (showTimes.length || 1)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/movies/:id/restore - Restore a soft-deleted movie (Admin only)
const restoreMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, "Invalid movie ID");
    }

    // Find the movie (including deleted ones)
    const movie = await Movie.findById(id);

    if (!movie) {
      return errorResponse(res, 404, "Movie not found");
    }

    // Make sure it's actually deleted
    if (!movie.isDeleted) {
      return errorResponse(res, 400, "Movie is not deleted");
    }

    // Restore the movie
    movie.isDeleted = false;
    await movie.save();

    // Re-fetch with populated createdBy
    const restoredMovie = await Movie.findById(id)
      .populate("createdBy", "name email")
      .lean();

    res.status(200).json({
      success: true,
      message: "Movie restored successfully",
      data: restoredMovie,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/movies/deleted - Get all soft-deleted movies (Admin only)
const getDeletedMovies = async (req, res, next) => {
  try {
    const { skip, limit, page } = getPaginationParams(req.query);

    // Fetch deleted movies sorted by when they were last updated (deleted)
    const [movies, total] = await Promise.all([
      Movie.find({ isDeleted: true })
        .skip(skip)
        .limit(limit)
        .sort({ updatedAt: -1 })
        .populate("createdBy", "name email")
        .lean(),
      Movie.countDocuments({ isDeleted: true }),
    ]);

    res.status(200).json(formatPaginatedResponse(movies, total, page, limit));
  } catch (error) {
    next(error);
  }
};

// POST /api/movies/bulk/delete - Soft delete multiple movies at once (Admin only)
const bulkDeleteMovies = async (req, res, next) => {
  try {
    const { movieIds } = req.body;

    if (!Array.isArray(movieIds) || movieIds.length === 0) {
      return errorResponse(res, 400, "Movie IDs array is required");
    }

    // Validate all IDs
    const invalidIds = movieIds.filter((id) => !isValidObjectId(id));
    if (invalidIds.length > 0) {
      return errorResponse(res, 400, "Invalid movie IDs provided");
    }

    // Soft delete all valid movies
    const result = await Movie.updateMany(
      { _id: { $in: movieIds }, isDeleted: false },
      { isDeleted: true },
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} movies deleted successfully`,
      data: { deleted: result.modifiedCount, attempted: movieIds.length },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMovie,
  getMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
  restoreMovie,
  getDeletedMovies,
  bulkDeleteMovies,
  getMovieShowTimes,
  getMovieStats,
};
