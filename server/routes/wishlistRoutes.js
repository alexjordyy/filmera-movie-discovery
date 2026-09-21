const express = require('express');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist
} = require('../controllers/wishlistController');

const router = express.Router();

router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:movieId', removeFromWishlist);

module.exports = router;