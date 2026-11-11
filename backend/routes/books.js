const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController');
const {
    validateBook,
    validateBookUpdate,
    validateBookId,
    validateQueryParams
} = require('../middleware/validator');

/**
 * @route   GET /books
 * @desc    Get all books with optional search_q, price filtering, sorting, pagination
 */
router.get('/', validateQueryParams, booksController.getAllBooks);

/**
 * @route   GET /books/:id
 * @desc    Get a single book by ID
 */
router.get('/:id', validateBookId, booksController.getBookById);

/**
 * @route   POST /books
 * @desc    Create a new book with body validation
 */
router.post('/', validateBook, booksController.createBook);

/**
 * @route   PUT /books/:id
 * @desc    Update an existing book by ID
 */
router.put('/:id', validateBookId, validateBookUpdate, booksController.updateBook);

/**
 * @route   DELETE /books/:id
 * @desc    Delete a book by ID
 */
router.delete('/:id', validateBookId, booksController.deleteBook);

module.exports = router;

