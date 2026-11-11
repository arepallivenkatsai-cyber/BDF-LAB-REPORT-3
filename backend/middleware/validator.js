/**
 * Request validation middlewares for Book REST API
 */

/**
 * Validates request body for creating a book (POST /books)
 */
function validateBook(req, res, next) {
    const { title, author, price } = req.body;
    const errors = [];

    // Check title
    if (title === undefined || title === null || typeof title !== 'string' || title.trim() === '') {
        errors.push('The "title" field is required and must be a non-empty string.');
    }

    // Check author
    if (author === undefined || author === null || typeof author !== 'string' || author.trim() === '') {
        errors.push('The "author" field is required and must be a non-empty string.');
    }

    // Check price
    if (price === undefined || price === null || price === '') {
        errors.push('The "price" field is required and must be a valid number.');
    } else {
        const numPrice = Number(price);
        if (isNaN(numPrice) || typeof price === 'boolean') {
            errors.push('The "price" field must be a valid numeric value.');
        } else if (numPrice < 0) {
            errors.push('The "price" field cannot be negative.');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: 'Validation failed: ' + errors.join(' '),
            errors
        });
    }

    // Sanitize and attach parsed price
    req.body.title = title.trim();
    req.body.author = author.trim();
    req.body.price = Number(price);

    next();
}

/**
 * Validates request body for updating a book (PUT /books/:id)
 */
function validateBookUpdate(req, res, next) {
    const { title, author, price } = req.body;
    const errors = [];

    if (title === undefined && author === undefined && price === undefined) {
        return res.status(400).json({
            message: 'Validation failed: At least one field (title, author, price) must be provided for update.'
        });
    }

    if (title !== undefined) {
        if (typeof title !== 'string' || title.trim() === '') {
            errors.push('The "title" field must be a non-empty string.');
        } else {
            req.body.title = title.trim();
        }
    }

    if (author !== undefined) {
        if (typeof author !== 'string' || author.trim() === '') {
            errors.push('The "author" field must be a non-empty string.');
        } else {
            req.body.author = author.trim();
        }
    }

    if (price !== undefined) {
        const numPrice = Number(price);
        if (isNaN(numPrice) || typeof price === 'boolean' || price === '') {
            errors.push('The "price" field must be a valid numeric value.');
        } else if (numPrice < 0) {
            errors.push('The "price" field cannot be negative.');
        } else {
            req.body.price = numPrice;
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: 'Validation failed: ' + errors.join(' '),
            errors
        });
    }

    next();
}

/**
 * Validates route parameter :id
 */
function validateBookId(req, res, next) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: 'Invalid book ID. It must be a positive integer.'
        });
    }
    req.params.id = id;
    next();
}

/**
 * Validates query parameters for GET /books
 */
function validateQueryParams(req, res, next) {
    const { search_q, order_by, order, limit, offset, min_price, max_price } = req.query;
    const errors = [];

    // Allowlist for sorting column
    const allowedOrderBy = ['id', 'title', 'author', 'price', 'created_at'];
    if (order_by !== undefined) {
        const normalizedOrderBy = String(order_by).trim().toLowerCase();
        if (!allowedOrderBy.includes(normalizedOrderBy)) {
            errors.push(`Invalid 'order_by' parameter '${order_by}'. Allowed columns: ${allowedOrderBy.join(', ')}.`);
        } else {
            req.query.order_by = normalizedOrderBy;
        }
    }

    // Allowlist for sorting direction
    const allowedOrder = ['ASC', 'DESC'];
    if (order !== undefined) {
        const normalizedOrder = String(order).trim().toUpperCase();
        if (!allowedOrder.includes(normalizedOrder)) {
            errors.push(`Invalid 'order' parameter '${order}'. Allowed values: ASC, DESC.`);
        } else {
            req.query.order = normalizedOrder;
        }
    }

    // Validate limit
    if (limit !== undefined) {
        const numLimit = Number(limit);
        if (!Number.isInteger(numLimit) || numLimit <= 0) {
            errors.push("Invalid 'limit' parameter. It must be a positive integer greater than 0.");
        } else {
            req.query.limit = numLimit;
        }
    }

    // Validate offset
    if (offset !== undefined) {
        const numOffset = Number(offset);
        if (!Number.isInteger(numOffset) || numOffset < 0) {
            errors.push("Invalid 'offset' parameter. It must be a non-negative integer (>= 0).");
        } else {
            req.query.offset = numOffset;
        }
    }

    // Validate min_price
    let parsedMin = null;
    if (min_price !== undefined) {
        const numMin = Number(min_price);
        if (isNaN(numMin) || numMin < 0 || min_price === '') {
            errors.push("Invalid 'min_price' parameter. It must be a non-negative numeric value.");
        } else {
            parsedMin = numMin;
            req.query.min_price = numMin;
        }
    }

    // Validate max_price
    let parsedMax = null;
    if (max_price !== undefined) {
        const numMax = Number(max_price);
        if (isNaN(numMax) || numMax < 0 || max_price === '') {
            errors.push("Invalid 'max_price' parameter. It must be a non-negative numeric value.");
        } else {
            parsedMax = numMax;
            req.query.max_price = numMax;
        }
    }

    // Check cross-validation if both min_price and max_price are valid
    if (parsedMin !== null && parsedMax !== null && parsedMin > parsedMax) {
        errors.push(`'min_price' (${parsedMin}) cannot be greater than 'max_price' (${parsedMax}).`);
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: 'Query parameter validation failed: ' + errors.join(' '),
            errors
        });
    }

    next();
}

module.exports = {
    validateBook,
    validateBookUpdate,
    validateBookId,
    validateQueryParams
};

