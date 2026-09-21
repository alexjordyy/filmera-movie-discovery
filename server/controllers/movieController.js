const tmdbService = require('../services/tmdbService');

const SORT_OPTIONS = new Set([
  'popularity.desc',
  'vote_average.desc',
  'primary_release_date.desc'
]);

const isValidGenre = (genre) => /^\d+$/.test(String(genre || ''));

const sortResults = (results, sortBy) => {
  if (sortBy === 'vote_average.desc') {
    return results.sort((first, second) => second.vote_average - first.vote_average);
  }

  if (sortBy === 'primary_release_date.desc') {
    return results.sort((first, second) =>
      String(second.release_date || '').localeCompare(String(first.release_date || ''))
    );
  }

  return results.sort((first, second) => second.popularity - first.popularity);
};

const getMovies = async (req, res) => {
  const { search, page = 1, genre, sort = 'popularity.desc' } = req.query;
  const pageNumber = Number(page) || 1;
  const sortBy = SORT_OPTIONS.has(sort) ? sort : 'popularity.desc';
  const genreId = isValidGenre(genre) ? String(genre) : '';
  let movies;

  if (search) {
    movies = await tmdbService.searchMovies(search, pageNumber, genreId, sortBy);
    movies.results = Array.isArray(movies.results) ? movies.results : [];
    if (genreId) {
      movies.results = movies.results.filter((movie) =>
        movie.genre_ids?.includes(Number(genreId))
      );
    }
    movies.results = sortResults(movies.results, sortBy);
  } else if (genreId || sortBy !== 'popularity.desc') {
    movies = await tmdbService.discoverMovies(pageNumber, genreId, sortBy);
  } else {
    movies = await tmdbService.getPopularMovies(pageNumber);
  }

  res.json(movies);
};

const getPopularMovies = async (req, res) => {
  const movies = await tmdbService.getPopularMovies(Number(req.query.page) || 1);
  res.json(movies);
};

const getMovieDetails = async (req, res) => {
  const movie = await tmdbService.getMovieDetails(req.params.id);
  res.json(movie);
};

module.exports = {
  getMovies,
  getPopularMovies,
  getMovieDetails
};