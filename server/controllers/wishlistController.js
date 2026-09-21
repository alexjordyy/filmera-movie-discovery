const WishlistMovie = require('../models/wishlistMovie');
const { isDatabaseReady } = require('../config/database');

const databaseError = () => {
  const error = new Error('Wishlist database is unavailable');
  error.statusCode = 503;
  return error;
};

const validateMovieId = (movieId) => {
  const parsedId = Number(movieId);
  return Number.isSafeInteger(parsedId) && parsedId > 0 ? parsedId : null;
};

const getWishlist = async (req, res) => {
  if (!isDatabaseReady()) throw databaseError();
  const movies = await WishlistMovie.find().sort({ addedAt: -1 }).lean();
  res.json(movies);
};

const addToWishlist = async (req, res) => {
  const movieId = validateMovieId(req.body.movieId);
  if (!movieId) {
    return res.status(400).json({ status: 'error', message: 'A valid movieId is required' });
  }

  const { title, posterPath = '', releaseDate = '', rating = null } = req.body;
  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ status: 'error', message: 'Movie title is required' });
  }
  if (!isDatabaseReady()) throw databaseError();

  try {
    const movie = await WishlistMovie.create({ movieId, title, posterPath, releaseDate, rating });
    return res.status(201).json(movie);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ status: 'error', message: 'Movie is already in the wishlist' });
    }
    throw error;
  }
};

const removeFromWishlist = async (req, res) => {
  const movieId = validateMovieId(req.params.movieId);
  if (!movieId) {
    return res.status(400).json({ status: 'error', message: 'A valid movieId is required' });
  }
  if (!isDatabaseReady()) throw databaseError();

  const deletedMovie = await WishlistMovie.findOneAndDelete({ movieId });
  if (!deletedMovie) {
    return res.status(404).json({ status: 'error', message: 'Movie was not found in the wishlist' });
  }

  return res.json({ movieId, message: 'Movie removed from wishlist' });
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };