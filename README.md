# Filmera – Movie Discovery App

Filmera is a responsive movie discovery application built with React and Vite. It uses a Node.js and Express backend to access TMDB movie data and MongoDB to persist the wishlist.

## Features

- Discover popular movies
- Search movies
- Filter by categories and genres
- Sort by popularity, rating, or release date
- Page-based movie pagination
- Movie details with poster, overview, release date, rating, vote count, genres, and runtime when available
- Persistent wishlist
- MongoDB wishlist persistence
- TMDB API integration through the Node/Express backend
- Five-minute in-memory backend caching for TMDB GET requests
- Loading, empty, and error states
- Responsive UI
- Back navigation that preserves browsing state, including search, filters, sorting, and page

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS
- React Router

### Backend

- Node.js
- Express
- Axios
- dotenv

### Database

- MongoDB
- Mongoose

### External API

- TMDB API

## Architecture and Data Flow

Movie discovery requests follow this flow:

```text
React frontend -> Node/Express backend -> TMDB API
```

Wishlist requests follow this flow:

```text
React frontend -> Node/Express backend -> MongoDB
```

The TMDB API key is read by the backend from `process.env.TMDB_API_KEY`. It is never placed in frontend code or returned in API responses.

## Project Structure

```text
trackzio-movie-app/
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       ├── main.jsx
│       ├── components/
│       │   ├── MovieCard.jsx
│       │   ├── MovieDetails.jsx
│       │   └── WishlistView.jsx
│       ├── context/
│       │   ├── WishlistContext.jsx
│       │   ├── useWishlist.js
│       │   └── wishlistContext.js
│       └── services/
│           ├── movieService.js
│           └── wishlistService.js
└── server/
    ├── .env.example
    ├── package.json
    ├── server.js
    ├── config/
    │   └── database.js
    ├── controllers/
    │   ├── healthController.js
    │   ├── movieController.js
    │   └── wishlistController.js
    ├── middleware/
    │   ├── errorHandler.js
    │   └── notFound.js
    ├── models/
    │   └── wishlistMovie.js
    ├── routes/
    │   ├── healthRoutes.js
    │   ├── movieRoutes.js
    │   └── wishlistRoutes.js
    └── services/
        └── tmdbService.js
```

## Setup

### Requirements

- Node.js 20.19 or newer is recommended for the current Vite toolchain
- npm
- MongoDB running locally or a reachable MongoDB deployment
- A TMDB API key

### Install dependencies

From the project root, install each application separately:

```bash
cd server
npm install

cd ../client
npm install
```

### Configure the backend

Create `server/.env` with values for your environment:

```env
PORT=5000
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_API_KEY=your_tmdb_api_key
MONGODB_URI=mongodb://127.0.0.1:27017/trackzio
```

Keep `server/.env` private. Do not put `TMDB_API_KEY` in the client application.

## API Endpoints

The backend runs on `http://localhost:5000` by default.

### Health

```text
GET /api/health
```

### Movies

```text
GET /api/movies?search=<query>&genre=<tmdb_genre_id>&sort=<sort_value>&page=<page>
GET /api/movies/popular?page=<page>
GET /api/movies/:id
```

`/api/movies` supports popular listings when no search is supplied, TMDB search when `search` is present, and TMDB discover requests for genre/sort listings. Supported sort values used by the application are:

- `popularity.desc`
- `vote_average.desc`
- `primary_release_date.desc`

The frontend sends genre IDs such as `28` for Action and `27` for Horror.

### Wishlist

```text
GET /api/wishlist
POST /api/wishlist
DELETE /api/wishlist/:movieId
```

A wishlist POST expects movie snapshot data in the request body, for example:

```json
{
  "movieId": 550,
  "title": "Fight Club",
  "posterPath": "/path-to-poster.jpg",
  "releaseDate": "1999-10-15",
  "rating": 8.4
}
```

## Technical Decisions

- **Backend API boundary:** All TMDB requests go through Node/Express so the API key remains private and frontend code only communicates with the application backend.
- **MongoDB wishlist storage:** Wishlist records persist across refreshes, browser sessions, and backend restarts instead of relying on browser-only storage.
- **In-memory caching:** TMDB GET responses are cached for five minutes to avoid repeated upstream requests without adding Redis or another external service.
- **Deterministic cache keys:** Keys include the endpoint and relevant search, genre, sort, page, or movie ID values. Different pages, filters, searches, and details requests cannot share a cache entry accidentally.
- **Pagination:** TMDB `page`, `total_pages`, and `total_results` values are passed through the backend and used by the frontend’s Previous and Next controls. Search, genre, and sort values remain in the listing URL so details Back navigation restores the same browsing state.
- **Search requests:** Search is submitted with Enter or the Search button. Typing in the search field alone does not send API requests; the application does not use live-search requests or a debounce loop.
- **Duplicate wishlist prevention:** The Mongoose wishlist model has a unique indexed `movieId`. Duplicate additions return HTTP `409`.

## Error Handling

The application handles:

- Loading states while movie, details, or wishlist data is requested
- Empty movie results and empty wishlists
- Backend and TMDB API failures
- Invalid wishlist movie IDs with HTTP `400`
- Missing wishlist records with HTTP `404`
- Duplicate wishlist additions with HTTP `409`
- Unavailable MongoDB with HTTP `503`
- Temporary external TMDB failures with a safe frontend message and useful backend logging

TMDB has intermittently returned connection resets such as `ECONNRESET` in some server-side network requests. These are external-service or network-path limitations; the backend reports them as temporary movie-service failures and does not cache failed responses.

## Assumptions and Limitations

- The wishlist is currently global to the configured MongoDB database; there is no authentication or user-specific wishlist separation.
- The TMDB cache is in-memory and process-local, so it is cleared when the backend restarts and is not shared between multiple backend instances.
- The frontend uses the backend’s configured local URL, `http://localhost:5000`.
- Search genre filtering is applied to the TMDB search results returned for the requested page rather than being a separate TMDB search endpoint capability.
- The backend starts even when MongoDB is unavailable, while wishlist operations return an availability error until the database connection is ready.
- The backend package currently has no automated test script; validation is performed through build, lint, syntax, startup, and endpoint checks.

## AI Usage

AI like chatgpt and claude were used during development for implementation assistance, debugging, code review, and documentation. The developer reviewed and tested the resulting implementation.

## Future Improvements

- Distributed caching for multiple backend instances
- Authentication and user-specific wishlists
- Automated backend and frontend tests
- More robust retry and exponential backoff for external API failures
- Deployment and production infrastructure

## Running the Application

Start the backend in one terminal:

```bash
cd server
npm install
npm run dev
```

Start the frontend in a separate terminal:

```bash
cd client
npm install
npm run dev
```

Vite will print the frontend development URL. The backend is available at `http://localhost:5000`.

## TMDB Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.
