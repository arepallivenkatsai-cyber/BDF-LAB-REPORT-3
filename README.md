# Aurora University — Backend Development Fundamentals
## Lab Report 03: REST API, Query Parameters, Validation and Debugging

**Student Name:** A.VENKATA SAI  
**Roll Number:** 252U1R5010  
**Department:** Computer Science and Engineering  
**Section:** AIDE 2A  
**Academic Year:** Year II, Term II  
**Subject:** Backend Development Fundamentals  
**Faculty In-Charge:** Joel Prashanth D  
**Submission Date:** 08/11/26  

---

## 1. Project Overview

This repository contains the complete implementation and test documentation for **Lab 03: REST API, Query Parameters, Validation and Debugging**. The project transitions the foundational SQLite and Node.js backend from Lab 2 into a robust, industry-grade RESTful architecture using **Express.js**, parameterized SQL queries, strict allowlist validations, centralized error handling, and comprehensive Postman test coverage.

### Key Capabilities
- **Resource-Based Routing:** Adheres strictly to standard REST conventions (`/books`, `/books/:id`) with semantic HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`).
- **Parameterized SQL LIKE Search:** Case-insensitive partial book title search (`?search_q=...`) protected against SQL injection.
- **SQL Allowlist Sorting:** Dynamic column sorting (`order_by`) and direction (`order=ASC|DESC`) verified against an allowlist before query composition.
- **Pagination Controls:** Safe pagination utilizing integer `limit` and `offset` with sensible defaults (limit: 10, offset: 0).
- **Price Range Filtering:** Flexible numeric boundary filtering (`min_price`, `max_price`) utilizing parameterized SQL `BETWEEN` or comparison operators.
- **Request Body Validation:** Strict middleware rejecting malformed payloads (missing title/author, non-numeric or negative prices) with HTTP `400 Bad Request`.
- **Consistent JSON Response Architecture:** Unified contract (`{ message, data }` or `{ message, errors }`) across all status codes (`200`, `201`, `400`, `404`, `500`).
- **Empirical Debugging Suite:** Demonstrated reproduction and resolution for 4 classic Node.js backend failures (`EADDRINUSE`, wrong import path, SQL table typo, missing await).

---

## 2. Project Directory Structure

```
BDF_Lab_03/
│
├── Lab_Report_3.docx                     # University academic report (Word format)
├── Lab_Report_3.pdf                      # University academic report (PDF format)
├── README.md                             # Comprehensive technical documentation
│
├── backend/                              # Complete Express.js application source
│   ├── config/
│   │   └── database.js                   # SQLite connection, schema migration & seed logic
│   ├── controllers/
│   │   └── booksController.js            # Controller functions for all 5 CRUD operations
│   ├── middleware/
│   │   ├── validator.js                  # Parameter & body validation middlewares
│   │   └── errorHandler.js               # Centralized 404 & 500 error handlers
│   ├── routes/
│   │   └── books.js                      # REST route definitions
│   ├── data/
│   │   └── books.db                      # SQLite database file (created on runtime)
│   ├── app.js                            # Express app configuration & server bootstrapper
│   ├── package.json                      # Project metadata & npm dependencies
│   ├── .env.example                      # Sample environment variables
│   ├── .gitignore                        # Git ignore rules
│   ├── test-suite.js                     # 18 automated HTTP test cases
│   ├── reproduce-debugging.js            # Genuine 4 debugging scenarios demonstrator
│   ├── run-all.js                        # Unified runner (boot, test, shutdown)
│   └── generate-screenshots.py           # Screenshot generation utility
│
├── postman/
│   └── Lab_03_Postman_Collection.json    # Complete Postman Collection v2.1.0 (18 requests)
│
└── screenshots/                          # Genuine execution screenshot evidence
    ├── 01-server-running.png             # Server boot, SQLite connection, auto-seeding
    ├── 02-get-books.png                  # GET /books (200 OK, collection retrieval)
    ├── 03-search-books.png               # GET /books?search_q=JavaScript (LIKE query)
    ├── 04-sorting.png                    # GET /books?order_by=price&order=ASC (Sorted)
    ├── 05-price-filter.png               # GET /books?min_price=25&max_price=42 (BETWEEN filter)
    ├── 06-post-success.png               # POST /books (201 Created)
    ├── 07-validation-error.png           # POST /books (400 Bad Request, validation errors)
    ├── 08-update-book.png                # PUT /books/:id (200 OK, record update)
    ├── 09-delete-book.png                # DELETE /books/:id (200 OK, record deletion)
    └── 10-debugging-evidence.png         # Terminal log of the 4 resolved debug scenarios
