const express = require('express');
const {
  getMovies,
  getPopularMovies,
  getMovieDetails
} = require('../controllers/movieController');

const router = express.Router();

router.get('/', getMovies);
router.get('/popular', getPopularMovies);
router.get('/:id', getMovieDetails);

module.exports = router;