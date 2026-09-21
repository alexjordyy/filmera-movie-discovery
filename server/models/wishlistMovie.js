const mongoose = require('mongoose');

const wishlistMovieSchema = new mongoose.Schema({
  movieId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  title: { type: String, required: true, trim: true },
  posterPath: { type: String, default: '' },
  releaseDate: { type: String, default: '' },
  rating: { type: Number, default: null },
  addedAt: { type: Date, default: Date.now }
}, { versionKey: false });

module.exports = mongoose.model('WishlistMovie', wishlistMovieSchema);