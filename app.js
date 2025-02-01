const http = require('http');
const port = 3000;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello, World!\n');
});

// Export the server for testing
module.exports = server;

// Start the server if this file is run directly
if (require.main === module) {
    server.listen(port, () => {
        console.log(`Server running at http://localhost:${port}/`);
    });
}

