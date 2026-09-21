const axios = require('axios');

const CACHE_TTL_MS = 5 * 60 * 1000;
const tmdbCache = new Map();

const tmdbClient = axios.create({
  baseURL: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3'
});

const serializeParams = (params) => Object.keys(params)
  .sort()
  .map((key) => `${key}=${JSON.stringify(params[key])}`)
  .join('&');

const cloneResponse = (data) => JSON.parse(JSON.stringify(data));

const request = async (path, params = {}, cacheParams = params) => {
  if (!process.env.TMDB_API_KEY) {
    const error = new Error('TMDB API key is not configured');
    error.statusCode = 500;
    throw error;
  }

  const cacheKey = `${path}?${serializeParams(cacheParams)}`;
  const cachedEntry = tmdbCache.get(cacheKey);
  if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
    console.log(`[TMDB Cache] HIT ${cacheKey}`);
    return cloneResponse(cachedEntry.data);
  }

  if (cachedEntry) tmdbCache.delete(cacheKey);
  console.log(`[TMDB Cache] MISS ${cacheKey}`);

  try {
    const response = await tmdbClient.get(path, {
      params: {
        ...params,
        api_key: process.env.TMDB_API_KEY
      }
    });

    tmdbCache.set(cacheKey, {
      data: cloneResponse(response.data),
      expiresAt: Date.now() + CACHE_TTL_MS
    });

    return response.data;
  } catch (error) {
    const statusCode = error.response?.status || 502;
    const responseData = error.response?.data;
    const tmdbMessage = responseData?.status_message || error.message || 'TMDB request failed';

    console.error('[TMDB] Request failed', {
      path,
      statusCode,
      message: tmdbMessage,
      data: responseData || null
    });

    const userMessage = statusCode === 401 || statusCode === 403
      ? 'The movie service rejected the server credentials.'
      : 'The movie service is temporarily unavailable.';
    const tmdbError = new Error(userMessage);
    tmdbError.statusCode = statusCode;
    throw tmdbError;
  }
};

const searchMovies = (query, page = 1, genre = '', sortBy = '') =>
  request('/search/movie', { query, page }, { query, genre, page, sort: sortBy });

const getPopularMovies = (page = 1) =>
  request('/movie/popular', { page }, {
    search: '',
    genre: '',
    sort: 'popularity.desc',
    page
  });

const discoverMovies = (page = 1, genre, sortBy) =>
  request('/discover/movie', {
    page,
    ...(genre ? { with_genres: genre } : {}),
    ...(sortBy ? { sort_by: sortBy } : {})
  }, {
    search: '',
    genre: genre || '',
    sort: sortBy || '',
    page
  });

const getMovieDetails = (movieId) => request(`/movie/${movieId}`);

module.exports = {
  searchMovies,
  getPopularMovies,
  discoverMovies,
  getMovieDetails
};