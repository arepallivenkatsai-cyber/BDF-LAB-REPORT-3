const { getDb } = require('../config/database');

/**
 * Controller handling all Book REST API endpoints
 */

/**
 * GET /books
 * Supports query parameters:
 *  - search_q: Partial title search using SQL LIKE
 *  - min_price: Filter books with price >= min_price
 *  - max_price: Filter books with price <= max_price
 *  - order_by: Sorting column (id, title, author, price, created_at)
 *  - order: Sort direction (ASC, DESC)
 *  - limit: Pagination record limit
 *  - offset: Pagination record offset
 */
async function getAllBooks(req, res, next) {
    try {
        const db = getDb();

        const search_q = req.query.search_q ? req.query.search_q.trim() : null;
        const min_price = req.query.min_price !== undefined ? Number(req.query.min_price) : null;
        const max_price = req.query.max_price !== undefined ? Number(req.query.max_price) : null;
        const order_by = req.query.order_by || 'id';
        const order = req.query.order || 'ASC';
        const limit = req.query.limit !== undefined ? Number(req.query.limit) : 10;
        const offset = req.query.offset !== undefined ? Number(req.query.offset) : 0;

        // Build WHERE clauses dynamically with parameter binding
        const conditions = [];
        const params = [];

        // 1. Partial title search using SQL LIKE
        if (search_q) {
            conditions.push('title LIKE ?');
            params.push(`%${search_q}%`);
        }

        // 2. Price range filtering
        if (min_price !== null && max_price !== null) {
            conditions.push('price BETWEEN ? AND ?');
            params.push(min_price, max_price);
        } else if (min_price !== null) {
            conditions.push('price >= ?');
            params.push(min_price);
        } else if (max_price !== null) {
            conditions.push('price <= ?');
            params.push(max_price);
        }

        const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Query total count for metadata
        const countQuery = `SELECT COUNT(*) as total FROM books ${whereSql}`;
        const countResult = await db.get(countQuery, params);
        const total = countResult ? countResult.total : 0;

        // Query paginated data
        // Note: order_by and order have already been strictly validated against allowlists in middleware
        const dataQuery = `SELECT * FROM books ${whereSql} ORDER BY ${order_by} ${order} LIMIT ? OFFSET ?`;
        const dataParams = [...params, limit, offset];
        const books = await db.all(dataQuery, dataParams);

        res.status(200).json({
            message: 'Books retrieved successfully',
            total,
            count: books.length,
            limit,
            offset,
            data: books
        });
    } catch (err) {
        next(err);
    }
}

/**
 * GET /books/:id
 * Retrieves a single book by ID
 */
async function getBookById(req, res, next) {
    try {
        const db = getDb();
        const id = req.params.id;

        const book = await db.get('SELECT * FROM books WHERE id = ?', [id]);

        if (!book) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        res.status(200).json({
            message: 'Book retrieved successfully',
            data: book
        });
    } catch (err) {
        next(err);
    }
}

/**
 * POST /books
 * Creates a new book resource
 */
async function createBook(req, res, next) {
    try {
        const db = getDb();
        const { title, author, price } = req.body;

        const result = await db.run(
            'INSERT INTO books (title, author, price) VALUES (?, ?, ?)',
            [title, author, price]
        );

        const newBook = await db.get('SELECT * FROM books WHERE id = ?', [result.lastID]);

        res.status(201).json({
            message: 'Book created successfully',
            data: newBook
        });
    } catch (err) {
        next(err);
    }
}

/**
 * PUT /books/:id
 * Updates an existing book resource
 */
async function updateBook(req, res, next) {
    try {
        const db = getDb();
        const id = req.params.id;

        // Check if book exists
        const existingBook = await db.get('SELECT * FROM books WHERE id = ?', [id]);
        if (!existingBook) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        const updatedTitle = req.body.title !== undefined ? req.body.title : existingBook.title;
        const updatedAuthor = req.body.author !== undefined ? req.body.author : existingBook.author;
        const updatedPrice = req.body.price !== undefined ? req.body.price : existingBook.price;

        await db.run(
            'UPDATE books SET title = ?, author = ?, price = ? WHERE id = ?',
            [updatedTitle, updatedAuthor, updatedPrice, id]
        );

        const updatedBook = await db.get('SELECT * FROM books WHERE id = ?', [id]);

        res.status(200).json({
            message: 'Book updated successfully',
            data: updatedBook
        });
    } catch (err) {
        next(err);
    }
}

/**
 * DELETE /books/:id
 * Deletes a book resource
 */
async function deleteBook(req, res, next) {
    try {
        const db = getDb();
        const id = req.params.id;

        // Check if book exists
        const existingBook = await db.get('SELECT * FROM books WHERE id = ?', [id]);
        if (!existingBook) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        await db.run('DELETE FROM books WHERE id = ?', [id]);

        res.status(200).json({
            message: 'Book deleted successfully',
            data: existingBook
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook
};

