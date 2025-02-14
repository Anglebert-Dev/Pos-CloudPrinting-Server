const path = require('path');

module.exports = {
    port: 5000,
    logPath: path.join(__dirname, '../logs'),
    uploadPath: path.join(__dirname, '../uploads'),
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedFileTypes: ['.pdf', '.txt', '.doc', '.docx']
};
