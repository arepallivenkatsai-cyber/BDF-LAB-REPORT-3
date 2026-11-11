/**
 * Genuine Debugging Reproduction and Demonstration Script
 * Demonstrates the 4 classic backend errors and their exact solutions:
 * 1. EADDRINUSE (Port conflict)
 * 2. Wrong import path (Cannot find module)
 * 3. Database table-name typo (no such table)
 * 4. Missing await (Asynchronous Promise serialization issue)
 */

const http = require('http');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function testEADDRINUSE() {
    console.log('\n======================================================================');
    console.log('DEBUGGING CASE 1: EADDRINUSE (Port Conflict)');
    console.log('======================================================================');
    
    const port = 3099;
    const server1 = http.createServer((req, res) => res.end('Server 1'));
    
    await new Promise((resolve) => server1.listen(port, resolve));
    console.log(`[Setup] First server successfully bound and listening on port ${port}.`);

    console.log(`[Trigger] Now attempting to start a second server on the SAME port ${port}...`);
    
    await new Promise((resolve) => {
        const server2 = http.createServer((req, res) => res.end('Server 2'));
        server2.on('error', (err) => {
            console.log(`[Error Captured] Error Code: ${err.code}`);
            console.log(`[Error Captured] System Message: ${err.message}`);
            console.log(`[Explanation] Node.js cannot bind two TCP servers to the identical port simultaneously.`);
            console.log(`[Fix Applied] Checking environment variable PORT or dynamically switching to fallback port ${port + 1}:`);
            
            const serverFixed = http.createServer((req, res) => res.end('Server Fixed'));
            serverFixed.listen(port + 1, () => {
                console.log(`[Resolution Verified] Fallback server successfully started on port ${port + 1}.`);
                serverFixed.close();
                server1.close(resolve);
            });
        });
        server2.listen(port);
    });
}

function testWrongImportPath() {
    console.log('\n======================================================================');
    console.log('DEBUGGING CASE 2: Wrong Import Path (Cannot Find Module)');
    console.log('======================================================================');

    const wrongPath = './controller/booksController'; // Missing 's' in controllers folder
    console.log(`[Trigger] Attempting to import non-existent path: require('${wrongPath}')...`);
    
    try {
        require(wrongPath);
    } catch (err) {
        console.log(`[Error Captured] Error Code: ${err.code}`);
        console.log(`[Error Captured] System Message: ${err.message}`);
        console.log(`[Explanation] The directory 'controller' does not exist; the project uses 'controllers'.`);
        
        const correctPath = './controllers/booksController';
        console.log(`[Fix Applied] Correcting require path to: require('${correctPath}')...`);
        const moduleLoaded = require(correctPath);
        console.log(`[Resolution Verified] Module successfully imported! Exported methods: ${Object.keys(moduleLoaded).join(', ')}`);
    }
}

async function testDatabaseTableTypo() {
    console.log('\n======================================================================');
    console.log('DEBUGGING CASE 3: Database Table Typo (no such table)');
    console.log('======================================================================');

    const db = await open({
        filename: ':memory:',
        driver: sqlite3.Database
    });
    await db.exec('CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author TEXT, price REAL);');
    await db.run('INSERT INTO books (title, author, price) VALUES (?, ?, ?)', ['Clean Code', 'Robert Martin', 30]);

    console.log(`[Trigger] Executing query with typo in table name: "SELECT * FROM book" (singular instead of "books")...`);
    
    try {
        await db.all('SELECT * FROM book');
    } catch (err) {
        console.log(`[Error Captured] Database Error: ${err.message}`);
        console.log(`[Explanation] SQLite engine failed SQL compilation because table 'book' does not exist in schema.`);
        
        console.log(`[Fix Applied] Correcting SQL statement to: "SELECT * FROM books"...`);
        const result = await db.all('SELECT * FROM books');
        console.log(`[Resolution Verified] Query executed successfully. Retrieved records count: ${result.length}`);
        console.log(`[Sample Record]`, result[0]);
    }
    await db.close();
}

async function testMissingAwait() {
    console.log('\n======================================================================');
    console.log('DEBUGGING CASE 4: Missing Await (Asynchronous Database Operation)');
    console.log('======================================================================');

    const db = await open({
        filename: ':memory:',
        driver: sqlite3.Database
    });
    await db.exec('CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author TEXT, price REAL);');
    await db.run('INSERT INTO books (title, author, price) VALUES (?, ?, ?)', ['Node.js in Action', 'Mike Cantelon', 35]);

    console.log(`[Trigger] Executing database query WITHOUT await: const books = db.all('SELECT * FROM books');`);
    
    // Buggy execution: missing await
    const unawaitedResult = db.all('SELECT * FROM books');
    console.log(`[Error Captured] Type of result: ${typeof unawaitedResult}`);
    console.log(`[Error Captured] Is Promise: ${unawaitedResult instanceof Promise}`);
    console.log(`[Error Captured] JSON.stringify(unawaitedResult): "${JSON.stringify(unawaitedResult)}"`);
    console.log(`[Error Captured] Accessing unawaitedResult.length: ${unawaitedResult.length} (Undefined!)`);
    console.log(`[Explanation] Because db.all returns a Promise, omitting 'await' causes Express to serialize an unresolved Promise, returning '{}' to the client!`);

    console.log(`[Fix Applied] Adding 'await' keyword: const books = await db.all('SELECT * FROM books');`);
    const awaitedResult = await unawaitedResult;
    console.log(`[Resolution Verified] Awaited result is Array: ${Array.isArray(awaitedResult)}`);
    console.log(`[Resolution Verified] Data resolved correctly: length = ${awaitedResult.length}, title = "${awaitedResult[0].title}"`);

    await db.close();
}

async function runAllDebugTests() {
    console.log('======================================================================');
    console.log('STARTING GENUINE BACKEND DEBUGGING REPRODUCTION SUITE');
    console.log('======================================================================');
    await testEADDRINUSE();
    testWrongImportPath();
    await testDatabaseTableTypo();
    await testMissingAwait();
    console.log('\n======================================================================');
    console.log('ALL 4 DEBUGGING SCENARIOS SUCCESSFULLY DEMONSTRATED AND RESOLVED.');
    console.log('======================================================================\n');
}

if (require.main === module) {
    runAllDebugTests();
}

module.exports = { runAllDebugTests };

