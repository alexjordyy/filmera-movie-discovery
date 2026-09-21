const getHealth = (req, res) => {
  res.json({
    status: 'ok',
    message: 'Movie API server is running'
  });
};

module.exports = { getHealth };
