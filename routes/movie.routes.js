const express = require('express');
const { createMovie, getMovies } = require('../controllers/movie.controller');

const router = express.Router();

router.route('/').post(createMovie).get(getMovies);

module.exports = router;
