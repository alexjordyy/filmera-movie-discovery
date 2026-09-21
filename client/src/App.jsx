import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Link, Route, Routes, useSearchParams } from 'react-router-dom';
import MovieCard from './components/MovieCard';
import MovieDetails from './components/MovieDetails';
import WishlistView from './components/WishlistView';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { useWishlist } from './context/useWishlist';
import { fetchMovieList } from './services/movieService';
import './App.css';

const GENRES = [
  ['28', 'Action'], ['12', 'Adventure'], ['16', 'Animation'], ['35', 'Comedy'],
  ['80', 'Crime'], ['99', 'Documentary'], ['18', 'Drama'], ['10751', 'Family'],
  ['14', 'Fantasy'], ['27', 'Horror'], ['9648', 'Mystery'], ['10749', 'Romance'],
  ['878', 'Science Fiction'], ['53', 'Thriller']
];

const SORT_OPTIONS = [
  ['popularity.desc', 'Popularity'],
  ['vote_average.desc', 'Rating'],
  ['primary_release_date.desc', 'Release Date']
];

function SearchForm({ initialQuery, onSubmit }) {
  const [searchInput, setSearchInput] = useState(initialQuery);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(searchInput.trim());
  };

  return (
    <form className="search-form" onSubmit={handleSubmit} role="search">
      <label className="sr-only" htmlFor="movie-search">Search movies</label>
      <input
        id="movie-search"
        type="search"
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        placeholder="Search movies"
      />
      <button type="submit">Search</button>
    </form>
  );
}

function MovieList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const requestVersion = useRef(0);

  const listQuery = searchParams.get('search') || '';
  const listGenre = searchParams.get('genre') || '';
  const listSort = searchParams.get('sort') || 'popularity.desc';
  const listPage = Math.max(Number(searchParams.get('page')) || 1, 1);
  const listSearch = searchParams.toString();

  const applyMovieResponse = (movieResponse) => {
    setMovies(movieResponse.movies);
    setCurrentPage(movieResponse.page);
    setTotalPages(movieResponse.totalPages);
    setTotalResults(movieResponse.totalResults);
  };

  useEffect(() => {
    const nextRequestVersion = ++requestVersion.current;

    Promise.resolve()
      .then(() => {
        setIsLoading(true);
        setError('');
        return fetchMovieList({ query: listQuery, genre: listGenre, sort: listSort, page: listPage });
      })
      .then((nextMovies) => {
        if (nextRequestVersion === requestVersion.current) applyMovieResponse(nextMovies);
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError' && nextRequestVersion === requestVersion.current) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (nextRequestVersion === requestVersion.current) setIsLoading(false);
      });
  }, [listSearch, listQuery, listGenre, listSort, listPage]);

  const updateListUrl = (query, selectedGenre, selectedSort, page) => {
    const nextParams = new URLSearchParams();
    if (query) nextParams.set('search', query);
    if (selectedGenre) nextParams.set('genre', selectedGenre);
    if (selectedSort !== 'popularity.desc') nextParams.set('sort', selectedSort);
    if (page > 1) nextParams.set('page', String(page));
    setSearchParams(nextParams);
  };

  const handleSearch = (query) => {
    updateListUrl(query, listGenre, listSort, 1);
  };

  const handleGenreChange = (event) => {
    const nextGenre = event.target.value;
    updateListUrl(listQuery, nextGenre, listSort, 1);
  };

  const handleSortChange = (event) => {
    const nextSort = event.target.value;
    updateListUrl(listQuery, listGenre, nextSort, 1);
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === currentPage || isLoading) return;
    updateListUrl(listQuery, listGenre, listSort, nextPage);
  };

  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">The weekend watchlist, curated</p>
        <h1 id="page-title">Find your next<br /><em>favorite film.</em></h1>
        <p className="intro-copy">A fresh selection of what audiences are watching now.</p>
        <SearchForm key={listQuery} initialQuery={listQuery} onSubmit={handleSearch} />
        <div className="browse-controls" aria-label="Movie filters">
          <label>
            Genre
            <select value={listGenre} onChange={handleGenreChange}>
              <option value="">All genres</option>
              {GENRES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>
            Sort by
            <select value={listSort} onChange={handleSortChange}>
              {SORT_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="catalog" aria-labelledby="popular-title">
        <div className="section-heading">
          <h2 id="popular-title">{listQuery ? `Results for “${listQuery}”` : 'Popular right now'}</h2>
          <span className="section-index">{totalResults.toLocaleString()} results</span>
        </div>

        {isLoading && <div className="state-message" role="status"><span className="loader" aria-hidden="true" /><p>{listQuery ? 'Searching the archive...' : 'Gathering the latest films...'}</p></div>}
        {!isLoading && error && <div className="state-message state-error" role="alert"><p>{error}</p><span>Make sure the backend is running on port 5000.</span></div>}
        {!isLoading && !error && movies.length === 0 && <div className="state-message" role="status"><p>{listQuery ? `No movies found for “${listQuery}”.` : 'No movies found.'}</p></div>}
        {!isLoading && !error && movies.length > 0 && <div className="movie-grid">{movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}</div>}
        {!isLoading && !error && movies.length > 0 && (
          <nav className="pagination" aria-label="Movie pages">
            <button type="button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button type="button" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
              Next
            </button>
          </nav>
        )}
      </section>

    </>
  );
}

function App() {
  const { error: wishlistError } = useWishlist();

  return (
    <BrowserRouter>
      <main className="app-shell">
        <header className="app-header">
          <a className="wordmark" href="/" aria-label="Filmera home">Filmera</a>
          <div className="header-rule" aria-hidden="true" />
          <nav className="header-nav" aria-label="Primary navigation">
            <Link className="header-label" to="/">Movie discovery / 01</Link>
            <Link className="wishlist-nav" to="/wishlist">Wishlist</Link>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<MovieList />} />
          <Route path="/movies/:id" element={<MovieDetails />} />
          <Route path="/wishlist" element={<WishlistView />} />
        </Routes>
        {wishlistError && <div className="wishlist-error" role="alert">{wishlistError}</div>}
        <footer className="app-footer"><span>Filmera</span><span>Made for movie people</span></footer>
      </main>
    </BrowserRouter>
  );
}

function AppWithWishlist() {
  return (
    <WishlistProvider>
      <App />
    </WishlistProvider>
  );
}

export default AppWithWishlist;
