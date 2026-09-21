const MOVIES_API_URL = 'http://localhost:5000/api/movies';

async function fetchMovies(url, signal) {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    let message = 'Unable to load movies right now.';
    try {
      const data = await response.json();
      if (data.message) message = data.message;
    } catch {
      // Keep the generic message when the backend returns a non-JSON error.
    }
    throw new Error(message);
  }

  const data = await response.json();
  return {
    movies: Array.isArray(data.results) ? data.results : [],
    page: Number(data.page) || 1,
    totalPages: Number(data.total_pages) || 1,
    totalResults: Number(data.total_results) || 0
  };
}

export function fetchPopularMovies(signal) {
  return fetchMovies(`${MOVIES_API_URL}?page=1`, signal);
}

export function fetchMovieList({ query = '', genre = '', sort = 'popularity.desc', page = 1, signal } = {}) {
  const params = new URLSearchParams({ page: String(page), sort });
  if (query) params.set('search', query);
  if (genre) params.set('genre', genre);
  return fetchMovies(`${MOVIES_API_URL}?${params.toString()}`, signal);
}

export function searchMovies(query, page = 1) {
  return fetchMovieList({ query, page });
}

export async function fetchMovieDetails(movieId) {
  const response = await fetch(`${MOVIES_API_URL}/${encodeURIComponent(movieId)}`);

  if (!response.ok) {
    throw new Error('Unable to load this movie right now.');
  }

  return response.json();
}