const { getPrinterInfo } = require('../controllers/printerController');
const { submitPrintJob, getJobStatus, getAllJobs } = require('../controllers/printJobController');
const { renderPrinterInfo } = require('../views/templates');

async function setupRoutes(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    let result;

    // Print job submission endpoint
    if (req.method === 'POST' && req.url.startsWith('/api/print/')) {
        result = await submitPrintJob(req, res);
    }
    // Job status endpoint
    else if (req.method === 'GET' && req.url.startsWith('/api/job/')) {
        result = getJobStatus(req, res);
    }
    // All jobs list endpoint
    else if (req.method === 'GET' && req.url === '/api/jobs') {
        result = getAllJobs(req, res);
    }
    // Default printer information endpoint
    else if (req.method === 'GET' && req.url === '/') {
        result = await getPrinterInfo(req, res);
        if (result.status === 200) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(renderPrinterInfo(result.data, new Date()));
            return;
        }
    } else {
        result = { 
            status: 404, 
            data: { error: 'Endpoint not found' }
        };
    }

    // Send JSON response for API endpoints
    res.writeHead(result.status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.data));
}

module.exports = setupRoutes;