const { Movie, ShowTime, Booking } = require("../models");
const {
  isAuthorizedToModify,
  getPaginationParams,
  formatPaginatedResponse,
  isValidObjectId,
  buildMovieFilter,
} = require("../utils/movieHelpers");

const createMovie = async (req, res, next) => {
  try {
    const {
      title,
      description,
      duration,
      genre,
      language,
      releaseDate,
      trailerUrl,
      posterUrl,
      rating,
      status,
    } = req.body;

    const movie = await Movie.create({
      title,
      description,
      duration,
      genre,
      language,
      releaseDate,
      trailerUrl,
      posterUrl,
      rating,
      status,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Movie created successfully",
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

const getMovies = async (req, res, next) => {
  try {
    const { skip, limit, page } = getPaginationParams(req.query);

    const movies = await Movie.find({ isDeleted: false })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");

    const total = await Movie.countDocuments({ isDeleted: false });

    res.status(200).json(formatPaginatedResponse(movies, total, page, limit));
  } catch (error) {
    next(error);
  }
};

const getMovieById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    const movie = await Movie.findOne({ _id: id, isDeleted: false }).populate(
      "createdBy",
      "name email",
    );

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

const updateMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    const movie = await Movie.findOne({ _id: id, isDeleted: false });

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Check authorization
    if (!isAuthorizedToModify(movie.createdBy, req.user._id, req.user.role)) {
      return res
        .status(403)
        .json({ message: "You can only update your own movies" });
    }

    const updatedMovie = await Movie.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      message: "Movie updated successfully",
      data: updatedMovie,
    });
  } catch (error) {
    next(error);
  }
};

const deleteMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    const movie = await Movie.findOne({ _id: id, isDeleted: false });

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Check authorization
    if (!isAuthorizedToModify(movie.createdBy, req.user._id, req.user.role)) {
      return res
        .status(403)
        .json({ message: "You can only delete your own movies" });
    }

    // Soft delete
    await Movie.findByIdAndUpdate(id, { isDeleted: true });

    res.status(200).json({
      success: true,
      message: "Movie deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getMoviesByGenre = async (req, res, next) => {
  try {
    const { genre } = req.query;
    const { skip, limit, page } = getPaginationParams(req.query);

    if (!genre || genre.trim() === "") {
      return res.status(400).json({ message: "Genre parameter is required" });
    }

    const normalizedGenre = genre.trim().toLowerCase();
    const movies = await Movie.find({
      genre: normalizedGenre,
      isDeleted: false,
    })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");

    const total = await Movie.countDocuments({
      genre: normalizedGenre,
      isDeleted: false,
    });

    res.status(200).json(formatPaginatedResponse(movies, total, page, limit));
  } catch (error) {
    next(error);
  }
};

const getMoviesByStatus = async (req, res, next) => {
  try {
    const { status } = req.query;
    const { skip, limit, page } = getPaginationParams(req.query);

    if (
      !status ||
      !["now_showing", "coming_soon", "archived"].includes(status)
    ) {
      return res
        .status(400)
        .json({ message: "Valid status parameter is required" });
    }

    const movies = await Movie.find({
      status: status,
      isDeleted: false,
    })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");

    const total = await Movie.countDocuments({
      status: status,
      isDeleted: false,
    });

    res.status(200).json(formatPaginatedResponse(movies, total, page, limit));
  } catch (error) {
    next(error);
  }
};

const searchMovies = async (req, res, next) => {
  try {
    const { search } = req.query;
    const { skip, limit, page } = getPaginationParams(req.query);

    if (!search || search.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const searchFilter = {
      isDeleted: false,
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
    };

    const movies = await Movie.find(searchFilter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");

    const total = await Movie.countDocuments(searchFilter);

    res.status(200).json(formatPaginatedResponse(movies, total, page, limit));
  } catch (error) {
    next(error);
  }
};

const filterMovies = async (req, res, next) => {
  try {
    const { skip, limit, page } = getPaginationParams(req.query);
    const filter = buildMovieFilter(req.query);

    const movies = await Movie.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");

    const total = await Movie.countDocuments(filter);

    res.status(200).json(formatPaginatedResponse(movies, total, page, limit));
  } catch (error) {
    next(error);
  }
};

const getPopularMovies = async (req, res, next) => {
  try {
    const { skip, limit, page } = getPaginationParams(req.query);

    const movies = await Movie.find({ isDeleted: false })
      .skip(skip)
      .limit(limit)
      .sort({ bookingCount: -1, rating: -1 })
      .populate("createdBy", "name email");

    const total = await Movie.countDocuments({ isDeleted: false });

    res.status(200).json(formatPaginatedResponse(movies, total, page, limit));
  } catch (error) {
    next(error);
  }
};

const getMovieShowTimes = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    const movie = await Movie.findOne({ _id: id, isDeleted: false });

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const showTimes = await ShowTime.find({ movieId: id })
      .sort({ startTime: 1 })
      .populate("hallId", "name");

    res.status(200).json({
      success: true,
      data: {
        movie: movie,
        showTimes: showTimes,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMovieStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    const movie = await Movie.findOne({ _id: id, isDeleted: false });

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const showTimes = await ShowTime.find({ movieId: id });
    const showTimeIds = showTimes.map((st) => st._id);

    const bookings = await Booking.find({
      showTimeId: { $in: showTimeIds },
    });

    const totalRevenue = bookings.reduce(
      (sum, booking) => sum + (booking.totalAmount || 0),
      0,
    );

    res.status(200).json({
      success: true,
      data: {
        movie: movie,
        totalShowTimes: showTimes.length,
        totalBookings: bookings.length,
        totalRevenue: totalRevenue,
        averageBookingsPerShow: Math.round(
          bookings.length / (showTimes.length || 1),
        ),
      },
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
  getMoviesByGenre,
  getMoviesByStatus,
  searchMovies,
  filterMovies,
  getPopularMovies,
  getMovieShowTimes,
  getMovieStats,
};
