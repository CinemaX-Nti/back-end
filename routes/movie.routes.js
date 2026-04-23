const express = require("express");
const {
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
} = require("../controllers/movie.controller");
const { auth, isAdmin } = require("../middleware/auth.middleware");
const { validation } = require("../middleware/validation.middleware");
const {
  createMovieSchema,
  updateMovieSchema,
  filterMoviesSchema,
  searchMoviesSchema,
} = require("../validations/movie.validation");

const router = express.Router();

// Admin only routes - Create
router.post("/", auth, isAdmin, validation(createMovieSchema), createMovie);

// Public routes - Specific paths first
router.get("/search", validation(searchMoviesSchema), searchMovies);
router.get("/filter", validation(filterMoviesSchema), filterMovies);
router.get("/genre", getMoviesByGenre);
router.get("/status", getMoviesByStatus);
router.get("/popular", getPopularMovies);

// Public routes - Sub-resources for ID
router.get("/:id/showtimes", getMovieShowTimes);
router.get("/:id/stats", getMovieStats);

// Public routes - General list
router.get("/", getMovies);

// Public routes - Get by ID
router.get("/:id", getMovieById);

// Admin only routes - Update and Delete
router.patch("/:id", auth, isAdmin, validation(updateMovieSchema), updateMovie);
router.delete("/:id", auth, isAdmin, deleteMovie);

module.exports = router;
