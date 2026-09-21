import { Link } from 'react-router-dom';
import MovieCard from './MovieCard';
import { useWishlist } from '../context/useWishlist';

function wishlistMovieToCard(movie) {
  return {
    id: movie.movieId,
    title: movie.title,
    poster_path: movie.posterPath,
    release_date: movie.releaseDate,
    vote_average: movie.rating
  };
}

function WishlistView() {
  const { wishlist, isLoading, error } = useWishlist();

  return (
    <section className="wishlist-view" aria-labelledby="wishlist-title">
      <div className="wishlist-heading">
        <div>
          <p className="eyebrow">Your saved films</p>
          <h1 id="wishlist-title">Wishlist</h1>
        </div>
        <Link className="back-button" to="/">Back to discovery</Link>
      </div>

      {isLoading && <div className="state-message" role="status"><span className="loader" aria-hidden="true" /><p>Loading your wishlist...</p></div>}
      {!isLoading && error && <div className="state-message state-error" role="alert"><p>{error}</p><span>Try refreshing once the backend and database are available.</span></div>}
      {!isLoading && !error && wishlist.length === 0 && (
        <div className="state-message" role="status">
          <p>Your wishlist is empty.</p>
          <Link className="back-button" to="/">Explore popular movies</Link>
        </div>
      )}
      {!isLoading && wishlist.length > 0 && (
        <div className="movie-grid wishlist-grid">
          {wishlist.map((movie) => <MovieCard key={movie.movieId} movie={wishlistMovieToCard(movie)} />)}
        </div>
      )}
    </section>
  );
}

export default WishlistView;