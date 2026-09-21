import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchMovieDetails } from '../services/movieService';
import { useWishlist } from '../context/useWishlist';

const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

function formatDate(date) {
  if (!date) return 'Release date unknown';

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(`${date}T00:00:00`));
}

function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { error: wishlistError, isWishlisted, toggleWishlist } = useWishlist();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    fetchMovieDetails(id)
      .then((movieDetails) => {
        if (isMounted) setMovie(movieDetails);
      })
      .catch((requestError) => {
        if (isMounted) setError(requestError.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return <div className="state-message details-state" role="status"><span className="loader" aria-hidden="true" /><p>Loading movie details...</p></div>;
  }

  if (error || !movie) {
    return (
      <div className="state-message state-error details-state" role="alert">
        <p>{error || 'Movie details are unavailable.'}</p>
        <button className="back-button" type="button" onClick={() => navigate(-1)}>Back to movies</button>
      </div>
    );
  }

  const posterUrl = movie.poster_path ? `${POSTER_BASE_URL}${movie.poster_path}` : null;
  const rating = typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : 'N/A';
  const genres = Array.isArray(movie.genres) ? movie.genres : [];
  const wishlisted = isWishlisted(movie.id);

  const handleWishlistClick = async () => {
    try {
      await toggleWishlist(movie);
    } catch {
      // The shared wishlist state exposes the user-facing error.
    }
  };

  return (
    <section className="details-view" aria-labelledby="movie-title">
      <button className="back-button" type="button" onClick={() => navigate(-1)}>← Back to movies</button>
      <div className="details-content">
        <div className="details-poster-wrap">
          {posterUrl ? <img className="details-poster" src={posterUrl} alt={`${movie.title} poster`} /> : <div className="poster-placeholder">No poster</div>}
        </div>
        <div className="details-copy">
          <p className="eyebrow">Movie details</p>
          <h1 id="movie-title">{movie.title || 'Untitled movie'}</h1>
          <div className="details-meta">
            <span>{formatDate(movie.release_date)}</span>
            <span>★ {rating}</span>
            {movie.vote_count != null && <span>{movie.vote_count.toLocaleString()} votes</span>}
            {movie.runtime != null && <span>{movie.runtime} min</span>}
          </div>
          <button className={`details-wishlist ${wishlisted ? 'is-wishlisted' : ''}`} type="button" onClick={handleWishlistClick}>
            {wishlisted ? '♥ Saved to wishlist' : '♡ Add to wishlist'}
          </button>
          {wishlistError && <p className="wishlist-action-error" role="alert">{wishlistError}</p>}
          {genres.length > 0 && <p className="genre-list">{genres.map((genre) => genre.name).join(' / ')}</p>}
          <p className="overview">{movie.overview || 'No description is available for this movie.'}</p>
        </div>
      </div>
    </section>
  );
}

export default MovieDetails;