require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDatabase } = require('./config/database');

const healthRoutes = require('./routes/healthRoutes');
const movieRoutes = require('./routes/movieRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', healthRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/wishlist', wishlistRoutes);

app.use(notFound);
app.use(errorHandler);

connectDatabase();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
