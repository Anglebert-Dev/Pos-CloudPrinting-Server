// src/utils/logger.js
const fs = require('fs');
const path = require('path');
const config = require('../config');

function ensureLogDirectory() {
    if (!fs.existsSync(config.logPath)) {
        fs.mkdirSync(config.logPath, { recursive: true });
    }
}

function logRequest(req) {
    const logMessage = `${new Date().toISOString()} - Request: ${req.url}\n`;
    fs.appendFileSync(path.join(config.logPath, 'access.log'), logMessage);
}

function logError(error) {
    const logMessage = `${new Date().toISOString()} - Error: ${error.message}\n${error.stack}\n`;
    fs.appendFileSync(path.join(config.logPath, 'error.log'), logMessage);
}

module.exports = { ensureLogDirectory, logRequest, logError };