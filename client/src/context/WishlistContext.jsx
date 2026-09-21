import { useEffect, useRef, useState } from 'react';
import { addWishlistMovie, fetchWishlist, removeWishlistMovie } from '../services/wishlistService';
import { WishlistContext } from './wishlistContext';

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const hasRequestedWishlist = useRef(false);

  useEffect(() => {
    if (hasRequestedWishlist.current) return undefined;
    hasRequestedWishlist.current = true;

    fetchWishlist()
      .then((movies) => setWishlist(Array.isArray(movies) ? movies : []))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  }, []);

  const toggleWishlist = async (movie) => {
    setError('');
    const existingMovie = wishlist.find((item) => item.movieId === movie.id);

    try {
      if (existingMovie) {
        await removeWishlistMovie(movie.id);
        setWishlist((currentWishlist) => currentWishlist.filter((item) => item.movieId !== movie.id));
      } else {
        const savedMovie = await addWishlistMovie(movie);
        setWishlist((currentWishlist) => [savedMovie, ...currentWishlist]);
      }
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  };

  const removeMovie = async (movieId) => {
    setError('');
    try {
      await removeWishlistMovie(movieId);
      setWishlist((currentWishlist) => currentWishlist.filter((item) => item.movieId !== movieId));
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  };

  const value = {
    wishlist,
    isLoading,
    error,
    isWishlisted: (movieId) => wishlist.some((movie) => movie.movieId === movieId),
    toggleWishlist,
    removeMovie
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}