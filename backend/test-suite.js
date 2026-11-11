/**
 * Comprehensive Automated Test Suite for Lab 03 REST API
 * Tests all 18 required test cases and prints detailed request/response evidence.
 */

const BASE_URL = 'http://localhost:3100';

async function request(title, num, method, endpoint, body = null) {
    console.log(`\n======================================================================`);
    console.log(`TEST CASE ${num}: ${title}`);
    console.log(`----------------------------------------------------------------------`);
    console.log(`HTTP Request: ${method} ${BASE_URL}${endpoint}`);
    if (body) {
        console.log(`Request Body:\n${JSON.stringify(body, null, 2)}`);
    }

    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        if (body) {
            options.body = JSON.stringify(body);
        }

        const res = await fetch(`${BASE_URL}${endpoint}`, options);
        const data = await res.json();

        console.log(`HTTP Status: ${res.status} ${res.statusText}`);
        console.log(`Response JSON:\n${JSON.stringify(data, null, 2)}`);

        return { status: res.status, data };
    } catch (err) {
        console.error(`Request Failed:`, err.message);
        return { error: err.message };
    }
}

async function runAllTests() {
    console.log(`\n======================================================================`);
    console.log(`STARTING LAB 03 COMPREHENSIVE REST API TEST SUITE (18 TEST CASES)`);
    console.log(`Aurora University - Backend Development Fundamentals - Lab 03`);
    console.log(`Student: A.VENKATA SAI (252U1R5010)`);
    console.log(`======================================================================\n`);

    // 1. GET all books
    await request('GET all books', 1, 'GET', '/books');

    // 2. GET books with search_q
    await request('GET books with search_q (search_q=JavaScript)', 2, 'GET', '/books?search_q=JavaScript');

    // 3. GET books with ascending sorting
    await request('GET books with ascending sorting (order_by=price&order=ASC)', 3, 'GET', '/books?order_by=price&order=ASC');

    // 4. GET books with descending sorting
    await request('GET books with descending sorting (order_by=price&order=DESC)', 4, 'GET', '/books?order_by=price&order=DESC');

    // 5. GET books with limit and offset
    await request('GET books with limit and offset (limit=3&offset=2)', 5, 'GET', '/books?limit=3&offset=2');

    // 6. GET books using minimum price
    await request('GET books using minimum price (min_price=40)', 6, 'GET', '/books?min_price=40');

    // 7. GET books using maximum price
    await request('GET books using maximum price (max_price=30)', 7, 'GET', '/books?max_price=30');

    // 8. GET books using both price filters
    await request('GET books using both price filters (min_price=25&max_price=42)', 8, 'GET', '/books?min_price=25&max_price=42');

    // 9. POST a valid book
    const postRes = await request('POST a valid book', 9, 'POST', '/books', {
        title: 'Mastering Full-Stack Development',
        author: 'Joel Prashanth D',
        price: 49.99
    });
    const createdId = postRes.data && postRes.data.data ? postRes.data.data.id : null;

    // 10. POST without title
    await request('POST without title', 10, 'POST', '/books', {
        author: 'Joel Prashanth D',
        price: 49.99
    });

    // 11. POST without author
    await request('POST without author', 11, 'POST', '/books', {
        title: 'Book Without Author',
        price: 29.99
    });

    // 12. POST with invalid price
    await request('POST with invalid price (non-numeric "free")', 12, 'POST', '/books', {
        title: 'Free Open Source Software Guide',
        author: 'Richard Stallman',
        price: 'free_of_cost'
    });

    // 13. PUT an existing book
    const targetId = createdId || 1;
    await request(`PUT an existing book (ID: ${targetId})`, 13, 'PUT', `/books/${targetId}`, {
        title: 'Mastering Full-Stack Development (2nd Edition)',
        author: 'Joel Prashanth D',
        price: 54.99
    });

    // 14. PUT a nonexistent book
    await request('PUT a nonexistent book (ID: 99999)', 14, 'PUT', '/books/99999', {
        title: 'Ghost Book',
        author: 'Nobody',
        price: 99.00
    });

    // 15. DELETE an existing book
    await request(`DELETE an existing book (ID: ${targetId})`, 15, 'DELETE', `/books/${targetId}`);

    // 16. DELETE a nonexistent book
    await request('DELETE a nonexistent book (ID: 99999)', 16, 'DELETE', '/books/99999');

    // 17. Test invalid sorting parameters
    await request('Test invalid sorting parameters (order_by=hacked_col&order=RANDOM)', 17, 'GET', '/books?order_by=hacked_col&order=RANDOM');

    // 18. Test invalid pagination parameters
    await request('Test invalid pagination parameters (limit=-5&offset=abc)', 18, 'GET', '/books?limit=-5&offset=abc');

    console.log(`\n======================================================================`);
    console.log(`ALL 18 TEST CASES COMPLETED.`);
    console.log(`======================================================================\n`);
}

module.exports = { runAllTests };

if (require.main === module) {
    runAllTests();
}

