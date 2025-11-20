/**
 * 404 Not Found middleware
 * Catches all unmatched routes
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND'
  });
};

module.exports = { notFound };