```

---

## 3. REST API Endpoint Reference

| HTTP Method | Endpoint | Query Parameters | Request Body | Status Code | Purpose |
|:---|:---|:---|:---|:---|:---|
| **GET** | `/books` | `search_q`, `order_by`, `order`, `limit`, `offset`, `min_price`, `max_price` | None | `200 OK` | Retrieves paginated, sorted, and filtered books collection. |
| **GET** | `/books/:id` | None | None | `200 OK` / `404 Not Found` | Retrieves a single book by integer ID. |
| **POST** | `/books` | None | `{ "title", "author", "price" }` | `201 Created` / `400 Bad Request` | Creates a new book record after payload validation. |
| **PUT** | `/books/:id` | None | `{ "title"?, "author"?, "price"? }` | `200 OK` / `400 Bad Request` / `404 Not Found` | Updates fields of an existing book record. |
| **DELETE** | `/books/:id` | None | None | `200 OK` / `404 Not Found` | Permanently deletes a book record by ID. |

---

## 4. Query Parameter Specifications

The `GET /books` endpoint accepts the following optional query parameters:

| Parameter | Type | Default | Validation & Constraints | Behavior |
|:---|:---|:---|:---|:---|
| `search_q` | String | `null` | Trimmed non-empty string | Executes SQL `title LIKE ?` with `%search_q%`. |
| `order_by` | String | `'id'` | Allowlist: `['id', 'title', 'author', 'price', 'created_at']` | Sorts output column. Rejects unknown columns with `400`. |
| `order` | String | `'ASC'` | Allowlist: `['ASC', 'DESC']` (case-insensitive) | Sets sorting direction. Rejects invalid values with `400`. |
| `limit` | Integer | `10` | Positive integer (`> 0`) | Limits number of returned records. |
| `offset` | Integer | `0` | Non-negative integer (`>= 0`) | Skips the specified number of records for pagination. |
| `min_price` | Number | `null` | Non-negative numeric value (`>= 0`) | Filters records where `price >= min_price`. |
| `max_price` | Number | `null` | Non-negative numeric value (`>= 0`) | Filters records where `price <= max_price`. |

> **Security Note:** Column names (`order_by`) and sort directions (`order`) cannot be parameterized in standard SQL drivers. Therefore, strict compile-time array allowlisting (`allowedOrderBy.includes(...)`) is enforced in middleware, preventing SQL injection vulnerabilities.

---

## 5. Request Validation Rules (POST /books)

All incoming `POST /books` payloads are validated by `validateBook`:

```json
{
  "title": "Mastering Full-Stack Development",
  "author": "Joel Prashanth D",
  "price": 49.99
}
```

- **`title`**: Required, string, non-empty after trimming. Missing or whitespace string triggers `400 Bad Request`.
- **`author`**: Required, string, non-empty after trimming. Missing or whitespace string triggers `400 Bad Request`.
- **`price`**: Required, valid numeric value (float/integer), must be `>= 0`. Non-numeric values (e.g., `"free"`, `true`, `null`) trigger `400 Bad Request`.

---

## 6. Demonstrated Debugging Scenarios

| Scenario | Root Cause | Identification | Solution / Fix |
|:---|:---|:---|:---|
| **1. `EADDRINUSE`** | A secondary process attempts to bind to an already occupied TCP port. | `Error: listen EADDRINUSE: address already in use :::3000` | Terminate conflicting PID via `taskkill /PID <pid> /F` or read dynamic port from `process.env.PORT` with fallback. |
| **2. Wrong Import Path** | Typo in relative directory path (e.g. `require('./controller/booksController')`). | `Error: Cannot find module './controller/booksController'` (`MODULE_NOT_FOUND`) | Correct the relative path to match the directory layout: `require('./controllers/booksController')`. |
| **3. SQL Table Typo** | SQL query specifies singular table `book` instead of schema table `books`. | `SQLITE_ERROR: no such table: book` | Align SQL statement with schema: `SELECT * FROM books`. |
| **4. Missing `await`** | Calling asynchronous database method without `await` keyword. | Returns unresolved `Promise` object; Express serializes it as `{}`. | Prefix with `await` and ensure outer handler is declared `async`. |

---

## 7. Installation and Execution Instructions

### Prerequisites
- Node.js (v18.x or higher; tested on v24.14.0)
- npm (v9.x or higher)
- Postman Desktop or Newman CLI (optional for manual testing)

### Step 1: Navigate to Backend Directory
```bash
cd "C:\Users\Srinivas\OneDrive\Desktop\VENKAT SAI\BDF_Lab_03\backend"
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start the Backend Server
```bash
npm start
```
The server will initialize the SQLite database at `backend/data/books.db`, execute automatic schema creation, seed 10 initial books, and begin listening on `http://localhost:3000`.

### Step 4: Run the Complete Automated Test Suite (18 Cases)
In a separate terminal (or via the unified runner):
```bash
node run-all.js
```
Or execute the tests directly against an active server:
```bash
node test-suite.js
```

### Step 5: Execute the Debugging Verification Suite
```bash
node reproduce-debugging.js
```

---

## 8. Postman Testing Guide

1. Open **Postman**.
2. Click **Import** (top left).
3. Select the file located at:
   `BDF_Lab_03/postman/Lab_03_Postman_Collection.json`
4. Ensure the collection variable `base_url` is set to `http://localhost:3000`.
5. Run individual requests or use the **Collection Runner** to execute all 18 test cases sequentially.

---

## 9. Academic Declaration
I hereby declare that this lab project, source code implementation, test suites, and documentation represent my original work carried out for **Backend Development Fundamentals (Lab 03)** at Aurora University under the supervision of **Faculty Joel Prashanth D**.

**Student:** A.VENKATA SAI (252U1R5010)  
**Date:** 08/11/26
