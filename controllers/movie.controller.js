const { Movie } = require("../models");

const createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json(movie);
  } catch (error) {
    next(error);
  }
};

const getMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.status(200).json(movies);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMovie,
  getMovies,
};
