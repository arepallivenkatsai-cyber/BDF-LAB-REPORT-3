/**
 * Unified Runner: Starts the Server, Executes All 18 Test Cases, and Closes Cleanly
 */

const { startServer } = require('./app');
const { closeDatabase } = require('./config/database');
const { runAllTests } = require('./test-suite');

async function main() {
    console.log('>>> Initializing Server for Automated Test Run...');
    const server = await startServer();

    // Small delay to ensure port is listening
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
        await runAllTests();
    } catch (err) {
        console.error('Test Suite encountered an error:', err);
    } finally {
        console.log('>>> Tests Finished. Shutting down server and closing database...');
        server.close(async () => {
            await closeDatabase();
            console.log('>>> Test runner exited cleanly.');
            process.exit(0);
        });
    }
}

main();

