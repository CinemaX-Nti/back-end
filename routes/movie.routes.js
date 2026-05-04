const express = require("express");
const {
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
} = require("../controllers/movie.controller");
const { auth, isAdmin } = require("../middleware/auth.middleware");
const { validation } = require("../middleware/validation.middleware");
const {
  createMovieSchema,
  updateMovieSchema,
  filterMoviesSchema,
  bulkDeleteMoviesSchema,
} = require("../validations/movie.validation");

const router = express.Router();

// Admin routes - must come before /:id routes to avoid route conflicts
router.post("/", auth, isAdmin, validation(createMovieSchema), createMovie);
router.post("/bulk/delete", auth, isAdmin, validation(bulkDeleteMoviesSchema), bulkDeleteMovies);
router.get("/deleted", auth, isAdmin, getDeletedMovies);

// Sub-resource routes - these also need to come before /:id
router.get("/:id/showtimes", getMovieShowTimes);
router.get("/:id/stats", getMovieStats);

// Public routes
router.get("/", validation(filterMoviesSchema), getMovies);
router.get("/:id", getMovieById);

// Admin update/delete routes
router.patch("/:id", auth, isAdmin, validation(updateMovieSchema), updateMovie);
router.delete("/:id", auth, isAdmin, deleteMovie);
router.patch("/:id/restore", auth, isAdmin, restoreMovie);

module.exports = router;
