import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useWishlist } from '../context/useWishlist';

const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

function formatReleaseDate(date) {
  if (!date) return 'Release date unknown';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(`${date}T00:00:00`));
}

function MovieCard({ movie }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [isSaving, setIsSaving] = useState(false);
  const posterUrl = movie.poster_path
    ? `${POSTER_BASE_URL}${movie.poster_path}`
    : null;
  const rating = typeof movie.vote_average === 'number'
    ? movie.vote_average.toFixed(1)
    : 'N/A';
  const wishlisted = isWishlisted(movie.id);

  const handleWishlistClick = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isSaving) return;
    setIsSaving(true);
    try {
      await toggleWishlist(movie);
    } catch {
      // The shared wishlist state exposes the user-facing error.
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Link className="movie-card" to={`/movies/${movie.id}`} aria-label={`View details for ${movie.title}`}>
      <div className="poster-wrap">
        {posterUrl ? (
          <img className="movie-poster" src={posterUrl} alt={`${movie.title} poster`} loading="lazy" />
        ) : (
          <div className="poster-placeholder" aria-label="Poster unavailable">No poster</div>
        )}
        <span className="rating" aria-label={`Rating ${rating} out of 10`}>
          <span aria-hidden="true">★</span> {rating}
        </span>
        <button className={`wishlist-toggle ${wishlisted ? 'is-wishlisted' : ''}`} type="button" onClick={handleWishlistClick} disabled={isSaving} aria-label={wishlisted ? `Remove ${movie.title} from wishlist` : `Add ${movie.title} to wishlist`}>
          {wishlisted ? '♥' : '♡'}
        </button>
      </div>
      <div className="movie-info">
        <h2>{movie.title}</h2>
        <p>{formatReleaseDate(movie.release_date)}</p>
      </div>
    </Link>
  );
}

export default MovieCard;