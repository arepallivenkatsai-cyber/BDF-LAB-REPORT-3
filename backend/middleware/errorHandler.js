/**
 * Centralized Error Handling Middlewares
 */

/**
 * 404 Not Found handler for undefined routes
 */
function notFoundHandler(req, res, next) {
    res.status(404).json({
        message: `Endpoint ${req.method} ${req.originalUrl} not found.`
    });
}

/**
 * Global 500 error handler
 */
function errorHandler(err, req, res, next) {
    console.error('[Error Handler]', err);

    const statusCode = err.statusCode || err.status || 500;
    const response = {
        message: err.message || 'Internal server error.'
    };

    if (process.env.NODE_ENV !== 'production' && err.stack) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
}

module.exports = {
    notFoundHandler,
    errorHandler
};

