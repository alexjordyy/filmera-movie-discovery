const WISHLIST_API_URL = 'http://localhost:5000/api/wishlist';

async function wishlistRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Unable to update your wishlist right now.');
  }

  return data;
}

export function fetchWishlist() {
  return wishlistRequest(WISHLIST_API_URL);
}

export function addWishlistMovie(movie) {
  return wishlistRequest(WISHLIST_API_URL, {
    method: 'POST',
    body: JSON.stringify({
      movieId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path || '',
      releaseDate: movie.release_date || '',
      rating: typeof movie.vote_average === 'number' ? movie.vote_average : null
    })
  });
}

export function removeWishlistMovie(movieId) {
  return wishlistRequest(`${WISHLIST_API_URL}/${encodeURIComponent(movieId)}`, {
    method: 'DELETE'
  });
}