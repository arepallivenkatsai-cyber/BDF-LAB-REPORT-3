require('dotenv').config();
const express = require('express');
const { initializeDatabase } = require('./config/database');
const booksRouter = require('./routes/books');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3100;

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// Root welcome & health route
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Backend Development Fundamentals - Lab 03 REST API is running successfully.',
        university: 'Aurora University',
        subject: 'Backend Development Fundamentals',
        lab: 'Lab Report 03 - REST API, Query Parameters, Validation and Debugging',
        student: 'A.VENKATA SAI (252U1R5010)',
        endpoints: {
            getAllBooks: 'GET /books',
            getBookById: 'GET /books/:id',
            createBook: 'POST /books',
            updateBook: 'PUT /books/:id',
            deleteBook: 'DELETE /books/:id'
        }
    });
});

// Mount books API routes
app.use('/books', booksRouter);

// 404 handler
app.use(notFoundHandler);

// 500 Centralized error handler
app.use(errorHandler);

/**
 * Starts the HTTP server after initializing the database
 */
async function startServer() {
    try {
        await initializeDatabase();
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`====================================================`);
            console.log(` Server listening on http://localhost:${PORT}`);
            console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(` Ready to receive API requests.`);
            console.log(`====================================================`);
        });

        // Handle EADDRINUSE error gracefully if needed
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`[Fatal] Port ${PORT} is already in use (EADDRINUSE). Please choose another port or terminate the conflicting process.`);
            } else {
                console.error('[Fatal] Server error:', err);
            }
        });

        return server;
    } catch (err) {
        console.error('[Fatal] Failed to initialize database and start server:', err);
        process.exit(1);
    }
}

// Automatically start if executed directly
if (require.main === module) {
    startServer();
}

module.exports = { app, startServer };

