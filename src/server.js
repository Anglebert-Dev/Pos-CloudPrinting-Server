const http = require('http');
const config = require('./config');
const { ensureLogDirectory, logRequest } = require('./utils/logger');
const setupRoutes = require('./routes');

// Ensure log directory exists
ensureLogDirectory();

const server = http.createServer((req, res) => {
    logRequest(req);
    setupRoutes(req, res);
});

server.listen(config.port, () => {
    console.log(`Server running at http://localhost:${config.port}/`);
});
