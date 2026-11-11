const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

let dbInstance = null;

/**
 * Initializes and connects to the SQLite database.
 * Automatically creates the `books` table and seeds default records if empty.
 */
async function initializeDatabase() {
    if (dbInstance) {
        return dbInstance;
    }

    const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'books.db');

    // Ensure directory exists
    const fs = require('fs');
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    dbInstance = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    // Enable foreign keys
    await dbInstance.run('PRAGMA foreign_keys = ON;');

    // Create books table
    await dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            price REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Check if table is empty, if so, seed sample data
    const countResult = await dbInstance.get('SELECT COUNT(*) as count FROM books');
    if (countResult.count === 0) {
        const seedBooks = [
            ['Clean Code', 'Robert C. Martin', 32.50],
            ['The Pragmatic Programmer', 'Andrew Hunt & David Thomas', 41.99],
            ['JavaScript: The Good Parts', 'Douglas Crockford', 25.00],
            ['Design Patterns', 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', 48.00],
            ["You Don't Know JS Yet", 'Kyle Simpson', 19.99],
            ['Node.js Design Patterns', 'Mario Casciaro', 39.50],
            ['Designing Data-Intensive Applications', 'Martin Kleppmann', 45.00],
            ['Refactoring', 'Martin Fowler', 38.00],
            ['Eloquent JavaScript', 'Marijn Haverbeke', 27.95],
            ['Introduction to Algorithms', 'Thomas H. Cormen', 65.00]
        ];

        const insertStmt = await dbInstance.prepare(
            'INSERT INTO books (title, author, price) VALUES (?, ?, ?)'
        );

        for (const book of seedBooks) {
            await insertStmt.run(book);
        }
        await insertStmt.finalize();
        console.log('[Database] Seeded 10 initial sample books.');
    }

    console.log(`[Database] Connected successfully to SQLite at: ${dbPath}`);
    return dbInstance;
}

/**
 * Returns the active database instance.
 */
function getDb() {
    if (!dbInstance) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return dbInstance;
}

/**
 * Closes the database connection.
 */
async function closeDatabase() {
    if (dbInstance) {
        await dbInstance.close();
        dbInstance = null;
        console.log('[Database] Connection closed.');
    }
}

module.exports = {
    initializeDatabase,
    getDb,
    closeDatabase
};

