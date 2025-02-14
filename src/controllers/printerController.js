const printerService = require('../services/printerService');

async function getPrinterInfo(req, res) {
    try {
        const result = await printerService.getPrinters();
        console.log(result);
        
        return { status: 200, data: result };
    } catch (error) {
        return { status: 500, error: 'Unable to fetch printer information' };
    }
}

module.exports = { getPrinterInfo };